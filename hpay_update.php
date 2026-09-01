<?php
//HOLESTPAY 2023
if(!defined("HPAY_PRODUCTION_URL")){
	die("Direct access is not allowed");
};

// Trait constants need PHP 8.2+ — use defines for older WP hosts
if(!defined("HPAY_UPD_BUSY_SEC")){
	define("HPAY_UPD_BUSY_SEC", 10);
}
if(!defined("HPAY_UPD_MAX_ATTEMPTS")){
	define("HPAY_UPD_MAX_ATTEMPTS", 3);
}

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
		try{
			if(!headers_sent()){
				@header('Content-Type: application/json; charset=UTF-8', true);
			}
		}catch(Throwable $e){}
		
		try{
			// After 3 failed attempts — do not try again for a day
			$block_until = intval(get_option("hpay_plugin_upgrade_block_until", 0));
			if($block_until > time()){
				$left = $block_until - time();
				$this->upd_reply_json(array(
					"updated" => false,
					"error" => "DAY_BLOCKED",
					"message" => "Update blocked after " . HPAY_UPD_MAX_ATTEMPTS . " failed attempts; retry in about " . ceil($left / 3600) . "h"
				));
			}
			
			$last_call = intval(get_option("hpay_plugin_upgrade_ts", 0));
			
			// Rate limit between update *starts* (separate from in-progress hpayplg.upd lock)
			$force = isset($_GET['force']) && $_GET['force'] == '1';
			$timeout = $force ? 120 : 3600;
			
			if($last_call + $timeout > time()){
				$timeout_text = $force ? "2 minutes" : "1 hour";
				$this->upd_reply_json(array(
					"updated" => false,
					"error" => "PREVENTED!",
					"message" => "You can not call update if at least {$timeout_text} have not passed from last one"
				));
			}
			
			$plugin_idenifier = HPAY_PLUGIN;
			$plugin_slug = explode('/', $plugin_idenifier)[0];
			$plugin_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
			$upd_path = rtrim($plugin_dir, '/\\') . DIRECTORY_SEPARATOR . 'hpayplg.upd';
			
			$attempt = 1;
			
			// In-progress / retry via hpayplg.upd
			if(@file_exists($upd_path) && @is_file($upd_path)){
				$age = time() - (int)@filemtime($upd_path);
				if($age < HPAY_UPD_BUSY_SEC){
					$this->upd_reply_json(array(
						"updated" => false,
						"error" => "IN_PROGRESS",
						"message" => "Update already in progress (hpayplg.upd younger than " . HPAY_UPD_BUSY_SEC . "s)"
					));
				}
				
				// Stale journal = previous run had a problem
				$prev_attempt = $this->upd_journal_read_attempt($upd_path);
				if($prev_attempt < 1){
					$prev_attempt = 1;
				}
				
				if($prev_attempt >= HPAY_UPD_MAX_ATTEMPTS){
					hpay_write_log("error", "Update failed {$prev_attempt} times — blocking for 1 day");
					try{
						update_option("hpay_plugin_upgrade_block_until", time() + DAY_IN_SECONDS, true);
						update_option("hpay_plugin_upgrade_ts", time(), true);
					}catch(Throwable $e){}
					try{ @unlink($upd_path); }catch(Throwable $e){}
					$this->upd_reply_json(array(
						"updated" => false,
						"error" => "DAY_BLOCKED",
						"message" => "Update failed " . HPAY_UPD_MAX_ATTEMPTS . " times — will not retry for 24 hours"
					));
				}
				
				$attempt = $prev_attempt + 1;
				try{ @unlink($upd_path); }catch(Throwable $e){}
				hpay_write_log("log", "Stale hpayplg.upd (age {$age}s, attempt {$prev_attempt}) — restarting as attempt {$attempt}");
			}
			
			update_option("hpay_plugin_upgrade_ts", time(), true);
			
			delete_transient( $this->cache_key_update );
			$remote = $this->checkForUpdate();

			require_once( ABSPATH . 'wp-admin/includes/file.php');
			
			if(!$remote || !isset($remote->download_url)){
				hpay_write_log("error", "No update available or invalid download URL");
				$this->upd_reply_json(array( "updated" => false, "error" => "No update available or invalid download URL"));
			}
			
			$download_url = $remote->download_url;
			$version = isset($remote->version) ? $remote->version : '';
			
			// New journal (lock + step log + attempt). If it cannot be created, skip update and cool down.
			$this->upd_journal_start($upd_path, $version, $download_url, $attempt);
			if(!@file_exists($upd_path) || !@is_file($upd_path) || (int)@filesize($upd_path) < 1){
				hpay_write_log("error", "Could not create hpayplg.upd — update aborted, cooldown marked");
				try{
					update_option("hpay_plugin_upgrade_ts", time(), true);
				}catch(Throwable $e){}
				$this->upd_reply_json(array(
					"updated" => false,
					"error" => "NO_UPD_LOCK",
					"message" => "Could not create hpayplg.upd — update not started; will not retry for a while"
				));
			}
			$this->upd_journal_append($upd_path, "ATTEMPT", (string)$attempt);
			
			$temp_dir = get_temp_dir() . 'hpay_update_' . time() . '_' . wp_generate_password(6, false);
			if(!wp_mkdir_p($temp_dir)){
				hpay_write_log("error", "Failed to create temporary directory: {$temp_dir}");
				$this->upd_journal_append($upd_path, "ABORT", "temp_dir");
				$this->upd_fail_maybe_day_block($upd_path, $attempt);
				$this->upd_reply_json(array( "updated" => false, "error" => "Failed to create temporary directory"));
			}
			$this->upd_journal_append($upd_path, "TEMP", $temp_dir);
			
			hpay_write_log("log", "Downloading update from {$download_url}");
			$temp_file = $temp_dir . '/update.zip';
			$downloaded = $this->download_update_file($download_url, $temp_file);
			
			if(!$downloaded){
				hpay_write_log("error", "Failed to download update file from {$download_url}");
				$this->upd_journal_append($upd_path, "ABORT", "download");
				$this->delete_directory($temp_dir);
				$this->upd_fail_maybe_day_block($upd_path, $attempt);
				$this->upd_reply_json(array( "updated" => false, "error" => "Failed to download update file"));
			}
			$this->upd_journal_append($upd_path, "DOWNLOADED", $temp_file);
			
			hpay_write_log("log", "Download complete, extracting files");
			
			WP_Filesystem();
			
			$unzip_result = unzip_file($temp_file, $temp_dir);
			if(is_wp_error($unzip_result)){
				hpay_write_log("error", "Failed to extract update: " . $unzip_result->get_error_message());
				$this->upd_journal_append($upd_path, "ABORT", "unzip");
				$this->delete_directory($temp_dir);
				$this->upd_fail_maybe_day_block($upd_path, $attempt);
				$this->upd_reply_json(array( "updated" => false, "error" => "Failed to extract update: " . $unzip_result->get_error_message()));
			}
			
			$extracted_dir = null;
			$files = @scandir($temp_dir);
			if(is_array($files)){
				foreach($files as $file){
					if($file != '.' && $file != '..' && is_dir($temp_dir . '/' . $file)){
						$extracted_dir = $temp_dir . '/' . $file;
						break;
					}
				}
			}
			
			if(!$extracted_dir || !is_dir($extracted_dir)){
				hpay_write_log("error", "Could not find extracted plugin directory in {$temp_dir}");
				$this->upd_journal_append($upd_path, "ABORT", "no_extracted_dir");
				$this->delete_directory($temp_dir);
				$this->upd_fail_maybe_day_block($upd_path, $attempt);
				$this->upd_reply_json(array( "updated" => false, "error" => "Could not find extracted plugin directory"));
			}
			$this->upd_journal_append($upd_path, "EXTRACTED", $extracted_dir);
			
			hpay_write_log("log", "Copying new files (per-file .ubak + size check; index.php last)");
			$this->upd_journal_append($upd_path, "COPY_BEGIN", $extracted_dir);
			
			$failed_files = array();
			$this->copy_directory($extracted_dir, $plugin_dir, $failed_files, true, true, $upd_path);
			
			if(empty($failed_files)){
				try{
					$this->upd_journal_append($upd_path, "COMPLETE", $version);
					@unlink($upd_path);
					delete_option("hpay_plugin_upgrade_block_until");
				}catch(Throwable $e){}
			}else{
				try{
					hpay_write_log("warning", "Update completed with " . count($failed_files) . " failed file(s)");
					hpay_write_log("warning", "Failed files list: " . implode(", ", $failed_files));
					$this->upd_journal_append($upd_path, "ABORT", "copy_failed:" . count($failed_files));
					$this->upd_fail_maybe_day_block($upd_path, $attempt);
				}catch(Throwable $e){}
			}
			
			try{
				hpay_write_log("log", "Cleaning up temporary files");
				$this->delete_directory($temp_dir);
			}catch(Throwable $e){}
			
			try{
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
			}catch(Throwable $ex){
				try{
					hpay_write_log("warning", "Could not ensure active_plugins: " . $ex->getMessage());
				}catch(Throwable $e){}
			}
			
			$updated = empty($failed_files);
			$response = array(
				"updated" => $updated,
				"message" => $updated
					? "Plugin updated successfully via manual update process"
					: ("Plugin updated with " . count($failed_files) . " file(s) that failed to copy")
			);
			if(!empty($failed_files)){
				$response["failed_files"] = $failed_files;
				$response["failed_count"] = count($failed_files);
			}
			$this->upd_reply_json($response);
		}catch(Throwable $ex){
			try{
				hpay_write_log("error", $ex);
			}catch(Throwable $e){}
			try{
				while(@ob_get_level() > 0){
					@ob_end_clean();
				}
			}catch(Throwable $e){}
			$this->upd_reply_json(array(
				"updated" => false,
				"error" => "exception",
				"message" => $ex->getMessage()
			));
		}
	}
	
	/**
	 * Terminal AJAX JSON reply (Content-Type: application/json). Never returns.
	 */
	private function upd_reply_json($response){
		try{
			while(@ob_get_level() > 0){
				@ob_end_clean();
			}
		}catch(Throwable $e){}
		
		if(function_exists('wp_send_json')){
			wp_send_json($response);
		}
		
		try{
			if(!headers_sent()){
				$charset = function_exists('get_option') ? get_option('blog_charset') : 'UTF-8';
				if(!$charset){
					$charset = 'UTF-8';
				}
				@header('Content-Type: application/json; charset=' . $charset, true);
			}
		}catch(Throwable $e){}
		
		$payload = function_exists('wp_json_encode') ? wp_json_encode($response) : json_encode($response);
		if($payload === false || $payload === null){
			$payload = '{"updated":false,"error":"json_encode_failed"}';
		}
		echo $payload;
		exit;
	}
	
	private function upd_fail_maybe_day_block($upd_path, $attempt){
		try{
			if(intval($attempt) < HPAY_UPD_MAX_ATTEMPTS){
				return;
			}
			hpay_write_log("error", "Update failed on attempt {$attempt} — blocking for 1 day");
			try{
				update_option("hpay_plugin_upgrade_block_until", time() + DAY_IN_SECONDS, true);
			}catch(Throwable $e){}
			try{ @unlink($upd_path); }catch(Throwable $e){}
		}catch(Throwable $e){}
	}
	
	private function upd_journal_start($upd_path, $version, $download_url, $attempt = 1){
		try{
			$attempt = max(1, intval($attempt));
			$line = time() . "|START|" . str_replace(array("\r","\n","|"), " ", $version)
				. "|" . str_replace(array("\r","\n","|"), " ", $download_url)
				. "|ATTEMPT=" . $attempt . "\n";
			@file_put_contents($upd_path, $line, LOCK_EX);
		}catch(Throwable $e){}
	}
	
	private function upd_journal_read_attempt($upd_path){
		try{
			if(!$upd_path || !@file_exists($upd_path)){
				return 0;
			}
			$raw = @file_get_contents($upd_path);
			if(!is_string($raw) || $raw === ""){
				return 0;
			}
			$attempt = 0;
			// Prefer last ATTEMPT=N or ATTEMPT|N line
			if(preg_match_all('/(?:^|\|)ATTEMPT[=|](\d+)/m', $raw, $m)){
				$vals = $m[1];
				$attempt = intval(end($vals));
			}
			return $attempt > 0 ? $attempt : 0;
		}catch(Throwable $e){
			return 0;
		}
	}
	
	private function upd_journal_append($upd_path, $step, $detail = ""){
		try{
			if(!$upd_path){
				return;
			}
			$line = time() . "|" . str_replace(array("\r","\n","|"), " ", $step) . "|" . str_replace(array("\r","\n","|"), " ", (string)$detail) . "\n";
			@file_put_contents($upd_path, $line, FILE_APPEND | LOCK_EX);
			// Touch so "busy" age reflects recent activity during long copy
			try{ @touch($upd_path); }catch(Throwable $e){}
		}catch(Throwable $e){}
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
			
			if(!file_exists($destination) || (int)@filesize($destination) < 1){
				hpay_write_log("error", "Downloaded file missing or empty at: {$destination}");
				return false;
			}
			
			return true;
		}catch(Throwable $ex){
			hpay_write_log("error", "Download exception: " . $ex->getMessage());
			return false;
		}
	}
	
	/**
	 * Live overwrite of one file:
	 * - write to .hpaynew then rename over dest (works for self-updating PHP; direct copy often fails)
	 * - .ubak only for this file (if dest exists and non-empty)
	 * - success → delete .ubak; failure → restore from .ubak
	 */
	private function copy_one_file_with_ubak($src_path, $dest_path, &$failed_files = null, $per_file_ubak = false, $upd_path = null, $rel_for_journal = ""){
		try{
			$ubak_path = $dest_path . '.ubak';
			$tmp_path = $dest_path . '.hpaynew';
			$made_ubak = false;
			
			try{ @unlink($tmp_path); }catch(Throwable $e){}
			
			$staged = false;
			try{
				$staged = @copy($src_path, $tmp_path);
			}catch(Throwable $cex){
				$staged = false;
				hpay_write_log("error", "Stage copy exception {$src_path} -> {$tmp_path}: " . $cex->getMessage());
			}
			
			$tmp_ok = false;
			if($staged && @file_exists($tmp_path) && @is_file($tmp_path)){
				$src_size = @filesize($src_path);
				$tmp_size = @filesize($tmp_path);
				if($src_size !== false && $src_size > 0){
					$tmp_ok = ($tmp_size !== false && $tmp_size > 0);
				}else{
					$tmp_ok = ($tmp_size !== false);
				}
			}
			
			if(!$tmp_ok){
				hpay_write_log("error", "Failed to stage file (missing or 0 size): {$src_path} to {$tmp_path}");
				try{ @unlink($tmp_path); }catch(Throwable $e){}
				if($failed_files !== null){
					$failed_files[] = $src_path;
				}
				$this->upd_journal_append($upd_path, "COPY_FAIL", $rel_for_journal !== "" ? $rel_for_journal : $dest_path);
				return false;
			}
			
			if($per_file_ubak && @file_exists($dest_path) && @is_file($dest_path) && (int)@filesize($dest_path) > 0){
				try{
					if(@copy($dest_path, $ubak_path)){
						$made_ubak = true;
					}else{
						hpay_write_log("warning", "Could not create .ubak before overwrite: {$dest_path}");
					}
				}catch(Throwable $ubex){
					hpay_write_log("warning", "Exception creating .ubak for {$dest_path}: " . $ubex->getMessage());
				}
			}
			
			$replaced = false;
			try{
				// Atomic replace when possible — OK while this PHP file is still executing (old inode stays in memory)
				$replaced = @rename($tmp_path, $dest_path);
			}catch(Throwable $rex){
				$replaced = false;
			}
			
			if(!$replaced){
				try{
					$replaced = @copy($tmp_path, $dest_path);
				}catch(Throwable $cex){
					$replaced = false;
					hpay_write_log("error", "Replace copy exception {$tmp_path} -> {$dest_path}: " . $cex->getMessage());
				}
				try{ @unlink($tmp_path); }catch(Throwable $e){}
			}
			
			$dest_ok = false;
			if($replaced && @file_exists($dest_path) && @is_file($dest_path)){
				$src_size = @filesize($src_path);
				$dst_size = @filesize($dest_path);
				if($src_size !== false && $src_size > 0){
					$dest_ok = ($dst_size !== false && $dst_size > 0);
				}else{
					$dest_ok = ($dst_size !== false);
				}
			}
			
			if(!$dest_ok){
				hpay_write_log("error", "Failed to replace file (missing or 0 size): {$src_path} to {$dest_path}");
				try{ @unlink($tmp_path); }catch(Throwable $e){}
				if($failed_files !== null){
					$failed_files[] = $src_path;
				}
				$this->upd_journal_append($upd_path, "COPY_FAIL", $rel_for_journal !== "" ? $rel_for_journal : $dest_path);
				if($made_ubak && @file_exists($ubak_path) && (int)@filesize($ubak_path) > 0){
					try{
						@copy($ubak_path, $dest_path);
					}catch(Throwable $rex){}
				}
				return false;
			}
			
			if($made_ubak){
				try{
					@unlink($ubak_path);
				}catch(Throwable $uex){}
			}
			
			$this->upd_journal_append($upd_path, "COPIED", $rel_for_journal !== "" ? $rel_for_journal : $dest_path);
			return true;
		}catch(Throwable $ex){
			if($failed_files !== null){
				$failed_files[] = $src_path;
			}
			try{
				hpay_write_log("error", "copy_one_file_with_ubak exception: " . $ex->getMessage());
			}catch(Throwable $lex){}
			return false;
		}
	}
	
	/**
	 * @param bool $per_file_ubak Live overwrite: per-file .ubak
	 * @param bool $defer_root_index Copy root index.php last (Version header)
	 * @param string|null $upd_path hpayplg.upd journal
	 */
	private function copy_directory($source, $destination, &$failed_files = null, $per_file_ubak = false, $defer_root_index = false, $upd_path = null, $rel_prefix = ""){
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
			$deferred_index_src = null;
			$deferred_index_dest = null;
			$deferred_index_rel = null;
			$deferred_self_src = null;
			$deferred_self_dest = null;
			$deferred_self_rel = null;
			
			while(($file = readdir($dir)) !== false){
				if($file == '.' || $file == '..'){
					continue;
				}
				
				try{
					if(is_string($file) && strlen($file) >= 5 && substr($file, -5) === '.ubak'){
						continue;
					}
					if(is_string($file) && strlen($file) >= 8 && substr($file, -8) === '.hpaynew'){
						continue;
					}
					if($file === 'hpayplg.upd'){
						continue;
					}
					
					$src_path = $source . '/' . $file;
					$dest_path = $destination . '/' . $file;
					$rel = ($rel_prefix === "" ? $file : ($rel_prefix . '/' . $file));
					
					if(is_dir($src_path)){
						if(!$this->copy_directory($src_path, $dest_path, $failed_files, $per_file_ubak, false, $upd_path, $rel)){
							$success = false;
						}
						continue;
					}
					
					if($defer_root_index && $file === 'index.php'){
						$deferred_index_src = $src_path;
						$deferred_index_dest = $dest_path;
						$deferred_index_rel = $rel;
						continue;
					}
					
					// This trait file cannot always be overwritten in-place while running — do it last via rename
					if($defer_root_index && $file === 'hpay_update.php'){
						$deferred_self_src = $src_path;
						$deferred_self_dest = $dest_path;
						$deferred_self_rel = $rel;
						continue;
					}
					
					if(!$this->copy_one_file_with_ubak($src_path, $dest_path, $failed_files, $per_file_ubak, $upd_path, $rel)){
						$success = false;
					}
				}catch(Throwable $fex){
					$success = false;
					if($failed_files !== null){
						$failed_files[] = isset($src_path) ? $src_path : $file;
					}
					try{
						hpay_write_log("error", "Copy file loop exception: " . $fex->getMessage());
					}catch(Throwable $lex){}
				}
			}
			
			closedir($dir);
			
			if($deferred_index_src && $deferred_index_dest){
				try{
					hpay_write_log("log", "Copying index.php last-but-one (version header)");
					$this->upd_journal_append($upd_path, "INDEX_BEGIN", "index.php");
					if(!$this->copy_one_file_with_ubak($deferred_index_src, $deferred_index_dest, $failed_files, $per_file_ubak, $upd_path, $deferred_index_rel)){
						$success = false;
					}
				}catch(Throwable $iex){
					$success = false;
					if($failed_files !== null){
						$failed_files[] = $deferred_index_src;
					}
					try{
						hpay_write_log("error", "Deferred index.php copy exception: " . $iex->getMessage());
					}catch(Throwable $lex){}
				}
			}
			
			if($deferred_self_src && $deferred_self_dest){
				try{
					hpay_write_log("log", "Copying hpay_update.php last (self-replace via stage+rename)");
					$this->upd_journal_append($upd_path, "SELF_BEGIN", "hpay_update.php");
					if(!$this->copy_one_file_with_ubak($deferred_self_src, $deferred_self_dest, $failed_files, $per_file_ubak, $upd_path, $deferred_self_rel)){
						$success = false;
					}
				}catch(Throwable $sex){
					$success = false;
					if($failed_files !== null){
						$failed_files[] = $deferred_self_src;
					}
					try{
						hpay_write_log("error", "Deferred hpay_update.php copy exception: " . $sex->getMessage());
					}catch(Throwable $lex){}
				}
			}
			
			return $success;
		}catch(Throwable $ex){
			try{
				hpay_write_log("error", "Copy directory exception: " . $ex->getMessage());
			}catch(Throwable $lex){}
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
			try{
				hpay_write_log("warning", "Delete directory exception: " . $ex->getMessage());
			}catch(Throwable $e){}
			return false;
		}
	}
};
