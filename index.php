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

if(!defined('HPAY_FATAL_DISMISS_OPTION'))
	define('HPAY_FATAL_DISMISS_OPTION', 'hpay_fatal_bootstrap_dismissed_until');

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
				'callstack' => array(),
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
				$frames = array();
				// Throw site first
				$frames[] = array(
					'file' => $payload['file'],
					'line' => $payload['line'],
					'call' => '{throw}',
				);
				if(is_object($ex) && method_exists($ex, 'getTrace')){
					$t = $ex->getTrace();
					if(is_array($t)){
						$max = 24;
						$n = 0;
						foreach($t as $frame){
							if($n >= $max){
								break;
							}
							if(!is_array($frame)){
								continue;
							}
							$call = '';
							try{
								if(!empty($frame['class'])){
									$call .= (string) $frame['class'];
									$call .= isset($frame['type']) ? (string) $frame['type'] : '::';
								}
								if(!empty($frame['function'])){
									$call .= (string) $frame['function'];
								}
								if($call !== ''){
									$call .= '()';
								}
							}catch(Throwable $e){}
							$frames[] = array(
								'file' => isset($frame['file']) ? (string) $frame['file'] : '',
								'line' => isset($frame['line']) ? (int) $frame['line'] : 0,
								'call' => $call !== '' ? $call : '{main}',
							);
							$n++;
						}
					}
				}
				$payload['callstack'] = $frames;
			}catch(Throwable $e){}

			try{
				update_option(HPAY_FATAL_OPTION, $payload, false);
			}catch(Throwable $e){}
		}catch(Throwable $e){}
	}
}

if(!function_exists('hpay_index_clear_fatal_error')){
	function hpay_index_clear_fatal_error(){
		try{
			if(function_exists('delete_option')){
				try{ delete_option(HPAY_FATAL_OPTION); }catch(Throwable $e){}
			}else if(function_exists('update_option')){
				try{ update_option(HPAY_FATAL_OPTION, null, false); }catch(Throwable $e){}
			}
			// Hide for TTL even if bootstrap keeps failing and re-stores the option.
			try{
				if(function_exists('update_option')){
					update_option(HPAY_FATAL_DISMISS_OPTION, time() + HPAY_FATAL_TTL_SEC, false);
				}
			}catch(Throwable $e){}
			return true;
		}catch(Throwable $e){}
		return false;
	}
}

if(!function_exists('hpay_index_handle_clear_fatal_request')){
	function hpay_index_handle_clear_fatal_request(){
		try{
			$asked = false;
			try{
				if(isset($_GET['hpay_clear_fatal']) && (string) $_GET['hpay_clear_fatal'] === '1'){
					$asked = true;
				}
				if(isset($_REQUEST['hpay_clear_fatal']) && (string) $_REQUEST['hpay_clear_fatal'] === '1'){
					$asked = true;
				}
			}catch(Throwable $e){}
			if(!$asked){
				return;
			}

			// Prefer admin context when detectable.
			try{
				if(function_exists('is_admin') && !is_admin()){
					return;
				}
			}catch(Throwable $e){}

			try{
				if(function_exists('current_user_can') && !current_user_can('manage_options')){
					return;
				}
			}catch(Throwable $e){}

			try{
				if(function_exists('wp_verify_nonce')){
					$nonce = '';
					if(isset($_REQUEST['_wpnonce'])){
						$nonce = (string) $_REQUEST['_wpnonce'];
					}
					if($nonce !== '' && !wp_verify_nonce($nonce, 'hpay_clear_fatal')){
						return;
					}
					// If nonce API exists but nonce missing, still allow manage_options dismiss
					// (plugin bootstrap may strip query args); capability already checked.
				}
			}catch(Throwable $e){}

			hpay_index_clear_fatal_error();

			try{
				if(function_exists('wp_safe_redirect') && function_exists('admin_url')){
					$target = admin_url('index.php');
					wp_safe_redirect($target);
					if(function_exists('exit')){
						exit;
					}
					return;
				}
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

			try{
				$until = (int) get_option(HPAY_FATAL_DISMISS_OPTION, 0);
				if($until > 0 && time() < $until){
					return null;
				}
				if($until > 0 && time() >= $until && function_exists('delete_option')){
					try{ delete_option(HPAY_FATAL_DISMISS_OPTION); }catch(Throwable $e){}
				}
			}catch(Throwable $e){}

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

			$stack_lines = array();
			try{
				$stack = (isset($opt['callstack']) && is_array($opt['callstack'])) ? $opt['callstack'] : array();
				$i = 0;
				foreach($stack as $frame){
					if(!is_array($frame)){
						continue;
					}
					$ffile = isset($frame['file']) ? (string) $frame['file'] : '';
					$fline = isset($frame['line']) ? (string) $frame['line'] : '';
					$fcall = isset($frame['call']) ? (string) $frame['call'] : '';
					$loc = $ffile !== '' ? ($ffile . ($fline !== '' && $fline !== '0' ? (':' . $fline) : '')) : '(unknown)';
					$stack_lines[] = '#' . $i . ' ' . $loc . ($fcall !== '' ? ('  ' . $fcall) : '');
					$i++;
				}
			}catch(Throwable $e){}

			$stack_html = '';
			if(!empty($stack_lines)){
				$stack_text = implode("\n", $stack_lines);
				try{
					if(function_exists('htmlspecialchars')){
						$stack_text = htmlspecialchars($stack_text, ENT_QUOTES, 'UTF-8');
					}
				}catch(Throwable $e){}
				$stack_html = '<pre style="color:#a00;background:#fff5f5;border:1px solid #f1c0c0;padding:8px;margin:0.4em 0 0.6em 0;overflow:auto;max-height:280px;font-size:11px;line-height:1.35;white-space:pre-wrap;">'
					. $stack_text
					. '</pre>';
			}

			$dismiss_btn = '';
			$dismiss_url = '';
			try{
				if(function_exists('admin_url')){
					$dismiss_url = admin_url('index.php?hpay_clear_fatal=1');
				}else{
					$dismiss_url = 'index.php?hpay_clear_fatal=1';
				}
				try{
					if(function_exists('wp_nonce_url')){
						$dismiss_url = wp_nonce_url($dismiss_url, 'hpay_clear_fatal');
					}else if(function_exists('wp_create_nonce')){
						$sep = (strpos($dismiss_url, '?') === false) ? '?' : '&';
						$dismiss_url .= $sep . '_wpnonce=' . rawurlencode(wp_create_nonce('hpay_clear_fatal'));
					}
				}catch(Throwable $e){}

				$safe_url = $dismiss_url;
				try{
					if(function_exists('esc_url')){
						$safe_url = esc_url($dismiss_url);
					}else if(function_exists('htmlspecialchars')){
						$safe_url = htmlspecialchars($dismiss_url, ENT_QUOTES, 'UTF-8');
					}
				}catch(Throwable $e){}

				$dismiss_btn = '<a href="' . $safe_url . '" id="hpay-fatal-dismiss" title="Dismiss" aria-label="Dismiss"'
					. ' style="position:absolute;top:8px;right:10px;display:inline-flex;align-items:center;justify-content:center;'
					. 'width:22px;height:22px;border-radius:50%;background:#dc3232;color:#fff;text-decoration:none;'
					. 'font-size:16px;font-weight:700;line-height:1;box-shadow:0 0 0 1px rgba(0,0,0,0.05);">'
					. '<span style="display:block;transform:translateY(2px);">&times;</span></a>';
			}catch(Throwable $e){}

			$shown = true;
			echo '<div id="hpay-fatal-notice" class="notice notice-error" style="position:relative;border-left-color:#dc3232;padding-right:36px;">';
			echo $dismiss_btn;
			echo '<p style="color:#dc3232;font-weight:700;margin:0.5em 0;">HolestPay fatal error: ' . $safe . '</p>';
			echo $stack_html;
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
			// Handle dismiss on admin_init (user/capability/nonce ready).
			try{ add_action('admin_init', 'hpay_index_handle_clear_fatal_request', 1); }catch(Throwable $e){}
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
