<?php 
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if(!defined("WC_PAYMENT_TOKEN_HPAY_TYPE")){
	define("WC_PAYMENT_TOKEN_HPAY_TYPE","hpay");
}

class WC_Payment_Token_HPay extends WC_Payment_Token {
	
	protected $type = WC_PAYMENT_TOKEN_HPAY_TYPE;
	protected $extra_data = array();
	
	private $_token_data = null;
	private $_user_tokens = null;
	
	protected function get_hook_prefix() {
		return 'woocommerce_payment_token_hpay_get_';
	}
	
	public function validate() {
		return true;
	}
	
	public function merchant_site_uid(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["merchant_site_uid"];
		}catch(Throwable $ex){
			hpay_write_log("error",$ex);
			return null;
		}
	}
	
	public function hpaymethodtype(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["hpaymethodtype"];
		}catch(Throwable $ex){
			hpay_write_log("error",$ex);
			return null;
		}
	}
	
	public function vault_card_brand(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["vault_card_brand"];
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function vault_exp(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			if(isset($this->_token_data["vault_exp"]))
				return $this->_token_data["vault_exp"];
			else 
				return "";
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function vault_card_umask(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["vault_card_umask"];
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function vault_token_uid(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["vault_token_uid"];
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function vault_scope(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["vault_scope"];
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function vault_onlyforuser(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			
			return $this->_token_data["vault_onlyforuser"];
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function token_time(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			if(isset($this->_token_data["token_time"]))
				return $this->_token_data["token_time"];
			else
				return "--";
			
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function hpay_language(){
		try{
			if(!$this->_token_data)
				$this->_token_data = json_decode(parent::get_token(),true);
			
			if(!$this->_token_data)
				return null;
			if(isset($this->_token_data["language"]))
				return $this->_token_data["language"];
			else
				return "en";
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public function set_default($default){
		if(!$this->get_id()){
			return parent::set_default($default);
		}
		global $wpdb;
		
			
		try{
			$currently_is_default = $this->is_default();
			if(!!$default != !!$currently_is_default){
				if($this->_user_tokens && isset($this->_user_tokens[$this->get_id()])){
					$this->_user_tokens[$this->get_id()]->is_default = $default;
				}
				$wpdb->query($wpdb->prepare("UPDATE {$wpdb->prefix}woocommerce_payment_tokens SET is_default = %d WHERE token_id = %d", $default ? 1: 0, $this->get_id()));
				if($default){
					$wpdb->query($wpdb->prepare("UPDATE {$wpdb->prefix}woocommerce_payment_tokens SET is_default = 0 WHERE gateway_id = %s and user_id = %d", 'hpay',$this->get_user_id()));
				}
			}
			
		}catch(Throwable $ex){
			//
		}
		return $default;
	}
	
	public function is_default(){
		if(!$this->get_id()){
			return parent::is_default();
		}
		global $wpdb;
		try{
			
			global $hpay_utoken_hash;
			if(!isset($hpay_utoken_hash)){
				$hpay_utoken_hash = array();
			}
			
			if(!$this->_user_tokens){
				if(isset($hpay_utoken_hash[$this->get_user_id()])){
					$this->_user_tokens = $hpay_utoken_hash[$this->get_user_id()];
				}else{
					$res = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE user_id = %d", $this->get_user_id()));
					$this->_user_tokens = array_column($res, null, 'token_id');
					$hpay_utoken_hash[$this->get_user_id()] = $this->_user_tokens;
				}
			}
			
			$default = false;
			if($this->_user_tokens && isset($this->_user_tokens[$this->get_id()])){
				$default = $this->_user_tokens[$this->get_id()]->is_default;
			}else{
				$default = $wpdb->get_col($wpdb->prepare("SELECT is_default FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE token_id = %d", $this->get_id()));	
			}
			
		}catch(Throwable $ex){
			//
		}
		return $default;
	}
	
	public static function create_hpay_token($customer_user_id, $merchant_site_uid, $hpaymethodtype, $vault_card_brand, $vault_card_umask, $vault_exp, $vault_token_uid, $vault_scope, $vault_onlyforuser, $hpay_language = "en"){
		try{
			global $wpdb;
			
			if(!$customer_user_id){
				$customer_user_id = get_current_user_id();
			}
			
			if(!$customer_user_id)
				return null;
			
			$default = true;
			$token   = null;
			$existing_token = null;
			
			// $n = 0;
			// do{
				// $n++;
				// $existing_token = WC_Payment_Token_HPay::has_hpay_vault_token_uid($vault_token_uid, $customer_user_id, null, null, $vault_card_umask);
				// if($existing_token){
					// $default = $existing_token->is_default();
					// $existing_token->delete();
				// }
			// }while($existing_token && $n < 10);
			
			$existing_tokens = WC_Payment_Token_HPay::get_hpay_tokens($customer_user_id, null,  null, $vault_card_umask);
			foreach($existing_tokens as $existing_token){
				if($existing_token->vault_card_umask() == $vault_card_umask){
					//$default = $existing_token->is_default();
					$existing_token->delete();	
					try{
						$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE token_id = %d", $existing_token->get_id()));
					}catch(Throwable $delex){
						//
					}
				}
			}
			
			$token = new WC_Payment_Token_HPay();
			$token->set_user_id($customer_user_id);
			$token->set_token(json_encode(array(
				"merchant_site_uid"   => $merchant_site_uid,
				"vault_card_brand"    => $vault_card_brand,
				"vault_card_umask"    => $vault_card_umask,
				"vault_exp"           => $vault_exp,
				"hpaymethodtype"      => $hpaymethodtype,
				"vault_token_uid"     => $vault_token_uid,
				"vault_onlyforuser"   => $vault_onlyforuser,
				"vault_scope"         => $vault_scope,
				"token_time"          => date("Y-m-d H:i"),
				"language"            => $hpay_language   
			)));
			
			$token->set_default($default);
			$token->set_gateway_id("hpay");
			$token->save();
			$token->set_default($default);
			
			return $token;
		}catch(Throwable $ex){
			return null;
		}
	}
	
	public static function get_hpay_tokens($customer_user_id = null, $hpaymethod_gateway = null,  $merchant_site_uid = null, $vault_card_umask = null){
		$filtred_tokens = array();
		
		try{
			if(!$customer_user_id){
				$customer_user_id = get_current_user_id();
			}
			
			$all_user_tokens  = WC_Payment_Tokens::get_tokens(array("user_id" => $customer_user_id, "gateway_id" => 'hpay', 'limit' => 999));
			
			if(!$merchant_site_uid){
				$merchant_site_uid = HPay_Core::instance()->getSetting("merchant_site_uid","");
			}
			
			foreach($all_user_tokens as $token_id => $token){
				if($token->get_type() == WC_PAYMENT_TOKEN_HPAY_TYPE){
					if($merchant_site_uid == $token->merchant_site_uid()){//USLESS CHECK
						if($hpaymethod_gateway){
							if($hpaymethod_gateway->hpay_method_type() != $token->hpaymethodtype()){
								continue;
							}
						}	
						
						if($vault_card_umask){
							if($vault_card_umask != $token->vault_card_umask()){
								continue;
							}
						}
						$filtred_tokens[$token_id] = $token;
					}
				}
			}
		}catch(Throwable $ex){
			
		}
		return $filtred_tokens;
	}
	
	public static function has_hpay_vault_token_uid($vault_token_uid, $customer_user_id = null, $hpaymethod_gateway = null,  $merchant_site_uid = null, $vault_card_umask = null){
		try{
			$tokens = WC_Payment_Token_HPay::get_hpay_tokens($customer_user_id, $hpaymethod_gateway,  $merchant_site_uid );
			if(!empty($tokens)){
				foreach($tokens as $token_id => $token){
					if($token->vault_token_uid() == $vault_token_uid){
						return $token;
					}
					if($customer_user_id && $vault_card_umask){
						if($token->vault_card_umask() == $vault_card_umask){
							return $token;
						}
					}
				}
			}
		}catch(Throwable $ex){
			
		}
		return null;
	}
	
	public static function destroy_hpay_tokens($customer_user_id = null, $hpaymethod_gateway = null,  $merchant_site_uid = null){
		$del_count = 0;
		try{
			
			$tokens = WC_Payment_Token_HPay::get_hpay_tokens($customer_user_id, $hpaymethod_gateway,  $merchant_site_uid );
			
			if(!empty($tokens)){
				foreach($tokens as $token_id => $token){
					$token->delete();
					$del_count++;
				}
			}
			
			return $del_count;
			
		}catch(Throwable $ex){
			return false;
		}
	}

	/**
	 * Tokens use gateway_id "hpay", but WC My Account only loads tokens whose gateway_id is a
	 * registered payment gateway id (hpaypayment-...). Merge HPay tokens back into the customer list.
	 */
	public static function filter_customer_payment_tokens( $tokens, $customer_id, $gateway_id ) {
		if ( $gateway_id !== '' && $gateway_id !== 'hpay' ) {
			return $tokens;
		}
		if ( $gateway_id === 'hpay' ) {
			return $tokens;
		}
		if ( ! class_exists( 'WC_Payment_Tokens' ) ) {
			return $tokens;
		}
		$limit = apply_filters( 'woocommerce_get_customer_payment_tokens_limit', get_option( 'posts_per_page' ) );
		$hpay_tokens = WC_Payment_Tokens::get_tokens(
			array(
				'user_id'    => $customer_id,
				'gateway_id' => 'hpay',
				'limit'      => $limit ? absint( $limit ) : 999,
			)
		);
		foreach ( $hpay_tokens as $token_id => $token ) {
			if ( ! isset( $tokens[ $token_id ] ) ) {
				$tokens[ $token_id ] = $token;
			}
		}
		return $tokens;
	}

	public static function filter_payment_methods_list_item( $item, $payment_token ) {
		if ( ! is_object( $payment_token ) || strtolower( $payment_token->get_type() ) !== 'hpay' ) {
			return $item;
		}
		$brand = method_exists( $payment_token, 'vault_card_brand' ) ? $payment_token->vault_card_brand() : '';
		$umask = method_exists( $payment_token, 'vault_card_umask' ) ? $payment_token->vault_card_umask() : '';
		$exp   = method_exists( $payment_token, 'vault_exp' ) ? $payment_token->vault_exp() : '';
		$time  = method_exists( $payment_token, 'token_time' ) ? $payment_token->token_time() : '';

		$item['hpay'] = array(
			'brand'      => $brand ? $brand : 'HPay',
			'umask'      => $umask ? $umask : '',
			'expires'    => $exp ? $exp : '',
			'token_time' => ( $time && $time !== '--' ) ? $time : '',
		);

		// Fallback text if column action is not used.
		$item['method']['brand'] = trim( ( $brand ? $brand . ': ' : '' ) . ( $umask ? $umask : '' ) );
		unset( $item['method']['last4'] );
		$item['expires'] = $exp ? $exp : esc_html__( 'N/A', 'woocommerce' );

		return $item;
	}

	public static function render_payment_methods_column_method( $method ) {
		if ( ! empty( $method['hpay'] ) ) {
			$brand = $method['hpay']['brand'];
			$umask = $method['hpay']['umask'];
			$time  = $method['hpay']['token_time'];
			echo '<span class="hpay-pmethod">';
			echo '<span class="hpay-token-brand hpay-token-brand-' . esc_attr( strtolower( $brand ) ) . '">' . esc_html( $brand ) . '</span>';
			if ( $umask ) {
				echo '<span class="hpay-pmethod-umask">' . esc_html( $umask ) . '</span>';
			}
			if ( $time ) {
				echo '<span class="hpay-pmethod-meta">' . esc_html( $time ) . '</span>';
			}
			echo '</span>';
			return;
		}

		if ( ! empty( $method['method']['last4'] ) ) {
			/* translators: 1: credit card type 2: last 4 digits */
			echo sprintf( esc_html__( '%1$s ending in %2$s', 'woocommerce' ), esc_html( wc_get_credit_card_type_label( $method['method']['brand'] ) ), esc_html( $method['method']['last4'] ) );
		} else {
			echo esc_html( wc_get_credit_card_type_label( isset( $method['method']['brand'] ) ? $method['method']['brand'] : '' ) );
		}
	}

	public static function render_payment_methods_column_expires( $method ) {
		if ( ! empty( $method['hpay'] ) ) {
			$exp = $method['hpay']['expires'];
			echo esc_html( $exp ? $exp : __( 'N/A', 'woocommerce' ) );
			return;
		}
		echo esc_html( isset( $method['expires'] ) ? $method['expires'] : '' );
	}

	public static function init_hooks() {
		add_filter( 'woocommerce_get_customer_payment_tokens', array( __CLASS__, 'filter_customer_payment_tokens' ), 10, 3 );
		add_filter( 'woocommerce_payment_methods_list_item', array( __CLASS__, 'filter_payment_methods_list_item' ), 10, 2 );
		add_action( 'woocommerce_account_payment_methods_column_method', array( __CLASS__, 'render_payment_methods_column_method' ) );
		add_action( 'woocommerce_account_payment_methods_column_expires', array( __CLASS__, 'render_payment_methods_column_expires' ) );
	}
	
};

WC_Payment_Token_HPay::init_hooks();