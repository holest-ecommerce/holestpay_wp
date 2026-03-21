<?php
//HOLESTPAY 2023
if(!function_exists("add_action")){
	die("Direct access is not allowed");
};

class HPay_Front{
	public $core = null;
	public function __construct($core){
		$this->core = $core;
		add_action( 'wp_ajax_hpay-user-operations', array( $this, 'user_operations' ));
		
		add_action( 'wp_ajax_nopriv_hpay-user-operations', array( $this, 'user_operations' ));
		
		add_action( 'woocommerce_edit_account_form', array( $this, 'add_hpay_payment_token_list'),20);
		add_action( 'woocommerce_after_account_payment_methods', array( $this, 'add_hpay_payment_token_list'));
		
		add_action( 'wp_loaded', array( $this, 'handle_buick_buy'),10,0);
	}
	
	public function init(){
		add_action('wp_enqueue_scripts',array( $this, 'enqueue_scripts' ));
		
	}
	
	public function add_hpay_payment_token_list($arg1 = null){
		
		$current_user_id = get_current_user_id();
		if($current_user_id){
			$vault_count = HPay_Core::instance()->displayUserVaults($current_user_id,null,false,__( 'Your saved payment token vault references', 'holestpay' ));
			if(!$vault_count){
				echo "<p>" . esc_attr__( 'Your have no saved payment token vault references for this site', 'holestpay' ) . "</p>";
			}
			echo "<p class='hpay-note'>" . esc_attr__("NOTE: Information needed for card payment can not be reconstructed form a vault reference, instead this data is stored with ceritied payment providers and banks. Vault reference is just a permit ticket for particular merchant to charge your card.", 'holestpay') . "</p>";
			echo "<hr />";
		}
	}
	
	public function handle_buick_buy(){
		if(hpay_read_get_parm("hpay_qbuy",null)){
			try{
				$qbuy = json_decode(base64_decode(hpay_read_get_parm("hpay_qbuy",'""')), true);
				if($qbuy){
					
					if(isset($qbuy["uid"]) && $qbuy["uid"]){
						WC()->cart->empty_cart();
						$coupon = null;
						if(isset($qbuy["discount"]) && floatval($qbuy["discount"]) > 0){
							$coupon = new WC_Coupon($qbuy["uid"]);
							if(!$coupon->get_id()) {
								$coupon = new WC_Coupon($qbuy["uid"]);
								$coupon->set_amount($qbuy["discount"]);
								$coupon->set_discount_type('percent_product');
								
								if(isset($qbuy["vdays"]) && intval($qbuy["vdays"]) > 0){
									$sdate = substr($qbuy["uid"],4);
									$sdate = substr($sdate,0,8);
									$y = substr($sdate,0,4);
									$m = substr($sdate,4,2);
									$d = substr($sdate,6,2);
									$expiration_date = strtotime("{$y}-{$m}-{$d}");
									$expiration_date += intval($qbuy["vdays"]) * 24 * 60 * 60 + 23 * 60 * 60;
									if($expiration_date < time()){
										throw new Exception("Offer expired!");
									}
									$coupon->set_date_expires($expiration_date);
								}
								
								$coupon->set_product_ids(isset($qbuy["vid"]) ? intval($qbuy["vid"]) : intval($qbuy["pid"]));
								$coupon->save();
							}
						}
						
						if(isset($qbuy["vid"])){
							$att_d = array();
							
							foreach($qbuy as $key => $val){
								if(strpos($key,"attribute_") === 0){
									$att_d[$key] = $val;
								}
							}
							WC()->cart->add_to_cart(intval($qbuy["pid"]), intval($qbuy["qty"]), intval($qbuy["vid"]),  $att_d);
						}else{
							WC()->cart->add_to_cart(intval($qbuy["pid"]), intval($qbuy["qty"]));
						}
					
						if($coupon){
							WC()->cart->apply_coupon($qbuy["uid"]);
						}
						
						wp_redirect( wc_get_checkout_url() );
						die;
					}
				}
			}catch(Throwable $ex){
				hpay_write_log("error",$ex);
			}
		}
	}
	
	
	public function user_operations(){
		$json = file_get_contents('php://input');
		if($json){
			$json = json_decode($json, true);
		}
		
		$op = hpay_read_get_parm("operation","");
		if(!$op){
			if($json){
				wp_send_json(array("error" => "Not found", "error_code" => 404),404);	
			}else{
				wp_die("Not found","404 Not found", array("response" => 404));
			}
			return;
		}
		
		$order_id = null;
		if(hpay_read_post_parm("order_id","")){
			$order_id = intval(hpay_read_post_parm("order_id",""));
		}
		
		if(!$order_id && hpay_read_post_parm("key","")){
			$order_id = wc_get_order_id_by_order_key(hpay_read_post_parm("key",""));
		}
		
		if($op == "forward_pay_request"){
			if(hpay_read_post_parm("payment_method","") && $order_id){
				$hmethod = HPay_Core::instance()->payment_method_instance(hpay_read_post_parm("payment_method",""));
				if($hmethod){
					header("Content-Type:application/json");
					wp_send_json($hmethod->process_payment($order_id),200);
				}else{
					wp_die("Method Not found","404 Method Not found", array("response" => 404));
				}
			}else{
				wp_die("Not accepatable :user_operations[1]",__("406 Not accepatable :user_operations[1]",'holestpay'), array("response" => 406));
				return;
			}
		}else if($op == "checkout_sessiom_data"){
			try{	
				if(!WC()->session){
					wp_send_json(array("error" => "wc session not initialized"),503,JSON_UNESCAPED_UNICODE);
					return;
				}
			
				$hcsd = WC()->session->get( "hpay_checkout_sessiom_data", '[]');
				
				if($hcsd){
					$hcsd = json_decode($hcsd, true);
				}else{
					$hcsd = array();
				}
				
				if(isset($hcsd["_order_id"])){
					$hcsd = array();
				}
				
				foreach($json as $key => $value){
					if(is_array($value)){
						if(isset($hcsd[$key]) && $hcsd[$key]){
							foreach($value as $k => $v){
								$hcsd[$key][$k] = $v;
								if(!$hcsd[$key][$k]) unset($hcsd[$key][$k]);
							}
						}else{
							$hcsd[$key] = $value; 
							if(!$hcsd[$key]) unset($hcsd[$key]);
						}
					}else{
						$hcsd[$key] = $value; 
						if(!$hcsd[$key]) unset($hcsd[$key]);
					}	
				}
				
				WC()->session->set( "hpay_checkout_sessiom_data", json_encode($hcsd,JSON_UNESCAPED_UNICODE));
				wp_send_json(array("received" => "ok", "current" => $hcsd),200,JSON_UNESCAPED_UNICODE);
			}catch(Throwable $ex){
				wp_die($ex->getMessage(),"400 " . $ex->getMessage(), array("response" => 400));
			}
		}else{
			if($json){
				$request_data = $json;
				if($request_data){
					header("Content-Type:application/json");
					if($op == "destroy_vault"){
						if(isset($request_data["token_id"])){	
							$token = WC_Payment_Tokens::get(intval($request_data["token_id"]));
							if($token){
								if(current_user_can('edit_others_pages') || $token->get_user_id() === get_current_user_id()){
									
									try{
										HPay_Core::instance()->destroyVaultToken($token->vault_token_uid());
									}catch(Throwable $ex){
										hpay_write_log("error",$ex);
									}
									
									$token->delete();
									wp_send_json(array("result" => "ok", "deleted" => 1),200);
									return;
								}else{
									wp_send_json(array("error" => "Not allowed", "error_code" => 403),403);
									return;
								}
							}else{
								wp_send_json(array("result" => "ok", "deleted" => 0),200);
								return;
							}
						}
					}else if($op == "default_vault"){
						if(isset($request_data["token_id"])){
							$token = WC_Payment_Tokens::get(intval($request_data["token_id"]));
							if($token){
								if(current_user_can('edit_others_pages') || $token->get_user_id() === get_current_user_id()){
									$token->set_default(true);
									$token->save();
									
									wp_send_json(array("result" => "ok", "set_default" => 1),200);
									return;
								}else{
									wp_send_json(array("error" => "Not allowed", "error_code" => 403),403);
									return;
								}
							}else{
								wp_send_json(array("error" => "Not found", "error_code" => 404),404);
								return;
							}
						}
					}else if($op == "pay_order"){
						if(isset($request_data["vault_token_uid"]) && $request_data["vault_token_uid"] == "add-token"){
							$hpayment_method_id = null;
							$hpay_paymethod = null;
							
							if(isset($request_data["hpayment_method_id"])){
								$hpay_paymethod = HPay_Core::payment_method_instance($request_data["hpayment_method_id"]);
								if($hpay_paymethod){
									$hpayment_method_id = $hpay_paymethod->hpay_id;
								}
							}
							
							if(!$hpayment_method_id){
								wp_send_json(array("error" => "Not accepatable :user_operations[2]","message" => "No such hpay method!", "error_code" => 406),406);
								return;
							}
							
							$ouuid = date('Ymd').uniqid("card-save"); 
							$current_user = wp_get_current_user();
							
							if($current_user->ID === 0){
								wp_send_json(array("error" => "Not accepatable :user_operations[3]","message" => "No user session - please log-in!", "error_code" => 406),406);
								return;
							}
							
							$pay_request = array(
								'hpaylang' => HPay_Core::hpaylang(),
								'payment_method' => $hpayment_method_id,
								'cof'            => 'required',
								'order_amount'   => 0.00,
								'order_billing'  => array(
									'email'      => $current_user->user_email,
									'first_name' => $current_user->user_firstname,
									'last_name'  => $current_user->user_lastname
								),
								'order_currency' => $hpay_paymethod->getHProp("PaymentCurrency"),
								'order_name'     => "#" . $ouuid,
								'order_uid'      => $ouuid
							);
							
							$pay_request["verificationhash"] = esc_attr(HPay_Core::instance()->payRequestSignatureHash("","",$pay_request["order_uid"],$pay_request["order_amount"], $pay_request["order_currency"],"", ""));
							
							wp_send_json(array("pay_request" => $pay_request),200);
							return;
						}else{
							if(isset($request_data["order_id"]) && $request_data["order_id"] && intval($request_data["order_id"])){
								$hpayment_method_id = null;
								$hpay_paymethod = null;
								
								if(isset($request_data["hpayment_method_id"])){
									$hpay_paymethod = HPay_Core::payment_method_instance($request_data["hpayment_method_id"]);
									if($hpay_paymethod){
										$hpayment_method_id = $hpay_paymethod->hpay_id;
									}
								}
								
								$vault_token_uid = '';
								$pms = array();
								if(isset($request_data["vault_token_uid"]) && $request_data["vault_token_uid"]){
									$vault_token_uid = $request_data["vault_token_uid"];
								}else{
									$pms = HPay_Core::payment_methods_enabled();
									if(count($pms) == 1){
										$hpay_paymethod = $pms[0];
										$hpayment_method_id = $pms[0]->hpay_id;
									}
									
									$current_user = wp_get_current_user();
									if($hpay_paymethod && $current_user->ID && !$vault_token_uid){
										$tokens = WC_Payment_Token_HPay::get_hpay_tokens($current_user->ID, $hpayment_method_id);
										foreach($tokens as $token_id => $token){
											if($token->is_default() && $token->hpaymethodtype() == $hpay_paymethod->hpay_method_type()){
												$vault_token_uid = $token->vault_token_uid();
												break;
											}
										}
									}
								}
								
								$order_id = intval($request_data["order_id"]);
								
								$cof = 'optional';
								if(HPay_Core::instance()->wc_isSubsription($order_id)){
									$cof = 'required';
								}
								
								$pay_request = HPay_Core::instance()->generateHPayRequest($order_id,$hpayment_method_id, $cof, $vault_token_uid);
								
								if(!@$pay_request["payment_method"]){
									$pay_request["payment_method"] = 'select';
								}
								
								wp_send_json(array("pay_request" => $pay_request),200);
								return;
							}else{
								wp_send_json(array("error" => "Not accepatable","message" => "ERROR: Provide valid order ID!", "error_code" => 406),406);
								return;
							}
						}
					} 
				}
			}
			wp_send_json(array("error" => "Not accepatable", "error_code" => 406, "user_operations_data" => $json),406);
		}
	}
	
	public function enqueue_scripts($for_admin = false){
		if (!wp_script_is( 'hpay_checkout_js', 'enqueued' ) ) {
			$pdata = $this->core->getPluginData();
			
			wp_enqueue_style( 'hpay_checkout_css', $this->core->plugin_url . '/assets/hpay-checkout.css', array(), $pdata["Version"] );
			wp_enqueue_script( 'hpay_checkout_js', $this->core->plugin_url . '/assets/hpay-checkout.js', $for_admin ? array("jquery","hpay_wpadmin_js") : array("jquery"), $pdata["Version"] );
			
			$data = array(
				'merchant_site_uid' => $this->core->getSetting("merchant_site_uid",null),
				'hpay_url'          => $this->core->getHPayURL(), 
				'site_url'          => rtrim(str_ireplace(array("https://","http://","/index.php"),"",get_site_url()),"/"),
				'labels'            => array(
					"error_contact_us"     => __("Error, please contact us for assitance. ","holestpay"),
					"remove_token_confirm" => __("Please confirm you want to remove payment token vault reference. If you have subscriptions with us they might get terminated if we fail to charge you for the next billing period.","holestpay"),
					"error"                => __("Error","holestpay"),
					"result"               => __("result","holestpay"),
					"Order UID"            => __("Order UID","holestpay"),
					"Authorization Code"   => __("Authorization Code","holestpay"),
					"Payment Status"          => __("Payment Status","holestpay"),
					"Transaction Status Code" => __("Transaction Status Code","holestpay"),
					"Transaction ID"          => __("Transaction ID","holestpay"),
					"Transaction Time"        => __("Transaction Time","holestpay"),
					"Status code for the 3D transaction" => __("Status code for the 3D transaction","holestpay"),
					"Amount in order currency"           => __("Amount in order currency","holestpay"),
					"Amount in payment currency"         => __("Amount in payment currency","holestpay"),
					"Refunded amount"  => __("Refunded amount","holestpay"),
					"Captured amount"  => __("Captured amount","holestpay"),
					"Installments"  => __("Installments","holestpay"),
					"Installments grace months"  => __("Installments grace months","holestpay"),
					"Reccuring interval"  => __("Reccuring interval","holestpay"),
					"Reccuring interval value"  => __("Reccuring interval value","holestpay"),
					"Reccuring total payments"  => __("Reccuring total payments","holestpay"),
					"Try to pay again" => __("Try to pay again...","holestpay"),
					"Payment refused, you can try again"  => __("Payment refused, you can try again...","holestpay"),
					"Payment failed, you can try again" => __("Payment failed, you can try again...","holestpay"),
					"Error in payment request" => __("Error in payment request. Please check your email and contact us!","holestpay"),
					"No payment respose" => __("No valid payment respose was received. You can try again!","holestpay"),
					"Payment has failed" => __("Payment has failed. You can try again!","holestpay"),
					"Payment refused" => __("Payment refused","holestpay"),
					"Payment failed" => __("Payment failed","holestpay"),
					"Payment error" => __("Payment error","holestpay"),
					"Ordering as a company?" => __('Ordering as a company?', 'holestpay'),
					"Company Tax ID" => __('Company Tax ID', 'holestpay'),
					"Company Register ID" => __('Company Register ID', 'holestpay'),
					"Company Name" => __('Company Name', 'holestpay')
				),
				"ajax_url"          => add_query_arg( 'action', "hpay-user-operations",admin_url('admin-ajax.php')),
				"language"          => get_locale(),
				"hpaylang"          => HPay_Core::hpaylang(),
				"plugin_version"        => $pdata["Version"],
				"environment"	        => $this->core->getSetting("environment", null),
				"dock_payment_methods"	=> $this->core->getSetting("dock_payment_methods", ""),
				"hpay_autoinit"         => is_checkout() ? 1 : 0
			);
			
			wp_localize_script( 'hpay_checkout_js', 'HolestPayCheckout', $data);
		}
	}
};

