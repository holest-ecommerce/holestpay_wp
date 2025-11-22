<?php
//HOLESTPAY 2023
if(!defined("HPAY_PRODUCTION_URL")){
	die("Direct access is not allowed");
};

trait HPay_Core_Update{
	
	public $cache_key_update = "holestpay_update";
	
	public function upgrade_setup(){
		add_action( 'wp_ajax_nopriv_update_hpay_plugin', array( $this,'update_plugin'));
		add_action( 'wp_ajax_update_hpay_plugin', array( $this,'update_plugin'));
		add_filter( 'plugins_api', array( $this,'update_info') , 20, 3 );
		add_filter( 'site_transient_update_plugins', array( $this,'run_update'));
		add_action( 'upgrader_process_complete', array( $this,'update_purge'), 10, 2 );
	}

	public function checkForUpdate(){
		try{
			$remote = get_transient( $this->cache_key_update );
			if(!$remote) {
				$remote = wp_remote_get(
					'https://holest.com/updatescheck/?sku=1017',
					array(
						'timeout' => 15,
						'headers' => array(
							'Accept' => 'application/json'
						)
					)
				);
				
				if(
					is_wp_error( $remote )
					|| 200 !== wp_remote_retrieve_response_code( $remote )
					|| empty( wp_remote_retrieve_body( $remote ) )
				) {
					return false;
				}
				set_transient( $this->cache_key_update, $remote, DAY_IN_SECONDS );
			}
			
			$remote = json_decode( wp_remote_retrieve_body( $remote ) );
			return $remote;
		}catch(Throwable $ex){
			return false;
		}
	}
	
	public function update_info( $res, $action, $args ) {
		try{
			if( 'plugin_information' !== $action ) {
				return $res;
			}

			// do nothing if it is not our plugin
			if( HPAY_PLUGIN !== $args->slug ) {
				return $res;
			}

			// get updates
			$remote = $this->checkForUpdate();

			if( ! $remote ) {
				return $res;
			}

			$res = new stdClass();

			$res->name = $remote->name;
			$res->slug = $remote->slug;
			$res->version = $remote->version;
			$res->tested = $remote->tested;
			$res->requires = $remote->requires;
			$res->author = $remote->author;
			$res->author_profile = $remote->author_profile;
			$res->download_link = $remote->download_url;
			$res->trunk = $remote->download_url;
			$res->requires_php = $remote->requires_php;
			$res->last_updated = $remote->last_updated;
			$res->wc_requires_at_least = $remote->wc_requires_at_least;
			$res->wc_tested_up_to = $remote->wc_tested_up_to;

			$res->sections = array(
				'description' => $remote->sections->description,
				'installation' => $remote->sections->installation,
				'changelog' => $remote->sections->changelog
			);

			foreach($res->sections as $section => $data){
				$res->sections[$section] = explode("\n",$res->sections[$section]);
				foreach($res->sections[$section] as $index => $line){
					$res->sections[$section][$line] = "<p>{$line}</p>";
				}
				$res->sections[$section] = implode("",$res->sections[$section]);
			}

			if( ! empty( $remote->banners ) ) {
				$res->banners = array(
					'low' => $remote->banners->low,
					'high' => $remote->banners->high
				);
			}
		}catch(Throwable $ex){
			//
		}
		
		return $res;
	}

	function run_update( $transient ) {
		try{
			if ( empty($transient->checked ) ) {
				return $transient;
			}

			$remote = $this->checkForUpdate();

			if(!isset($this->_plugin_data)){
				if( !function_exists('get_plugin_data') ){
					require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
				}
				$this->_plugin_data = get_plugin_data( HPAY_PLUGIN_FILE );
			}

			if(
				$remote
				&& version_compare( $this->_plugin_data["Version"], $remote->version, '<' )
				&& version_compare( $remote->requires, get_bloginfo( 'version' ), '<' )
				&& version_compare( $remote->requires_php, PHP_VERSION, '<' )
			) {
				$res = new stdClass();
				$res->slug = HPAY_PLUGIN;
				$res->plugin = HPAY_PLUGIN; 
				$res->new_version = $remote->version;
				$res->tested = $remote->tested;
				$res->package = $remote->download_url;
				$transient->response[ $res->plugin ] = $res;
			}
		}catch(Throwable $ex){
			//
		}

		return $transient;
	}

	function update_purge(){
		try{
			delete_transient( $this->cache_key_update );
		}catch(Throwable $ex){
			//
		}
	}

	function update_plugin(){
		@header("Content-Type: application/json");
		$last_call = intval(get_option("hpay_plugin_upgrade_ts", 0));
		
		// Check if force parameter is set
		$force = isset($_GET['force']) && $_GET['force'] == '1';
		$timeout = $force ? 120 : 3600; // 2 minutes if forced, 1 hour otherwise
		
		if($last_call + $timeout > time()){
			$timeout_text = $force ? "2 minutes" : "1 hour";
			$r = json_encode(array( "updated" => false, "error" => "PREVENTED!", "message" => "You can not call update if at least {$timeout_text} have not passed from last one"));
			echo $r;
			die;
		}
		
		update_option("hpay_plugin_upgrade_ts", time(), true);
		
		@ob_start();
		
		delete_transient( $this->cache_key_update );
		$remote = $this->checkForUpdate();

		global $upd_message;
		$upd_message = "";

		require_once( ABSPATH . 'wp-admin/includes/file.php');
		
		$plugin_idenifier = HPAY_PLUGIN;
		$updated = false;
		
		// Manual update process - download, unpack, and replace files
		if(!$remote || !isset($remote->download_url)){
			hpay_write_log("error", "No update available or invalid download URL");
			$just_dump = ob_get_clean();
			echo json_encode(array( "updated" => false, "error" => "No update available or invalid download URL"));
			die;
		}
		
		$download_url = $remote->download_url;
		$plugin_slug = explode('/', $plugin_idenifier)[0]; // e.g., 'holestpay'
		$plugin_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
		
		// Create temporary directory
		$temp_dir = get_temp_dir() . 'hpay_update_' . time();
		if(!wp_mkdir_p($temp_dir)){
			hpay_write_log("error", "Failed to create temporary directory: {$temp_dir}");
			$just_dump = ob_get_clean();
			echo json_encode(array( "updated" => false, "error" => "Failed to create temporary directory"));
			die;
		}
		
		// Download the update zip file
		hpay_write_log("log", "Downloading update from {$download_url}");
		$temp_file = $temp_dir . '/update.zip';
		$downloaded = $this->download_update_file($download_url, $temp_file);
		
		if(!$downloaded){
			hpay_write_log("error", "Failed to download update file from {$download_url}");
			$this->delete_directory($temp_dir);
			$just_dump = ob_get_clean();
			echo json_encode(array( "updated" => false, "error" => "Failed to download update file"));
			die;
		}
		
		hpay_write_log("log", "Download complete, extracting files");
		
		// Extract the zip file
		WP_Filesystem();
		global $wp_filesystem;
		
		$unzip_result = unzip_file($temp_file, $temp_dir);
		if(is_wp_error($unzip_result)){
			hpay_write_log("error", "Failed to extract update: " . $unzip_result->get_error_message());
			$this->delete_directory($temp_dir);
			$just_dump = ob_get_clean();
			echo json_encode(array( "updated" => false, "error" => "Failed to extract update: " . $unzip_result->get_error_message()));
			die;
		}
		
		hpay_write_log("log", "Extraction complete, preparing to replace files");
		
		// Find the extracted plugin directory
		$extracted_dir = null;
		$files = scandir($temp_dir);
		foreach($files as $file){
			if($file != '.' && $file != '..' && is_dir($temp_dir . '/' . $file)){
				$extracted_dir = $temp_dir . '/' . $file;
				break;
			}
		}
		
		if(!$extracted_dir || !is_dir($extracted_dir)){
			hpay_write_log("error", "Could not find extracted plugin directory in {$temp_dir}");
			$this->delete_directory($temp_dir);
			$just_dump = ob_get_clean();
			echo json_encode(array( "updated" => false, "error" => "Could not find extracted plugin directory"));
			die;
		}
		
		// Backup current plugin (optional but recommended)
		$backup_dir = $temp_dir . '/backup_' . $plugin_slug;
		if(!$this->copy_directory($plugin_dir, $backup_dir)){
			hpay_write_log("warning", "Failed to create backup of current plugin");
		}
		
		hpay_write_log("log", "Copying new files (overwriting existing)");
		// Copy new plugin files over existing ones
		$failed_files = array();
		$this->copy_directory($extracted_dir, $plugin_dir, $failed_files);
		
		$updated = true;
		$response_message = "Plugin updated successfully via manual update process";
		
		if(!empty($failed_files)){
			hpay_write_log("warning", "Update completed with " . count($failed_files) . " failed file(s)");
			hpay_write_log("warning", "Failed files list: " . implode(", ", $failed_files));
			$response_message = "Plugin updated with " . count($failed_files) . " file(s) that failed to copy";
		}else{
			hpay_write_log("log", "Files replaced successfully");
		}
		
		// Clean up temporary files
		hpay_write_log("log", "Cleaning up temporary files");
		$this->delete_directory($temp_dir);
		
		$just_dump = ob_get_clean();
		
		$response = array( 
			"updated" => $updated, 
			"message" => $response_message
		);
		
		if(!empty($failed_files)){
			$response["failed_files"] = $failed_files;
			$response["failed_count"] = count($failed_files);
		}
		
		echo json_encode($response);
		
		$active_plugins = get_option("active_plugins", false);
		if($active_plugins){
			if(!in_array("holestpay/index.php",$active_plugins)){
				if(file_exists(WP_PLUGIN_DIR . "/holestpay/index.php")){
					$active_plugins[] = "holestpay/index.php";
					update_option("active_plugins", $active_plugins, true);
					hpay_write_log("log", "Plugin ensured in active_plugins list");
				}
			}
		}
		
		die;
	}
	
	private function download_update_file($url, $destination){
		try{
			$response = wp_remote_get($url, array(
				'timeout' => 300,
				'stream' => true,
				'filename' => $destination
			));
			
			if(is_wp_error($response)){
				hpay_write_log("error", "Download error: " . $response->get_error_message());
				return false;
			}
			
			$response_code = wp_remote_retrieve_response_code($response);
			if(200 !== $response_code){
				hpay_write_log("error", "Download failed with HTTP code: {$response_code}");
				return false;
			}
			
			if(!file_exists($destination)){
				hpay_write_log("error", "Downloaded file does not exist at: {$destination}");
				return false;
			}
			
			return true;
		}catch(Throwable $ex){
			hpay_write_log("error", "Download exception: " . $ex->getMessage());
			return false;
		}
	}
	
	private function copy_directory($source, $destination, &$failed_files = null){
		try{
			if(!is_dir($source)){
				hpay_write_log("error", "Copy failed: source directory does not exist: {$source}");
				return false;
			}
			
			if(!wp_mkdir_p($destination)){
				hpay_write_log("error", "Copy failed: could not create destination directory: {$destination}");
				return false;
			}
			
			$dir = opendir($source);
			if(!$dir){
				hpay_write_log("error", "Copy failed: could not open source directory: {$source}");
				return false;
			}
			
			$success = true;
			
			while(($file = readdir($dir)) !== false){
				if($file != '.' && $file != '..'){
					$src_path = $source . '/' . $file;
					$dest_path = $destination . '/' . $file;
					
					if(is_dir($src_path)){
						// Recursively copy subdirectories
						if(!$this->copy_directory($src_path, $dest_path, $failed_files)){
							$success = false;
							// Continue with other files/directories
						}
					}else{
						// Copy individual file
						if(!@copy($src_path, $dest_path)){
							hpay_write_log("error", "Failed to copy file: {$src_path} to {$dest_path}");
							if($failed_files !== null){
								$failed_files[] = $src_path;
							}
							$success = false;
							// Continue with other files
						}
					}
				}
			}
			
			closedir($dir);
			return $success;
		}catch(Throwable $ex){
			hpay_write_log("error", "Copy directory exception: " . $ex->getMessage());
			return false;
		}
	}
	
	private function delete_directory($dir){
		try{
			if(!is_dir($dir)){
				return false;
			}
			
			$files = array_diff(scandir($dir), array('.', '..'));
			
			foreach($files as $file){
				$path = $dir . '/' . $file;
				if(is_dir($path)){
					$this->delete_directory($path);
				}else{
					@unlink($path);
				}
			}
			
			return @rmdir($dir);
		}catch(Throwable $ex){
			hpay_write_log("warning", "Delete directory exception: " . $ex->getMessage());
			return false;
		}
	}
};	