<?php
/**
 * Plugin Name: HolestPay Payments Plugin WooCommerce or Standalone 
 * Plugin URI:
 * Description: HolestPay payment system supports integration with most of the banks in the Adriatic region. Ovaj softver je vlasnistvo HOLEST E-COMMERCE D.O.O. Neovlašćenim korišćenjem ovog softver-a podležete riziku od zakonske kazne.
 * Version: 1.1.161
 * Requires at least: 4.0
 * WC requires at least: 4.2.0
 * WC tested up to: 11.0.1
 * Tested up to: 7.1.0
 * Author: HOLEST E-COMMERCE
 * Author URI: https://ecommerce.holest.com
 * Text Domain: holestpay
 * Domain Path: /languages
 */


if(!function_exists("add_action")){
	die("Direct access is not allowed");
};
 
if(isset($_GET["__hpay_skip__"])){
	return;
}

if(isset($_GET["__hpay_enable_error_reporting__"])){
	error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
	ini_set("display_errors","on");
}

if(!defined('HPAY_PRODUCTION_URL'))
	define("HPAY_PRODUCTION_URL","https://pay.holest.com");

if(!defined('HPAY_SANDBOX_URL'))
	define("HPAY_SANDBOX_URL","https://sandbox.pay.holest.com");

if(!defined('HPAY_PLUGIN'))
	define("HPAY_PLUGIN", plugin_basename( __FILE__ ));

if(!defined('HPAY_PLUGIN_PATH'))
	define("HPAY_PLUGIN_PATH", __DIR__);

if(!defined('HPAY_PLUGIN_URL'))
	define("HPAY_PLUGIN_URL", rtrim(plugin_dir_url(__FILE__),"/"));

if(!defined('HPAY_PLUGIN_FILE'))
	define("HPAY_PLUGIN_FILE",__FILE__);

if(!defined('HPAY_FATAL_OPTION'))
	define('HPAY_FATAL_OPTION', 'hpay_fatal_bootstrap_error');

if(!defined('HPAY_FATAL_TTL_SEC'))
	define('HPAY_FATAL_TTL_SEC', 600); // 10 minutes

if(!function_exists('hpay_index_store_fatal_error')){
	function hpay_index_store_fatal_error($ex){
		try{
			if(!function_exists('update_option')){
				return;
			}

			$payload = array(
				'message' => '',
				'file' => '',
				'line' => 0,
				'trace0' => null,
				'ts' => time(),
			);

			try{
				if(is_object($ex) && method_exists($ex, 'getMessage')){
					$payload['message'] = (string) $ex->getMessage();
				}else{
					$payload['message'] = (string) $ex;
				}
			}catch(Throwable $e){}

			try{
				if(is_object($ex) && method_exists($ex, 'getFile')){
					$payload['file'] = (string) $ex->getFile();
				}
				if(is_object($ex) && method_exists($ex, 'getLine')){
					$payload['line'] = (int) $ex->getLine();
				}
			}catch(Throwable $e){}

			try{
				if(is_object($ex) && method_exists($ex, 'getTrace')){
					$t = $ex->getTrace();
					if(is_array($t) && !empty($t[0])){
						$payload['trace0'] = $t[0];
					}
				}
			}catch(Throwable $e){}

			try{
				update_option(HPAY_FATAL_OPTION, $payload, false);
			}catch(Throwable $e){}
		}catch(Throwable $e){}
	}
}

if(!function_exists('hpay_index_get_fatal_error')){
	function hpay_index_get_fatal_error(){
		try{
			if(!function_exists('get_option')){
				return null;
			}
			$opt = get_option(HPAY_FATAL_OPTION, null);
			if(!is_array($opt) || empty($opt['ts'])){
				return null;
			}
			$age = time() - (int) $opt['ts'];
			if($age > HPAY_FATAL_TTL_SEC){
				try{
					if(function_exists('delete_option')){
						delete_option(HPAY_FATAL_OPTION);
					}else if(function_exists('update_option')){
						update_option(HPAY_FATAL_OPTION, null, false);
					}
				}catch(Throwable $e){}
				return null;
			}
			return $opt;
		}catch(Throwable $e){
			return null;
		}
	}
}

if(!function_exists('hpay_index_render_fatal_dashboard_notice')){
	function hpay_index_render_fatal_dashboard_notice(){
		static $shown = false;
		try{
			if($shown){
				return;
			}

			// Dashboard only when screen API works; if it does not, still attempt to show.
			try{
				if(function_exists('get_current_screen')){
					$screen = get_current_screen();
					if(is_object($screen) && isset($screen->id) && $screen->id !== 'dashboard'){
						return;
					}
				}
			}catch(Throwable $e){}

			$opt = hpay_index_get_fatal_error();
			if(!$opt || !is_array($opt)){
				return;
			}

			$msg = isset($opt['message']) ? (string) $opt['message'] : 'Unknown HolestPay bootstrap error';
			$file = isset($opt['file']) ? (string) $opt['file'] : '';
			$line = isset($opt['line']) ? (string) $opt['line'] : '';
			$left = HPAY_FATAL_TTL_SEC - (time() - (int) $opt['ts']);
			if($left < 0){
				$left = 0;
			}
			$mins = (int) ceil($left / 60);

			$details = $msg;
			if($file !== ''){
				$base = $file;
				try{
					if(function_exists('basename')){
						$base = basename($file);
					}
				}catch(Throwable $e){}
				$details .= ' @ ' . $base . ($line !== '' ? (':' . $line) : '');
			}

			$safe = $details;
			try{
				if(function_exists('htmlspecialchars')){
					$safe = htmlspecialchars($details, ENT_QUOTES, 'UTF-8');
				}
			}catch(Throwable $e){}

			$shown = true;
			echo '<div class="notice notice-error" style="border-left-color:#dc3232;">';
			echo '<p style="color:#dc3232;font-weight:700;margin:0.5em 0;">HolestPay fatal error: ' . $safe . '</p>';
			echo '<p style="color:#666;font-size:11px;margin:0 0 0.5em 0;">This notice will disappear after about 10 minutes if the error does not repeat'
				. ($mins > 0 ? ' (approx. ' . $mins . ' min left)' : '')
				. '.</p>';
			echo '</div>';
		}catch(Throwable $e){}
	}
}

if(!function_exists('hpay_index_register_fatal_dashboard_notice')){
	function hpay_index_register_fatal_dashboard_notice(){
		try{
			if(!function_exists('add_action')){
				return;
			}
			// Multiple hooks – none guaranteed; static guard prevents double output.
			try{ add_action('admin_notices', 'hpay_index_render_fatal_dashboard_notice'); }catch(Throwable $e){}
			try{ add_action('all_admin_notices', 'hpay_index_render_fatal_dashboard_notice'); }catch(Throwable $e){}
		}catch(Throwable $e){}
	}
}

try{
	require_once(__DIR__ . DIRECTORY_SEPARATOR . "hpay.php");
}catch(Throwable $ex){
	try{
		if(function_exists('hpay_write_log')){
			try{
				hpay_write_log('error', $ex);
			}catch(Throwable $e){}
		}
	}catch(Throwable $e){}

	try{
		hpay_index_store_fatal_error($ex);
	}catch(Throwable $e){}
}

try{
	hpay_index_register_fatal_dashboard_notice();
}catch(Throwable $e){
	//
}
