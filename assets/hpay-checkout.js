/* HolestPay */
(function(){
	if(typeof HolestPayCheckout !== 'undefined' ){
		let hpay_adding_payment_method = false;
		let hpay_on_result_callaback = null;
		
		let __hscript_load = (SCRIPT_URL, callback , async = true, type = "text/javascript") => {
						
						return new Promise((resolve, reject) => {
							try {
								if(window.HPayInit){
									if(callback){
										callback();
									}
									resolve({ status: true });
								}else{
									const scriptEle = document.createElement("script");
									scriptEle.type  = type;
									scriptEle.async = async;
									scriptEle.src   = SCRIPT_URL;

									scriptEle.addEventListener("load", (ev) => {
										if(callback){
											callback();
										}
										resolve({ status: true });
									});

									scriptEle.addEventListener("error", (ev) => {
										reject({
											error_code: -1,
											error: 'Failed to load the script'
										});
									});
									document.body.appendChild(scriptEle);
								}
							} catch (error) {
								reject(error);
							}
						});
				}; 
		
		if(typeof HolestPayAdmin === 'undefined' ){
			
			jQuery(document).ready(function(){
				__hscript_load(HolestPayCheckout.hpay_url + "/clientpay/cscripts/hpay.js?verdeffer=23-" + HolestPayCheckout.plugin_version + "-" + (new Date()).toISOString().replace(/[^\d]/g,"").substring(0,8), function(){
					try{
						let event = new Event("onHpayScriptLoaded");
						document.dispatchEvent(event);
					}catch(ex){
						console.error(ex);
					}
				});
			});
		};
		
		document.addEventListener("onHpayScriptLoaded", function(e){
			if(is_payment_token_from || HolestPayCheckout.hpay_autoinit == 1 || document.querySelector("input[value*='hpayshipping-]")){
				HPayInit().then(client => {
					if(client && client.POS && client.POS.shipping){
						client.POS.shipping.forEach(s => {
							let mid = "hpayshipping-" + s.HPaySiteMethodId;
							let tmp = document.createElement("span");
							for(var el of document.querySelectorAll("input[value*='" + mid + "']")){
								try{
									el.parentNode.className = String((el.parentNode.className || "") + " hpay_sm_description_wrapper").trim();
									tmp.innerHTML = s.Description;
									el.parentNode.setAttribute("hpay_sm_description",(tmp.innerText || "").trim());
								}catch(ex){}
							}
							try{
								let event = new Event("onHpayCartUpdated");
								event.cart = HolestPayCheckout.cart;
								document.dispatchEvent(event);
							}catch(ex){
								console.error(ex);
							}
						});	
					}
				});
			}	
		},false);
		
		let adapted_checkout_destroy = null;
		let prev_hpay_shipping_method = null;
		
		window.document.addEventListener("onHPayCheckoutVariableChange", function(e){
			if(e.variable_name == "dispenser"){
				let dispenser = (e.variable_value && typeof e.variable_value === 'string') ? JSON.parse(e.variable_value) : e.variable_value;
				let data = {
					order_shipping: {
						dispenser: "",
						dispenser_desc: "",
						dispenser_method_id: ""
					}
				};
				if(dispenser){
					data.order_shipping.dispenser_method_id = sessionStorage.dispenser_method_id;
					data.order_shipping.dispenser = dispenser.ID;
					data.order_shipping.dispenser_desc = dispenser.Name + ", " + dispenser.Address;
				}
				hpay_setCheckoutData(data);
			}
		}, true);
		
		async function hpay_setCheckoutData(data){
			return fetch(HolestPayCheckout.ajax_url + "&operation=checkout_sessiom_data",{
				method:"POST",
				headers:{
						"Content-Type":"application/json"
				},
				body: JSON.stringify(data || {})
			}).then(rawr => rawr.json()).catch(err => {return {error: err}}); 
		}
		
		async function hpay_onCartUpdated(){
			
			if(typeof HolestPayCheckout === 'undefined')
				return;
			
			if(typeof HolestPayCheckout.cart === 'undefined')
				return;
			
			let hpmsel = document.querySelector("*[name='payment_method'][value^='hpaypayment-']:checked");
			if(hpmsel){
				let mpid = parseInt(hpmsel.value.replace("hpaypayment-",""));
				if(mpid){
					HolestPayCheckout.cart.payment_method = mpid;
				}
			}
			
			
			
			update_hpay_pay_dock(HolestPayCheckout.cart.payment_method);
			
			
			if(prev_hpay_shipping_method && prev_hpay_shipping_method.HPaySiteMethodId != HolestPayCheckout.cart.shipping_method){
				if(adapted_checkout_destroy && (typeof adapted_checkout_destroy === 'function' || adapted_checkout_destroy.then)){
					try{
						if(adapted_checkout_destroy.then){
							adapted_checkout_destroy = await adapted_checkout_destroy;
						}
						if(typeof adapted_checkout_destroy === 'function')
							adapted_checkout_destroy();
						
						adapted_checkout_destroy = null;
					}catch(ex){
						
					}
				}
				prev_hpay_shipping_method = null;
			}
			
			if(typeof HPay !== 'undefined'){
				if(HPay && HPay.POS && HPay.POS.shipping){
					 HPay.POS.shipping.forEach(s => {
									let mid = "hpayshipping-" + s.HPaySiteMethodId;
									let tmp = document.createElement("span");
									for(var el of document.querySelectorAll("input[value*='" + mid + "']")){
										try{
											el.parentNode.className = String((el.parentNode.className || "") + " hpay_sm_description_wrapper").trim();
											tmp.innerHTML = s.Description;
											el.parentNode.setAttribute("hpay_sm_description", (tmp.innerText || "").trim());
										}catch(ex){}
									}
								});	 
				}
			}
			
			let s_adapt_needed = false;
			let sipping_m = document.querySelectorAll("input[value^='hpayshipping-']");
			if(sipping_m && sipping_m.length){
				for(var el of sipping_m){
					if(!el.parentNode.querySelector('.hpay-sm-options')){
						let sm_options = document.createElement("span");
						sm_options.className = 'hpay-sm-options';
						sm_options.setAttribute("hpay_site_shipping_method",el.getAttribute("value"));
						sm_options.style.display = 'none';
						let smid = String(el.getAttribute("value") || "").split(":")[0];
						smid = smid.split('hpayshipping-')[1];
						if(smid){
							sm_options.setAttribute("hpay_shipping_method_id",smid);
							el.parentNode.appendChild(sm_options);
							if(HolestPayCheckout.cart.shipping_method == smid){
								sm_options.style.display = 'block';	
								s_adapt_needed = true;
							}
						}
					}else{
						let smid = String(el.getAttribute("value") || "").split(":")[0];
						let sm_options = el.parentNode.querySelector('.hpay-sm-options');
						
						if(sm_options){
							if(!el.checked){
								sm_options.style.display = 'none';
							}else if(HolestPayCheckout.cart.shipping_method == smid){
								sm_options.style.display = 'block';	
								s_adapt_needed = true;
							}else{
								sm_options.style.display = 'none';
							}	
						}
					}
				}
			}
			
			if(HolestPayCheckout.cart.shipping_method){
				try{
					if(!s_adapt_needed && prev_hpay_shipping_method && prev_hpay_shipping_method.HPaySiteMethodId == HolestPayCheckout.cart.shipping_method){
						return;	
					}
					
					HPayInit(async function(client){ 
					    let smethod = HPay.POS.shipping.find(s => s.HPaySiteMethodId == HolestPayCheckout.cart.shipping_method);
						if(smethod && smethod.AdaptCheckout){
							try{
								adapted_checkout_destroy = smethod.AdaptCheckout({
									billing: {
										address: "#billing_address_1,#billing-address_1",
										address_num: "#billing_address_2,#billing-address_2",
										postcode: "#billing_postcode,#billing-postcode",
										city: "#billing_city,#billing-city",
										municipality:"#billing_state",
										phone: "#billing_phone,#billing-phone",
										country: "#billing_country,#billing-country"
									},
									shipping:{
										address: "#shipping_address_1,#shipping-address_1",
										address_num: "#shipping_address_2,#shipping-address_2",
										postcode: "#shipping_postcode,#shipping-postcode",
										city: "#shipping_city,#shipping-city",
										municipality:"#shipping_state",
										phone: "#shipping_phone,#shipping-phone",
										country: "#shipping_country,#shipping-country"
									}
								}) || null;
							}catch(ex){
								console.log(ex)
							}
						}
						prev_hpay_shipping_method = smethod
					});
				}catch(iex){
					//script not yet loaded
				}
			} else {
				if(adapted_checkout_destroy && (typeof adapted_checkout_destroy === 'function' || adapted_checkout_destroy.then)){
					try{
						if(adapted_checkout_destroy.then){
							adapted_checkout_destroy = await adapted_checkout_destroy;
						}
						if(typeof adapted_checkout_destroy === 'function')
							adapted_checkout_destroy();
						
						adapted_checkout_destroy = null;
					}catch(ex){
						
					}
				}
				prev_hpay_shipping_method = null;
			}
		}
		
		function update_hpay_pay_dock(pm_id){
			try{
				if(typeof HPay === 'undefined' || !window.HPay){
					window.__oninit_call_pdate_hpay_pay_dock = () => {
						update_hpay_pay_dock(pm_id);
					};
					
					document.addEventListener("onHPayClientFirstInit",function(e){
						if(window.__oninit_call_pdate_hpay_pay_dock)
							window.__oninit_call_pdate_hpay_pay_dock();
					});
				}
				
				if(typeof HPay !== 'undefined' && HPay && HPay.setPaymentMethodDock && HolestPayCheckout && HolestPayCheckout.dock_payment_methods){
					if(!pm_id){
						HPay.setPaymentMethodDock(null);
						return;
					}
					
					let cnt = jQuery("div[data-hpay-dock-pmethod='" + pm_id + "']")[0];
					let vault_selector = null;
					
					if(cnt){
						vault_selector = cnt.getAttribute('data-hpay-dock-ptokenref-selector') || "";
					}
					
					let hcart = HolestPayCheckout.cart || {};
					
					let set_installments = null;
					let pm = HPay.POS.payment.find(pm => pm.HPaySiteMethodId == pm_id);
					if(pm && pm["User Data"]){
						String(pm["User Data"] || "").split(/\,|\|/).forEach(opt => {
							let t = String(opt || "").split(/\:|\=/).map(s=>s.trim()).filter(s=>s);
							if(t.length > 1){
								let opt_name = t[0];
								let opt_val = t[1];
								if(opt_name == 'set_installments'){
									set_installments = parseInt(opt_val) || null;
								}
							}
						});
					}
					
					HPay.setPaymentMethodDock(pm_id, {
						order_amount: hcart.order_amount || 0.00,//may be element, selector or actual value. Selector may contain {$pmid} replace makro 
						order_currency: hcart.order_currency || "",//may be element, selector or actual value. Selector may contain {$pmid} replace makro 
						monthly_installments: set_installments || hcart.monthly_installments || null,//may be element, selector or actual value. Selector may contain {$pmid} replace makro 
						vault_token_uid: vault_selector || "",//may be element, selector or actual value. Selector may contain {$pmid} replace makro,
						hpaylang: HolestPayCheckout.hpaylang || "en",
						cof: is_payment_token_from ? "required" : (hcart.cof || "") 	
					},cnt);// cnt - element or selector. Defaults to first visible div element with data-hpay-dock-payment attribute. Selector may contain {$pmid} replace makro  
				}
			}catch(ex){
				console.error(ex);
			}
		}
		
		document.addEventListener("onHpayCartUpdated", function(e){
			if(typeof HPayInit === 'undefined')
				return;
			
			hpay_onCartUpdated();
			
			
			let hpmeth = document.querySelector("input[value^='hpaypayment-']:checked");
			if(hpmeth){
				let pm_id = parseInt(String(hpmeth.getAttribute("value")).replace(/[^\d]/g,''));
				update_hpay_pay_dock(pm_id || null);
			}else{
				if(typeof HPay !== 'undefined' && HPay && HPay.getCurrentPaymentMethodDock()){
					update_hpay_pay_dock(null);
				}
			}
			
		},false);
		
		jQuery(document).on("change","input[name$='_vault_token_id']", function(e){
			if(this.checked){
				
				let pm_id = parseInt(String(this.getAttribute("name")).replace(/[^\d]/g,''));
				update_hpay_pay_dock(pm_id || null);
					
			}
		});
		
		jQuery(document).on("change","input[value^='hpaypayment-']", function(e){
			if(/hpaypayment-\d*$/.test(this.getAttribute("value"))){
				if(this.checked){
					let pm_id = parseInt(String(this.getAttribute("value")).replace(/[^\d]/g,''));
					update_hpay_pay_dock(pm_id || null);
				}else{
					if(!jQuery("input[value^='hpaypayment-']:checked")[0]){
						if(typeof HPay !== 'undefined' && HPay && HPay.getCurrentPaymentMethodDock()){
							update_hpay_pay_dock(null);
						}
					}
				}
			}
		});
		
		addEventListener("DOMContentLoaded", (event) => {
			let _pm_uhpc = null;
			setTimeout(()=>{
				let hpmeth = document.querySelector("input[value^='hpaypayment-']:checked");
				if(hpmeth){
					let pm_id = parseInt(String(hpmeth.getAttribute("value")).replace(/[^\d]/g,'')) || null;
					if(pm_id){
						update_hpay_pay_dock(pm_id);
					}
				}else if(document.querySelector('div[data-block-name="woocommerce/checkout"],div.wp-block-woocommerce-checkout')){
					const targetNode = document.querySelector('div[data-block-name="woocommerce/checkout"],div.wp-block-woocommerce-checkout');

					if (targetNode) {
						const observer = new MutationObserver((mutations) => {
							mutations.forEach((mutation) => {
								let hpmeth = document.querySelector("input[value^='hpaypayment-']:checked");
								if(hpmeth){
									let pm_id = parseInt(String(hpmeth.getAttribute("value")).replace(/[^\d]/g,'')) || null;
									if(pm_id != _pm_uhpc){
										_pm_uhpc = pm_id;
										update_hpay_pay_dock(pm_id);
									}
								}
							});
						});
						observer.observe(targetNode, { childList: true, subtree: true });
					} else {
						console.warn('Checkout container not found. Check if the block is loaded yet.');
					}
				}
			},350);
		});
		
		jQuery(document).on("updated_checkout","body", function(e,data){
			if(data.fragments && data.fragments.hpaycart){
				HolestPayCheckout.cart = data.fragments.hpaycart;
				
				try{
					if(HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields){
						let checkout_fields = HolestPayCheckout.cart.UI.checkout_fields;
						
						let setFields = (is_company) => { 
							for(var what in checkout_fields){
								if(checkout_fields.hasOwnProperty(what)){
									try{
										if(what == "is_company")
											continue;
										for(var el of document.querySelectorAll(checkout_fields[what])){
											el.setAttribute("hpay_checkout_field", what);
											if(!is_company){
												if(el.value){
													el.setAttribute("orig_value", el.value);
												}
												el.value = "";
											}else{
												el.value = el.getAttribute("orig_value") || "";
												if(!el.value){
													if(HolestPayCheckout.cart.order_billing && HolestPayCheckout.cart.order_billing[what]){
														el.value = HolestPayCheckout.cart.order_billing[what];
													}
												}
											}
										}
									}catch(ex){
										//
									}
								}
							}
						};
						
						if(checkout_fields.is_company){
							let is_company_el = document.querySelectorAll(checkout_fields.is_company);
							if(is_company_el && is_company_el[0] && is_company_el[0].form){
								let onchange = function(){
									let is_company = 0;
									if(/checkbox/.test(this.getAttribute("type"))){
										is_company = this.checked;
									}else if(/radio/.test(this.getAttribute("type"))){
										if(this.checked){
											is_company = this.checked && /1|yes|on|true|comp/i.test(String(this.getAttribute("value"))) ? 1 : 0;	
										}
									}else{
										is_company = /1|yes|on|true|comp/i.test(String(this.value)) ? 1 : 0;
									}
									this.form.className = String(this.form.className || "").replace(/\s?is-company-order-yes|\s?is-company-order-no/,'') + (is_company ? " is-company-order-yes": " is-company-order-no");
									setFields(is_company);
								};
								
								let isc = HolestPayCheckout.cart && HolestPayCheckout.cart.order_billing && HolestPayCheckout.cart.order_billing.is_company;
								is_company_el[0].form.className = String(is_company_el[0].form.className || "").replace(/\s?is-company-order-yes|\s?is-company-order-no/,'') + (isc ? " is-company-order-yes": " is-company-order-no");
								setFields(isc);
								
								for(var el of is_company_el){
									el.setAttribute("hpay_checkout_field", "is_company");
									el.addEventListener("change", onchange,false);	
								}
							}
						}
					}
				}catch(ex){
					console.error(ex);
				}
				
				try{
					let event = new Event("onHpayCartUpdated");
					event.cart = HolestPayCheckout.cart;
					document.dispatchEvent(event);
				}catch(ex){
					console.error(ex);
				}
			}
		});
		
		let hpay_parse_qs = function(url){
			let data = {};
			if(!url){
				url = window.location.href;
			}
			let qsstr = url.split("?")[1];
			if(qsstr){
				qsstr.split("&").forEach(t => {
					if(t){
						let parm = t.split("=");
						if(parm[0]){
							data[parm[0]] = parm[1] ? decodeURIComponent(parm[1]) : "";
						}
					}
				});
			}
			return data;
		};
		
		let hpay_handleUnsuccessfullResponse = function(hpay_response){
			
			if(typeof HPay !== 'undefined'){
				if(HPay && HPay.exitClientWait){
					HPay.exitClientWait();
				}
			}
			
			if(!hpay_response.status){
				hpay_response.status = "ERROR";
			}
			
			let title   = "";
			let content = "";
			let footer  = "";
			
			if(/REFUSED/i.test(hpay_response.status)){
				title  = HolestPayCheckout.labels["Payment refused"] || "Payment refused";
				content = "Payment refused, you can try again";
				content = HolestPayCheckout.labels[content] || content;
			}else if(/FAILED/i.test(hpay_response.status)){
				title  = HolestPayCheckout.labels["Payment failed"] || "Payment failed";
				content = "Payment failed, you can try again";
				content = HolestPayCheckout.labels[content] || content;
			}else if(/CANCELED/i.test(hpay_response.status)){
				title  = HolestPayCheckout.labels["Payment canceled"] || "Payment canceled";
				content = "Payment canceled, you can try again";
				content = HolestPayCheckout.labels[content] || content;
			}else{
				title  = HolestPayCheckout.labels["Payment error"] || "Payment error";
				if(hpay_response.error_code == 2000){
					content = "No payment respose";
					content = HolestPayCheckout.labels[content] || content;
				}else{
					content = "Payment has failed";
					content = HolestPayCheckout.labels[content] || content;
				}
			}
			
			if(hpay_response.transaction_user_info){
				content += "<pre>";
				for(var key in hpay_response.transaction_user_info){
					if(hpay_response.transaction_user_info.hasOwnProperty(key)){
						content += ("\r\n" + String( HolestPayCheckout.labels[key] || key ) + ": " + hpay_response.transaction_user_info[key]);
					}
				}
				content += "</pre>";
			}
			
			let resinp = jQuery("#hpaypayment-" + hpay_response.payment_method + "_payresult");
			let retried = false;
			
			if(/REFUSED|FAILED|CANCELED/i.test(hpay_response.status)){
				
				let retry_button = jQuery("<button></button>").html(HolestPayCheckout.labels["Try to pay again"] || "Try to pay again").click(function(e){
					retried = true;
					
					hpay_closePopup("payreq-error");
					if(resinp[0]){
						resinp.val(JSON.stringify(hpay_response));
						
						if(window.hpay_last_pay_req && !HolestPayCheckout.dock_payment_methods){
							presentHPayPayForm(window.hpay_last_pay_req);
						}else{
							if(resinp[0].form){
								if(jQuery(resinp[0].form).find(':submit')[0]){
									jQuery(resinp[0].form).find(':submit').trigger("click");
								}else if(jQuery(resinp[0].form).find("button[class*='checkout-place-order-button']")[0]){
									jQuery(resinp[0].form).find("button[class*='checkout-place-order-button']").trigger('click');
								}else{
									jQuery(resinp[0].form).find("button[class*='checkout-place-order-button']").trigger('click');
								}
							}
						}
					}
				});
				
				if(resinp[0]){
					retry_button.attr("class",jQuery(resinp[0].form).find(':submit').attr("class")).css("padding","8px");
				}
				
				footer = jQuery("<div></div>");
				footer.append(retry_button);
			}
			
			
			hpay_PresentPopup("payreq-error xs-popup", title, content, footer, function(){
				if(!retried && hpay_response.order_user_url)
					window.location.href = hpay_response.order_user_url;
			});
		};
		
		document.addEventListener("onHPayResult",function(e){
			if(hpay_adding_payment_method)
				return;
			
			if(hpay_on_result_callaback){
				try{
					let c = hpay_on_result_callaback;
					hpay_on_result_callaback = null;
					c(e.hpay_response);
				}catch(ex){
					console.error(ex);
				}
			}
			
			if(e.hpay_response.transaction_uid){
				
				if(typeof HPay !== 'undefined'){
					if(HPay && HPay.enterClientWait){
						HPay.enterClientWait();
					}
				}
				
				if(!e.hpay_response.vhash){
					if(e.hpay_response.order_user_url && (/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status))){
						setTimeout(function(){
							window.location.href = e.hpay_response.order_user_url;
						},600);
						return;
					}
					
					hpay_handleUnsuccessfullResponse(e.hpay_response);
					return;
				}
				
				if(typeof hpay_method_wcapi !== 'undefined'){
					
					fetch(hpay_method_wcapi.url,{
						method:"POST",
						headers:{
							"Content-Type":"application/json"
						},
						body: JSON.stringify(e.hpay_response)
					}).then(rresp => rresp.json()).then(r => {
						if(/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status)){
							if(r.order_user_url){
								setTimeout(function(){
									window.location.href = r.order_user_url;
								},600);
								return;
							}
							
							if(e.hpay_response.order_user_url){
								setTimeout(function(){
									window.location.href = e.hpay_response.order_user_url;
								},600);
								return;
							}
							
						}else
							hpay_handleUnsuccessfullResponse(e.hpay_response);
						
					}).catch(err => {
						if(/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status)){
							if(e.hpay_response.order_user_url){
								setTimeout(function(){
									window.location.href = e.hpay_response.order_user_url;
								},600);
								return;
							}
						}else
							hpay_handleUnsuccessfullResponse(e.hpay_response);
					});
				}else{
					
					if(e.hpay_response.order_user_url){
						fetch("//" + HolestPayCheckout.site_url,{
							method:"POST",
							headers:{
								'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
							},
							body: new URLSearchParams({ "hpay_forwarded_payment_response": JSON.stringify(e.hpay_response), "hpay_local_request": 1})
						}).then(r=>{
							if(/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status)){
								
								if(r.order_user_url){
									setTimeout(function(){
										window.location.href = r.order_user_url;
									},600);
									return;
								}
								
								if(e.hpay_response.order_user_url){
									setTimeout(function(){
										window.location.href = e.hpay_response.order_user_url;
									},600);
									return;
								}
							}else{
								hpay_handleUnsuccessfullResponse(e.hpay_response);
							}
						}).catch(err => {
							if(/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status)){
								if(e.hpay_response.order_user_url){
									setTimeout(function(){
										window.location.href = e.hpay_response.order_user_url;	
									},600);
									return;
								}
							}else{
								hpay_handleUnsuccessfullResponse(e.hpay_response);
							}	
						})
					}else{
						if(/SUCCESS|PAID|PAYING|RESERVED|AWAITING|OBLIGATED/.test(e.hpay_response.status)){
							if(e.hpay_response.order_user_url){
								setTimeout(function(){
									window.location.href = e.hpay_response.order_user_url;
								},600);
								return;
							}
						}else{
							hpay_handleUnsuccessfullResponse(e.hpay_response);
						}
					}
				}
			}
		}, false);
		
		jQuery(document).on("submit","form:has(input[name='woocommerce_pay'])",function(e){
			if(jQuery(this).data("pass_payrequestforward")){
				return;
			}
			let self_frm = jQuery(this);
			
			let request_data = {};
			let formData = new FormData(this);
			if(formData.get("woocommerce_pay") && /^hpaypayment\-/.test(formData.get("payment_method") || "---")){
				e.preventDefault();
				let request_data = {};
				for(let prop of formData.keys()){
					if(/\[/.test(prop)){
						let $ref = request_data;
						let prop_path = prop.split("[").forEach(function(t,index,arr){
							let sprop = t.replace("]","").trim();
							if(index == arr.length - 1){
								$ref[sprop] = formData.get(prop);
							}else{
								if(!$ref[sprop]){
									$ref[sprop] = {};
								}
								$ref = $ref[sprop];
							}
						});
					}else{
						request_data[prop] = formData.get(prop);	
					}
				}
				
				if(this.action){
					request_data = Object.assign(request_data,hpay_parse_qs(this.action));
				}
				
				if(request_data["order-pay"]){
					request_data["order_id"] = request_data["order-pay"];
				}else if (/\/order-pay\//.test(window.location.href)){
					let m = window.location.href.match(/order-pay\/([\d]*)\//);
					if(m && m[1]){
						request_data["order_id"] = parseInt(m[1]);
					}
				}
				
				fetch(HolestPayCheckout.ajax_url + "&operation=forward_pay_request",{
					method:"POST",
					headers:{
							"Content-Type":"application/x-www-form-urlencoded"
					},
					body: (new URLSearchParams(request_data)).toString()
				}).then(rawr => rawr.json()).then(resp => {
					
					setTimeout(function(){
						self_frm.find(".blockOverlay").remove();
					},2500);
					
					if(resp.redirect){
						window.location.href = resp.redirect;
					}else if(resp.result == "error"){
						hpay_PresentPopup("payreq-error xs-popup", HolestPayCheckout.labels.error , HolestPayCheckout.labels.error_contact_us);	
						self_frm.data("pass_payrequestforward",1);
						self_frm.submit();
					}else if(resp.result == "success"){
						if(resp.messages){
							if(Array.isArray(resp.messages)){
								resp.messages = resp.messages.join(" ");
							}
							jQuery('body').append(jQuery(resp.messages));
						}else{
							self_frm.data("pass_payrequestforward",1);
							self_frm.submit();
						}
					}
				}).catch(err => {
					self_frm.find(".blockOverlay").remove();
					hpay_PresentPopup("payreq-error xs-popup", HolestPayCheckout.labels.error , HolestPayCheckout.labels.error_contact_us);	
					//self_frm.data("pass_payrequestforward",1);
					//self_frm.submit();
				});
			}
		});
		
		jQuery(document).on("click", ".hpay-destroy-vault", function(e){
			e.preventDefault();
			let item = jQuery(this).closest("*[token_id]");
			let token_id = item.attr("token_id");
			
			if(confirm(HolestPayCheckout.labels.remove_token_confirm)){
				fetch(HolestPayCheckout.ajax_url + "&operation=destroy_vault",{
					method:"POST",
					headers:{
							"Content-Type":"application/json"
					},
					body: JSON.stringify({token_id: parseInt(token_id)})
				}).then(rawr => rawr.json()).then(resp => {
					if(resp && resp.result == "ok"){
						item.remove();
					}else{
						throw "__BAD__";
					}
				}).catch(err => {
					hpay_PresentPopup("payreq-error xs-popup", HolestPayCheckout.labels.error , HolestPayCheckout.labels.error_contact_us);	
				});
			}
		});
		
		jQuery(document).on("click", ".hpay-set-default-vault", function(e){
			e.preventDefault();
			let item = jQuery(this).closest("*[token_id]");
			let token_id = item.attr("token_id");
			fetch(HolestPayCheckout.ajax_url + "&operation=default_vault",{
				method:"POST",
				headers:{
						"Content-Type":"application/json"
				},
				body: JSON.stringify({token_id: parseInt(token_id)})
			}).then(rawr => rawr.json()).then(resp => {
				if(resp && resp.result == "ok"){
					jQuery(".hpay-detafult-vault").removeClass('hpay-detafult-vault');
					jQuery(".hpay-vault-tokens *[token_id='" + token_id + "']").addClass('hpay-detafult-vault')
				}else{
					throw "__BAD__";
				}
			}).catch(err => {
				hpay_PresentPopup("payreq-error xs-popup", HolestPayCheckout.labels.error , HolestPayCheckout.labels.error_contact_us);	
			});
		});
		
		
		let zindex = 999999;
		let hpay_PresentPopup = function(popup_class, title, content, footer, onclose){
		 let pop = jQuery("." + popup_class.replace(/^\./,""));
		 if(!pop[0]){
			pop = jQuery("<div class='hpay_popup'><div class='hpay_popup_wrapper' ><div class='hpay_popup_top'></div><div class='hpay_popup_content'></div><div class='hpay_popup_footer'></div></div></div>").addClass(popup_class).appendTo(jQuery("BODY"));
			jQuery("<h4 class='hpay_popup_title'></h4>").appendTo(pop.find(".hpay_popup_top"));
			jQuery("<a class='hpay_popup_close'>&nbsp;</a>").appendTo(pop.find(".hpay_popup_top"));
		 }
		 if(content){
			 try{
				 if(jQuery(title).html()){
					pop.find(".hpay_popup_title > *").remove();
					pop.find(".hpay_popup_title").append(jQuery(title));
				 }else
					pop.find(".hpay_popup_title").html(title);
			 }catch(ex){
				 pop.find(".hpay_popup_title").html(title);
			 }
			 
			 pop.find(".hpay_popup_content *").remove();
			 
			 if(typeof content === "string"){
				pop.find(".hpay_popup_content").append(jQuery("<div class='popup_inner'></div>").html(content));	 
			 }else{
				pop.find(".hpay_popup_content").append(jQuery("<div class='popup_inner'></div>").append(jQuery(content))); 
			 }
			 
			 try{
				 if(jQuery(footer).html()){
					pop.find(".hpay_popup_footer > *").remove();
					pop.find(".hpay_popup_footer").append(jQuery(footer));	 
				 }else
					pop.find(".hpay_popup_footer").html(footer);
			 }catch(ex){
				 pop.find(".hpay_popup_footer").html(footer);
			 }
		 }
		 
		 zindex++;
		 jQuery("." + popup_class).css("zIndex",zindex);
		 jQuery("." + popup_class).show();
		 jQuery("body").addClass("hpay-popup-shown");
		};
		
		window.hpay_PresentPopup = hpay_PresentPopup;

		let hpay_closePopup = function(popup_class){
			jQuery("." + popup_class).hide();
			if(!jQuery(".hpay_popup:visible")[0]){
				jQuery("body").removeClass("hpay-popup-shown");
			}
		};

		jQuery(document).on("click",".hpay_popup_close",function(e){
			e.preventDefault(); 
			jQuery(this).closest(".hpay_popup").hide(); 
			
			if(onclose){
				try{
					onclose();
				}catch(ex){}
			}
			
			if(!jQuery(".hpay_popup:visible")[0]){
				jQuery("body").removeClass("hpay-popup-shown");
			}
		});

		jQuery(document).on("click",".hpay_popup_wrapper",function(e){
			e.stopImmediatePropagation();
		});

		jQuery(document).on("click",".hpay_popup",function(e){
			jQuery(this).find("a.hpay_popup_close").trigger("click");
		});
	}
})();

var is_payment_token_from = false;

function hpay_value_observer(element, callback) {
  (new (window.MutationObserver || window.WebKitMutationObserver)(function(mutations, observer) {
	if(mutations[0].attributeName == "value") {
		callback(element.value);
	}
  })).observe(element, {
	attributes: true
  });
}; 

function hpay_column_layout_init(variations){
	jQuery(document).on("click",".hpay-variant-columns-layout-item[variation_id]", function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		
		let variation_id = jQuery(this).attr("variation_id");
		let variation = variations.find(v => v.variation_id == variation_id);
		
		if(!jQuery(this).is(".selected")){
			jQuery(this).parent().find("> .hpay-variant-columns-layout-item").removeClass('selected');
			jQuery(this).addClass('selected')
		}
		
		for(let attr_name in variation.attributes){
			if(variation.attributes.hasOwnProperty(attr_name)){
				if(jQuery("*[name='" + attr_name + "']").val() != variation.attributes[attr_name]){
					jQuery("*[name='" + attr_name + "']").val(variation.attributes[attr_name]).trigger("change");
				}
			}
		}
	});
	
	let setObserverInterval = setInterval(function(){
		let set_done = null;
		jQuery(".hpay-variant-columns-layout:not(.init-done)").each(function(ind){
			let inp = jQuery(this).closest('.product').find("input[name='variation_id']")[0];
			if(inp){
				if(parseInt(inp.value)){
					jQuery(".hpay-variant-columns-layout-item[variation_id='" + parseInt(inp.value) + "']:not(.selected)").trigger("click");
				}
				hpay_value_observer(inp, function(value){
					if(parseInt(value)){
						jQuery(".hpay-variant-columns-layout-item[variation_id='" + parseInt(value) + "']:not(.selected)").trigger("click");
					}
				});
			}else{
				set_done = false;
			}
		});
		if(set_done !== false){
			clearInterval(setObserverInterval);
		}
	},250);
}

function hpay_enter_price_init(epdata){
	var hpay_enter_price_data = epdata;
	function hpay_set_enter_price_data(foritem){
		let data = null;
		if(foritem == "product"){
			data = hpay_enter_price_data.product;
		}else{
			data = {
				value: "",
				min:"",
				max:""
			};
			if(hpay_enter_price_data.variants && hpay_enter_price_data.variants[foritem]){
				data = hpay_enter_price_data.variants[foritem];
			}
		}
		
		let inp = document.getElementById('hpay_name_price_input');
		
		inp.value = data.value;
		
		let info = "";
		if(data.min){
			inp.setAttribute("min",data.min);
			info += ("min. " + parseFloat(data.min).toFixed(2));
		}else{
			inp.setAttribute("min","");
		}
		
		if(data.max){
			inp.setAttribute("max",data.max);
			if(info) info += " | ";
			info += ("max. " + parseFloat(data.max).toFixed(2));
		}else{
			inp.setAttribute("max","");
		}
		
		if(info){
			info += (" " +  hpay_enter_price_data.currency_symbol);
			document.getElementById('hpay_name_price_panel_min_max').innerHTML = info;
		}
		
		document.getElementById('hpay_name_price_panel').style.display = data.id ? '' : "none";
		document.getElementById('hpay_name_price_panel_min_max').style.display = info ? '' : "none";
	} 
	
	
	document.getElementById('hpay_name_price_input').addEventListener("change", function(e){
		if(this.getAttribute("change_no_trigger") == 1)
			return;
		
		if(this.getAttribute("min")){
			if(parseFloat(this.value) < parseFloat(this.getAttribute("min"))){
				this.setAttribute("change_no_trigger",1);
				this.value = parseFloat(this.getAttribute("min")).toFixed(2);
				this.setAttribute("change_no_trigger",0);
			}
		}
		
		if(this.getAttribute("max")){
			if(parseFloat(this.value) > parseFloat(this.getAttribute("max"))){
				this.setAttribute("change_no_trigger",1);
				this.value = parseFloat(this.getAttribute("max")).toFixed(2);
				this.setAttribute("change_no_trigger",0);
			}
		}
	},false);
	
	if(hpay_enter_price_data.product){
		hpay_set_enter_price_data('product');
	}else if(document.getElementById('hpay_name_price_input').form){
		let var_id_input = document.getElementById('hpay_name_price_input').form.querySelector("input[name='variation_id']");
		if(var_id_input){
			if(parseInt(var_id_input.value)){
			  hpay_set_enter_price_data(parseInt(var_id_input.value));
		    }	
			hpay_value_observer(var_id_input, function(value){
				if(parseInt(value))
					hpay_set_enter_price_data(parseInt(value));
			});
		}else{
			let wint = setInterval(function(){
				var_id_input = document.getElementById('hpay_name_price_input').form.querySelector("input[name='variation_id']")
				if(var_id_input){
					if(parseInt(var_id_input.value)){
					  hpay_set_enter_price_data(parseInt(var_id_input.value));
					}	
					hpay_value_observer(var_id_input, function(value){
						if(parseInt(value))
							hpay_set_enter_price_data(parseInt(value));
					});
					clearInterval(wint);
				}
			},250);
		}
	}
};
		
addEventListener("DOMContentLoaded", (event) => {
	
	const __set_input_value = (inp, value, skip_of_same) => {
	
		try{
			
			if(skip_of_same && (inp.value == value)){
				return;
			}
			
			let nativeInputValueSetter = null;
			if(/SELECT/i.test(inp.tagName)){
				nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set;
			}else if(/TEXTAREA/i.test(inp.tagName)){
				nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
			}else{
				nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
			}
			
			nativeInputValueSetter.call(inp, value );
		
			const ievent = new Event('input', { bubbles: true });
			ievent.simulated = true;
			ievent.target = inp;
			inp.dispatchEvent(ievent);
			
		}catch(rex){
			inp.value = value;
		}
	};
	
	
	if(typeof HolestPayCheckout !== 'undefined'){
		const isBlockCheckout = typeof wc !== 'undefined' && wc && wc.blocksCheckout;

		let order_billing = null;
		let __callUpdateCompanyFieldsTimer = null;
		let _isCompanyIsCompanyField = false;
		let _initialSyncDone = false; // ensure one initial extensionCartUpdate push per page load

		const queryField = (selector) => {
			if(!selector) return null;
			try{ return document.querySelector(selector); }catch(e){ return null; }
		};

		const updateCompanyFields = function() {
			__callUpdateCompanyFieldsTimer = null;
			if(!order_billing) return;
			var fields = HolestPayCheckout && HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields;
			if(!fields) return;

			var is_company = order_billing.is_company || 0;
			if(!fields.is_company) is_company = null;

			var send_data = {
				is_company: is_company,
				company_tax_id: (is_company === null || is_company) ? (order_billing.company_tax_id || "") : "",
				company_reg_id: (is_company === null || is_company) ? (order_billing.company_reg_id || "") : ""
			};
			if(is_company === 0) send_data.company = '';

			// Keep HolestPayCheckout.cart.order_billing in sync so any JS reading it sees current values
			if(HolestPayCheckout && HolestPayCheckout.cart && HolestPayCheckout.cart.order_billing){
				var ob = HolestPayCheckout.cart.order_billing;
				ob.is_company       = send_data.is_company;
				ob.company_tax_id   = send_data.company_tax_id;
				ob.company_reg_id   = send_data.company_reg_id;
				if(typeof send_data.company !== 'undefined') ob.company = send_data.company;
			}

			// Persist via custom AJAX endpoint (works for both classic and block checkout)
			if(typeof hpay_setCheckoutData === 'function'){
				hpay_setCheckoutData({ order_billing: send_data });
			}

			// Block checkout: also push into WC Blocks draft order via extensionCartUpdate
			if(isBlockCheckout){
				wc.blocksCheckout.extensionCartUpdate({ namespace: 'hpay', data: {
					order_billing: send_data
				}}).then(function(d){
					if(d && d.extensions && d.extensions.hpay && d.extensions.hpay.cart)
						HolestPayCheckout.cart = Object.assign(HolestPayCheckout.cart, d.extensions.hpay.cart);
				});
			}
		};

	// Works for both classic and block checkout; debounced — resets on every call so
	// the API fires only after the user stops typing for 200 ms.
	const callUpdateCompanyFields = function() {
		if(__callUpdateCompanyFieldsTimer) clearTimeout(__callUpdateCompanyFieldsTimer);
		__callUpdateCompanyFieldsTimer = setTimeout(updateCompanyFields, 350);
	};

		const getHideableContainer = (el) => (
			el.closest('.wc-block-components-text-input, [data-hpay-injected], p.form-row, .form-row') ||
			el.parentElement
		);

		const applyCompanyVisibility = (is_company) => {
			const fields = HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields;
			if(!fields) return;

			const getCompanyInput = () =>
				queryField(fields.company) || document.querySelector("input[name='billing_company']");

			if(_isCompanyIsCompanyField){
				// Company name IS the is_company indicator — always keep it visible;
				// only show/hide the extra tax_id / reg_id fields
				try{ const cmp = getCompanyInput(); if(cmp){ const w = getHideableContainer(cmp); if(w) w.style.display = ''; } }catch(e){}
				['company_tax_id', 'company_reg_id'].forEach(key => {
					if(!fields[key]) return;
					try{
						const el = queryField(fields[key]);
						if(el){ const w = getHideableContainer(el); if(w) w.style.display = is_company ? '' : 'none'; }
						const injectedSel = {company_tax_id:'[data-hpay-tax-id]', company_reg_id:'[data-hpay-reg-id]'}[key];
						if(injectedSel){ const inj = document.querySelector(injectedSel); if(inj) inj.style.display = is_company ? '' : 'none'; }
					}catch(e){}
				});
			}else{
				// Separate is_company control (injected checkbox or existing field) —
				// hide/show company name + extra fields together
				['company', 'company_tax_id', 'company_reg_id'].forEach(key => {
					if(!fields[key]) return;
					try{
						const el = key === 'company'
							? getCompanyInput()
							: queryField(fields[key]);
						if(el){ const w = getHideableContainer(el); if(w) w.style.display = is_company ? '' : 'none'; }
						const injectedSel = {company_tax_id:'[data-hpay-tax-id]', company_reg_id:'[data-hpay-reg-id]'}[key];
						if(injectedSel){ const inj = document.querySelector(injectedSel); if(inj) inj.style.display = is_company ? '' : 'none'; }
					}catch(e){}
				});
			}
		};

		const createHpayTextInput = (id, label, value, onChange) => {
			const wrap = document.createElement('div');
			wrap.className = 'wc-block-components-text-input' + (value ? ' is-active' : '');
			wrap.dataset.hpayInjected = '1';
			const input = document.createElement('input');
			input.type = 'text'; input.id = id; input.value = value; input.autocomplete = 'off';
			const lbl = document.createElement('label');
			lbl.htmlFor = id; lbl.textContent = label;
			wrap.appendChild(input); wrap.appendChild(lbl);
			input.addEventListener('input', e => { wrap.classList.toggle('is-active', !!e.target.value); onChange(e.target.value); });
			input.addEventListener('focus', () => wrap.classList.add('is-active'));
			input.addEventListener('blur', () => { if(!input.value) wrap.classList.remove('is-active'); });
			return wrap;
		};

		// Mirror of __set_input_value but for checkbox checked state
		const hpay_set_checkbox = (inp, checked) => {
			try{
				const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked').set;
				nativeSetter.call(inp, checked);
				const cevent = new Event('change', { bubbles: true });
				cevent.simulated = true;
				cevent.target = inp;
				inp.dispatchEvent(cevent);
			}catch(rex){
				inp.checked = checked;
			}
		};

		const createHpayCheckbox = (id, labelText, checked, onChange) => {
			const wrap = document.createElement('div');
			wrap.className = 'wc-block-components-checkbox';
			wrap.dataset.hpayInjected = '1';

			const input = document.createElement('input');
			input.type = 'checkbox'; input.id = id;
			input.className = 'wc-block-components-checkbox__input';

			// WC Blocks CSS rule: `.wc-block-components-checkbox label { position: relative }`
			// The mark must be INSIDE the label so it absolutely-positions relative to the
			// label's top-left (overlaying the input at margin 3px/1px).
			// Being an immediate sibling of the input *within* the label keeps the
			// `input:not(:checked) + .mark { display:none }` selector working.
			var existingMark = document.querySelector('.wc-block-components-checkbox__mark');
			var mark = existingMark ? existingMark.cloneNode(true) : (function(){
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('class', 'wc-block-components-checkbox__mark');
				svg.setAttribute('aria-hidden', 'true');
				svg.setAttribute('viewBox', '0 0 24 20');
				var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('d', 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
				svg.appendChild(path);
				return svg;
			}());

			// label wraps: [input] [mark (absolute, overlays input)] [text]
			const lbl = document.createElement('label');
			lbl.htmlFor = id; lbl.className = 'wc-block-components-checkbox__label';
			lbl.appendChild(input);
			lbl.appendChild(mark);
			lbl.appendChild(document.createTextNode(labelText));

			wrap.appendChild(lbl);

			// Set initial state BEFORE attaching our listener so the dispatched change
			// event doesn't trigger onChange, but WC Blocks global listeners pick it up
			hpay_set_checkbox(input, checked);
			input.addEventListener('change', function(){ onChange(input.checked); });
			return wrap;
		};

		// Read the true is_company boolean from any element type:
		// checkbox → .checked, radio → find :checked sibling, select/text → .value
		const readIsCompanyElValue = (el) => {
			if(!el) return false;
			let v;
			if(el.type === 'checkbox'){
				v = el.checked ? '1' : '0';
			}else if(el.type === 'radio'){
				const checked = el.name
					? document.querySelector('input[name="' + el.name + '"]:checked')
					: (el.checked ? el : null);
				v = checked ? checked.value : '';
			}else{
				v = el.value; // select, text, hidden, etc.
			}
			return v === "1" || v === "on" || v === "true" || v === "yes"
				|| (typeof v === 'string' && v !== '' && v.includes("comp"));
		};

		const hpayHandled = new WeakSet();
		let hpayScheduled = false;

		const initCompanyFields = () => {
			const fields = HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields;
			if(!fields || !fields.company) return;
			if(!fields.is_company && !fields.company_tax_id && !fields.company_reg_id) return;

			// Locate company name input; block checkout uses id="billing-company" (hyphen),
			// classic uses id="billing_company" (underscore) — fall back to name attribute
			const companyInput = queryField(fields.company) || document.querySelector("input[name='billing_company']");
			if(!companyInput) return;

			if(!order_billing && HolestPayCheckout.cart.order_billing)
				order_billing = {...HolestPayCheckout.cart.order_billing};
			if(!order_billing) return;

			// Detect when is_company selector points to the company field itself
			// (e.g. is_company_field = "company" in admin settings).
			// Use querySelectorAll so radio groups are fully captured.
			let existingIsCompanyEls = [];
			try{ if(fields.is_company) existingIsCompanyEls = Array.from(document.querySelectorAll(fields.is_company)); }catch(e){}
			const existingIsCompanyEl = existingIsCompanyEls[0] || null;
			_isCompanyIsCompanyField = existingIsCompanyEls.some(el => el === companyInput);

			// Read initial state from the live DOM element, not server-side cart data
			let checked;
			if(_isCompanyIsCompanyField){
				checked = !!companyInput.value.trim();
			}else if(existingIsCompanyEl){
				checked = readIsCompanyElValue(existingIsCompanyEl);
			}else{
				checked = fields.is_company ? !!order_billing.is_company : true;
			}

			const onIsCompanyChange = (isCompany) => {
				checked = !!isCompany;
				order_billing.is_company = isCompany ? 1 : 0;
				const cmp = queryField(fields.company) || document.querySelector("input[name='billing_company']");
				if(order_billing.is_company){
					order_billing.company_tax_id = window.h__company_tax_id || "";
					order_billing.company_reg_id = window.h__company_reg_id || "";
					if(cmp) __set_input_value(cmp, window.h__company || "");
					const taxEl = fields.company_tax_id ? (queryField(fields.company_tax_id) || document.querySelector('[data-hpay-tax-id] input')) : null;
					const regEl = fields.company_reg_id ? (queryField(fields.company_reg_id) || document.querySelector('[data-hpay-reg-id] input')) : null;
					if(taxEl) taxEl.value = order_billing.company_tax_id;
					if(regEl) regEl.value = order_billing.company_reg_id;
				}else{
					window.h__company_tax_id = order_billing.company_tax_id || "";
					window.h__company_reg_id = order_billing.company_reg_id || "";
					window.h__company = HolestPayCheckout.cart.order_billing.company || "";
					order_billing.company_tax_id = "";
					order_billing.company_reg_id = "";
					if(cmp) __set_input_value(cmp, "");
				}
				applyCompanyVisibility(order_billing.is_company);
				callUpdateCompanyFields();
				if(isBlockCheckout){
					const fn = document.getElementById('billing-first_name');
					if(fn){ const v = fn.value; __set_input_value(fn, v + " "); __set_input_value(fn, v); }
				}
			};

			// ── is_company ──
			if(_isCompanyIsCompanyField){
				// Company name field doubles as the is_company indicator: presence of text = is_company
				if(!hpayHandled.has(companyInput)){
					hpayHandled.add(companyInput);
					companyInput.addEventListener('input', () => {
						const newVal = !!companyInput.value.trim();
						if(newVal !== checked) onIsCompanyChange(newVal);
					});
				}
			}else if(fields.is_company){
				const unhandledEls = existingIsCompanyEls.filter(el => !hpayHandled.has(el));
				if(unhandledEls.length > 0){
					// Attach to every unhandled element — covers radio groups, checkbox, select
					unhandledEls.forEach(el => {
						hpayHandled.add(el);
						el.addEventListener('change', () => onIsCompanyChange(readIsCompanyElValue(el)));
					});
				}else if(existingIsCompanyEls.length === 0 && !document.querySelector('[data-hpay-is-company]')){
					// Inject checkbox before the company field (block checkout)
					const companyWrap = companyInput.closest('.wc-block-components-text-input') || companyInput.parentElement;
				if(companyWrap && companyWrap.parentElement){
					const cbEl = createHpayCheckbox(
						'hpay-is-company',
						(HolestPayCheckout.labels && HolestPayCheckout.labels["Ordering as a company?"]) || "Ordering as a company?",
							checked, onIsCompanyChange
						);
						cbEl.dataset.hpayIsCompany = '1';
						companyWrap.parentElement.insertBefore(cbEl, companyWrap);
					}
				}
			}

			// ── company_tax_id (always after company field) ──
			if(fields.company_tax_id){
				const existingTax = queryField(fields.company_tax_id);
				if(existingTax && !hpayHandled.has(existingTax)){
					hpayHandled.add(existingTax);
					existingTax.addEventListener('input', e => { order_billing.company_tax_id = e.target.value; callUpdateCompanyFields(); });
				}else if(!existingTax && !document.querySelector('[data-hpay-tax-id]')){
					const companyWrap = companyInput.closest('.wc-block-components-text-input') || companyInput.parentElement;
					const taxEl = createHpayTextInput(
						fields.company_tax_id.replace(/^#/, ''),
						(HolestPayCheckout.labels && HolestPayCheckout.labels["Company Tax ID"]) || "Company Tax ID",
						order_billing.company_tax_id || "",
						val => { order_billing.company_tax_id = val; callUpdateCompanyFields(); }
					);
					taxEl.dataset.hpayTaxId = '1';
					companyWrap.insertAdjacentElement('afterend', taxEl);
				}
			}

			// ── company_reg_id (after tax_id, or after company field) ──
			if(fields.company_reg_id){
				const existingReg = queryField(fields.company_reg_id);
				if(existingReg && !hpayHandled.has(existingReg)){
					hpayHandled.add(existingReg);
					existingReg.addEventListener('input', e => { order_billing.company_reg_id = e.target.value; callUpdateCompanyFields(); });
				}else if(!existingReg && !document.querySelector('[data-hpay-reg-id]')){
					const companyWrap = companyInput.closest('.wc-block-components-text-input') || companyInput.parentElement;
					const anchorEl = document.querySelector('[data-hpay-tax-id]') || companyWrap;
					const regEl = createHpayTextInput(
						fields.company_reg_id.replace(/^#/, ''),
						(HolestPayCheckout.labels && HolestPayCheckout.labels["Company Register ID"]) || "Company Register ID",
						order_billing.company_reg_id || "",
						val => { order_billing.company_reg_id = val; callUpdateCompanyFields(); }
					);
					regEl.dataset.hpayRegId = '1';
					anchorEl.insertAdjacentElement('afterend', regEl);
				}
			}

			if(fields.is_company) applyCompanyVisibility(checked);

			// Push current order_billing state to WC Blocks session on the first successful
			// init. Without this, values already in order_billing (from page-load cart data)
			// would never reach the WC Blocks draft order unless the user manually interacted
			// with one of our custom fields — mirroring the original React render-based sync.
			if(order_billing && !_initialSyncDone){
				_initialSyncDone = true;
				callUpdateCompanyFields();
			}
		};

		// Read the actual current is_company state from whatever source is available
		const getIsCompanyChecked = () => {
			const fields = HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields;
			if(!fields || !fields.is_company) return true;
			if(_isCompanyIsCompanyField){
				const cmp = queryField(fields.company) || document.querySelector("input[name='billing_company']");
				return !!(cmp && cmp.value && cmp.value.trim());
			}
			// querySelectorAll handles radio groups — readIsCompanyElValue handles :checked lookup
			let els = [];
			try{ els = Array.from(document.querySelectorAll(fields.is_company)); }catch(e){}
			if(els.length > 0) return readIsCompanyElValue(els[0]);
			const injected = document.getElementById('hpay-is-company');
			if(injected) return injected.checked;
			return order_billing ? !!order_billing.is_company : true;
		};

		const scheduleInit = () => {
			if(hpayScheduled) return;
			hpayScheduled = true;
			requestAnimationFrame(() => {
				hpayScheduled = false;
				try{ initCompanyFields(); }catch(ex){ console.error(ex); }
				// Always re-enforce visibility on every DOM mutation — catches cases where
				// WooCommerce JS sets the is_company field value without triggering childList mutations
				if(HolestPayCheckout.cart && HolestPayCheckout.cart.UI && HolestPayCheckout.cart.UI.checkout_fields && HolestPayCheckout.cart.UI.checkout_fields.is_company){
					try{ applyCompanyVisibility(getIsCompanyChecked()); }catch(ex){ console.error(ex); }
				}
			});
		};

		new MutationObserver(scheduleInit).observe(document.body, { childList: true, subtree: true });
		scheduleInit();
	}
	
	if(document.querySelector("#billing_first_name_field span.required")){
		try{
			let root = document.querySelector(':root');
			if(root && window.getComputedStyle){
				root.style.setProperty('--hpay-wc-red', window.getComputedStyle(document.querySelector("#billing_first_name_field span.required")).color);
			}
		}catch(ex){
			console.error(ex);
		}
	}
	
	async function hpay_pay_order(order_id, pm_id, token){
		return fetch(HolestPayCheckout.ajax_url + "&operation=pay_order",{
			method:"POST",
			headers:{
					"Content-Type":"application/json"
			},
			body: JSON.stringify({
				vault_token_uid: token || "",
				order_id: order_id || "",
				hpayment_method_id: pm_id || ""
			})
		}).then(rawr => rawr.json()).then(resp => {
			if(resp.result){
				return resp.result;
			}else if(resp.pay_request){
				return new Promise((resolve) => {
					if(token == 'add-token'){
						hpay_adding_payment_method = true;
						const onClose = function(e){
							if(e && e.hpay_response && e.hpay_response.user_reason === true){
								window.location.reload();
							}
						};
						const onTokenResult = function(e){
							hpay_adding_payment_method = false;
							document.removeEventListener("onHPayResult",onTokenResult);
							document.removeEventListener("onHPayPanelClose",onClose);
							resolve(e.hpay_response);
						};
						
						
						document.addEventListener("onHPayPanelClose", onClose)
						document.addEventListener("onHPayResult",onTokenResult);
					}else{
						hpay_on_result_callaback = resolve;
					}
					presentHPayPayForm(resp.pay_request);
				});
			}else{
				if(resp.message){
					hpay_PresentPopup("payreq-error xs-popup", "", resp.message);
				}else if(resp.error){
					hpay_PresentPopup("payreq-error xs-popup", "--error--", resp.error);
				}
				return resp;	
			} 
		}).catch(err => {
			
			let err_txt = (err && err.message) ? err.message : "error";
			hpay_PresentPopup("payreq-error xs-popup", "--error--", err_txt);
			return {
				error: err_txt,
				error_code:500,
				error_ref: 11454565
			}
		});	
	} 

	async function hpay_save_pay_token(pm_id){
		return hpay_pay_order("", pm_id, 'add-token');
	}
	
	function change_subscription_payment_method_form(){
		const cpm = document.querySelector('form input[name="woocommerce_change_payment"]');
		if(cpm && cpm.form){
			const form = cpm.form;
			
			let let_submit = false;
			
			is_payment_token_from = true;
		
			form.addEventListener('submit', function(e) {
				if(let_submit)
					return;
				
				let pm_sel_el = form.querySelector("*[name='payment_method']:checked");
				if(pm_sel_el && pm_sel_el.value && /^hpaypayment-/.test(pm_sel_el.value)){
					let pm_id = parseInt(pm_sel_el.value.replace(/^hpaypayment-/,''));
					if(pm_id){
						e.preventDefault();
						let_submit = true;
						
						if(typeof HPay !== 'undefined' && HPay && HPay.POS && HPay.POS.payment){
							let pm = HPay.POS.payment.find(p=>p.HPaySiteMethodId == pm_id);
							
							if(pm && !pm.hasOwnProperty('SubscriptionsType') && pm.SubsciptionsType){
								pm.SubscriptionsType = pm.SubsciptionsType;
							}
							
							if(pm && pm.SubscriptionsType && /cof|mit/.test(pm.SubscriptionsType)){
								hpay_save_pay_token(pm_id).then(r => {
									if(r.vault_token_uid){
										const hiddenInput = document.createElement('input');
										hiddenInput.type = 'hidden';
										hiddenInput.name = 'save_vault_token_response';
										hiddenInput.value = JSON.stringify({
											vault_card_brand: r.vault_card_brand,
											vault_card_umask: r.vault_card_umask,
											vault_exp: r.vault_exp,
											vault_token_uid: r.vault_token_uid,
											vault_scope: r.vault_scope ,
											vault_onlyforuser: r.vault_onlyforuser
										});
										form.appendChild(hiddenInput);
										form.submit(); 
									}else{
										let_submit = false;
										hpay_PresentPopup("payreq-error xs-popup", HolestPayCheckout.labels.error , HolestPayCheckout.labels.error_contact_us);	
									}
								});
							}
						}
					}
				}
			});
			
			if(typeof HPayInit !== 'undefined')
				setTimeout(HPayInit,500);
		}
	}

	function add_payment_token_from() {
		const form = document.querySelector('form#add_payment_method');
		if (!form) return;
		
		let let_submit = false;
		
		is_payment_token_from = true;
		
		form.addEventListener('submit', function(e) {
			if(let_submit){
				return;
			}
			
			if(!form.querySelector("input[name='save_vault_token_response']")){
				let pm_sel_el = form.querySelector("*[name='payment_method']");
				if(pm_sel_el && pm_sel_el.value && /^hpaypayment-/.test(pm_sel_el.value)){
					let pm_id = parseInt(pm_sel_el.value.replace(/^hpaypayment-/,''));
					if(pm_id){
						e.preventDefault();
						let_submit = true;
						
						hpay_save_pay_token(pm_id).then(r => {
							if(r.vault_token_uid){
								
								const hiddenInput = document.createElement('input');
								hiddenInput.type = 'hidden';
								hiddenInput.name = 'save_vault_token_response';
								hiddenInput.value = JSON.stringify({
									vault_card_brand: r.vault_card_brand,
									vault_card_umask: r.vault_card_umask,
									vault_exp: r.vault_exp,
									vault_token_uid: r.vault_token_uid,
									vault_scope: r.vault_scope ,
									vault_onlyforuser: r.vault_onlyforuser
								});
								form.appendChild(hiddenInput);
								form.submit(); 
							}else{
								setTimeout(function(){
									form.submit(); 
								},3500);
							}
						});
					}
				}
			}
			
		});
		
		form.querySelectorAll("input[type='radio'][name*='_vault_token_id'][value='']").forEach(el=> el.checked = true); 
		
		if(typeof HPayInit !== 'undefined')
			setTimeout(HPayInit,500);
	};
	
	add_payment_token_from();
	change_subscription_payment_method_form();
	
	setTimeout(function(){
		document.querySelectorAll("a[href*='/hpay_direct_pay/']").forEach(el => {
			el.addEventListener("click", (e) => {
				e.preventDefault();
				let order_id = parseInt(el.getAttribute("href").split('/hpay_direct_pay/')[1]);
				if(order_id){
					hpay_pay_order(order_id);
				}
			},true);
		});	
	},150);
	
	
	
});

