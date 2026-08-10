/* HOLESTPAY JULY 2026*/
///////////////////////////////////////////
(function(){
	let ___hfetch = fetch;//TAKE ORIGINAL SAP
	const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
	
	if(window.HPayInit)
		return;
	
	let define = false;
	let module = false;
    //MD5/////////////////////////////////////////////////////////////
    !function(n){"use strict";function d(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function f(n,t,r,e,o,u){return d((u=d(d(t,n),d(e,u)))<<o|u>>>32-o,r)}function l(n,t,r,e,o,u,c){return f(t&r|~t&e,n,t,o,u,c)}function g(n,t,r,e,o,u,c){return f(t&e|r&~e,n,t,o,u,c)}function v(n,t,r,e,o,u,c){return f(t^r^e,n,t,o,u,c)}function m(n,t,r,e,o,u,c){return f(r^(t|~e),n,t,o,u,c)}function c(n,t){var r,e,o,u;n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;for(var c=1732584193,f=-271733879,i=-1732584194,a=271733878,h=0;h<n.length;h+=16)c=l(r=c,e=f,o=i,u=a,n[h],7,-680876936),a=l(a,c,f,i,n[h+1],12,-389564586),i=l(i,a,c,f,n[h+2],17,606105819),f=l(f,i,a,c,n[h+3],22,-1044525330),c=l(c,f,i,a,n[h+4],7,-176418897),a=l(a,c,f,i,n[h+5],12,1200080426),i=l(i,a,c,f,n[h+6],17,-1473231341),f=l(f,i,a,c,n[h+7],22,-45705983),c=l(c,f,i,a,n[h+8],7,1770035416),a=l(a,c,f,i,n[h+9],12,-1958414417),i=l(i,a,c,f,n[h+10],17,-42063),f=l(f,i,a,c,n[h+11],22,-1990404162),c=l(c,f,i,a,n[h+12],7,1804603682),a=l(a,c,f,i,n[h+13],12,-40341101),i=l(i,a,c,f,n[h+14],17,-1502002290),c=g(c,f=l(f,i,a,c,n[h+15],22,1236535329),i,a,n[h+1],5,-165796510),a=g(a,c,f,i,n[h+6],9,-1069501632),i=g(i,a,c,f,n[h+11],14,643717713),f=g(f,i,a,c,n[h],20,-373897302),c=g(c,f,i,a,n[h+5],5,-701558691),a=g(a,c,f,i,n[h+10],9,38016083),i=g(i,a,c,f,n[h+15],14,-660478335),f=g(f,i,a,c,n[h+4],20,-405537848),c=g(c,f,i,a,n[h+9],5,568446438),a=g(a,c,f,i,n[h+14],9,-1019803690),i=g(i,a,c,f,n[h+3],14,-187363961),f=g(f,i,a,c,n[h+8],20,1163531501),c=g(c,f,i,a,n[h+13],5,-1444681467),a=g(a,c,f,i,n[h+2],9,-51403784),i=g(i,a,c,f,n[h+7],14,1735328473),c=v(c,f=g(f,i,a,c,n[h+12],20,-1926607734),i,a,n[h+5],4,-378558),a=v(a,c,f,i,n[h+8],11,-2022574463),i=v(i,a,c,f,n[h+11],16,1839030562),f=v(f,i,a,c,n[h+14],23,-35309556),c=v(c,f,i,a,n[h+1],4,-1530992060),a=v(a,c,f,i,n[h+4],11,1272893353),i=v(i,a,c,f,n[h+7],16,-155497632),f=v(f,i,a,c,n[h+10],23,-1094730640),c=v(c,f,i,a,n[h+13],4,681279174),a=v(a,c,f,i,n[h],11,-358537222),i=v(i,a,c,f,n[h+3],16,-722521979),f=v(f,i,a,c,n[h+6],23,76029189),c=v(c,f,i,a,n[h+9],4,-640364487),a=v(a,c,f,i,n[h+12],11,-421815835),i=v(i,a,c,f,n[h+15],16,530742520),c=m(c,f=v(f,i,a,c,n[h+2],23,-995338651),i,a,n[h],6,-198630844),a=m(a,c,f,i,n[h+7],10,1126891415),i=m(i,a,c,f,n[h+14],15,-1416354905),f=m(f,i,a,c,n[h+5],21,-57434055),c=m(c,f,i,a,n[h+12],6,1700485571),a=m(a,c,f,i,n[h+3],10,-1894986606),i=m(i,a,c,f,n[h+10],15,-1051523),f=m(f,i,a,c,n[h+1],21,-2054922799),c=m(c,f,i,a,n[h+8],6,1873313359),a=m(a,c,f,i,n[h+15],10,-30611744),i=m(i,a,c,f,n[h+6],15,-1560198380),f=m(f,i,a,c,n[h+13],21,1309151649),c=m(c,f,i,a,n[h+4],6,-145523070),a=m(a,c,f,i,n[h+11],10,-1120210379),i=m(i,a,c,f,n[h+2],15,718787259),f=m(f,i,a,c,n[h+9],21,-343485551),c=d(c,r),f=d(f,e),i=d(i,o),a=d(a,u);return[c,f,i,a]}function i(n){for(var t="",r=32*n.length,e=0;e<r;e+=8)t+=String.fromCharCode(n[e>>5]>>>e%32&255);return t}function a(n){var t=[];for(t[(n.length>>2)-1]=void 0,e=0;e<t.length;e+=1)t[e]=0;for(var r=8*n.length,e=0;e<r;e+=8)t[e>>5]|=(255&n.charCodeAt(e/8))<<e%32;return t}function e(n){for(var t,r="0123456789abcdef",e="",o=0;o<n.length;o+=1)t=n.charCodeAt(o),e+=r.charAt(t>>>4&15)+r.charAt(15&t);return e}function r(n){return unescape(encodeURIComponent(n))}function o(n){return i(c(a(n=r(n)),8*n.length))}function u(n,t){return function(n,t){var r,e=a(n),o=[],u=[];for(o[15]=u[15]=void 0,16<e.length&&(e=c(e,8*n.length)),r=0;r<16;r+=1)o[r]=909522486^e[r],u[r]=1549556828^e[r];return t=c(o.concat(a(t)),512+8*t.length),i(c(u.concat(t),640))}(r(n),r(t))}function t(n,t,r){return t?r?u(t,n):e(u(t,n)):r?o(n):e(o(n))}"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:n.md5=t}(this);
	//////////////////////////////////////////////////////////////////
	function sha512Async(str, callback) {
	  return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
		let res = Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
		if(callback) callback(res);
		return res;
	  });
	}
	//////////////////////////////////////////////////////////////////
	const makerandom = function(length) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
		  result += characters.charAt(Math.floor(Math.random() * charactersLength));
		  counter += 1;
		}
		return result;
	};
	///////////////////////////////////////////////////////////////////
	
	const normalizeLng = function(lng){
		return String(lng || "").toLowerCase().replace('sr','rs');	
	};
	
	function isVisible(element) {
	  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	}
	
	let attachHandler = function(el, event_name, callback){
		if(el.addEventListener){
			el.addEventListener(event_name, callback);
		}else if(el.attachEvent){
			el.attachEvent("on" + event_name, callback);
		}
	};
	
	let onDocumentReady = function(fn) {
		if (document.readyState === "complete" || document.readyState === "interactive") {
			setTimeout(fn, 1);
		} else {
			document.addEventListener("DOMContentLoaded", fn);
		}
	};    
	
	let holestpay_panel    = null;
	let client_wait_screen = null;
	//let request_data    = null;
	
	const getRunningScript = (path) => {
		let spath = (() => () => (new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0].replace(/\(|\)/g,'')))()();
		if(path) return spath.replace(/\/[^\/]*$/,'/' + String(path).replace(/^\//,''));
		return spath;
	};
	
	const debugMessages = () => {
		try{
			if(is_sandbox && localStorage.hpay_debug_messages){
				return true;
			}
		}catch(ex){}
		return false;
	};
	
	const objToQs = (obj) => {
		if(!obj) return "";
		return Object.keys(obj).map(k=> (String(k) + "=" + encodeURIComponent(String(obj[k])))).join("&");
	};
	
	let is_sandbox        = false;
	let merchant_site_uid = null;
    let merchant_language = null;	
	let fixed_language    = null;
	
	let __HPAY_CLIENT     = null;
	let __FIRST_INIT      = false;
	let onInit            = null;
	let hpay_base_url     = null;
	let is_indev          = false;
	let checkout_session_uid   = "hpay-" + parseInt(Math.random() * 99999) + "-" + parseInt(Math.random() * 99999); 
	let __current_docked  = null;
	let __chartUpdatedHookSet = false;
	let __dock_frames         = {}; 
	let __setPaymentMethodDock_handle = null;
	let  _currentRequestData = null;
	let checkouts_to_check   = {};
	// try{
		// if(typeof sessionStorage !== 'undefined' && sessionStorage.__hpay_checkouts_to_check)
			// checkouts_to_check = JSON.parse(sessionStorage.__hpay_checkouts_to_check);
	// }catch(ex){}
	
	let addChecksum27 = (str) =>  {
	  let sum = 0;
	  str = String(str); 
	  for (let i = 0; i < str.length; i++) {
		sum += str.charCodeAt(i);
	  }
	  const checksum = String(sum % 27).padStart(2, '0');
	  return str + checksum;
	};
	
	const extractNumber = (nstr) => {
		return parseFloat(String(nstr).replace(/[^0-9\,\.]/g,'').replace(/\,/g,'.').replace(/\.(?=.*?\.)/g, '')) || 0.00;
	};
	
	const extractCurrency = (cstr) => {
		let c = String(cstr).replace("$","USD").replace("€","EUR").toUpperCase().replace(/[^A-Z]/g,'');
		if(c.length == 3) return c;
		return "";
	};
	
	try{
	  let current_script = getRunningScript();	
	  
	  if(/[\?|\&]merchant_site_uid=/i.test(current_script)){
		  merchant_site_uid = (current_script.split(/[\?|\&]merchant_site_uid=/i)[1]).split("&")[0].trim();
	  }
	  
	  if(/[\?|\&]lang=/i.test(current_script)){
		  merchant_language = (current_script.split(/[\?|\&]lang=/i)[1]).split("&")[0].trim();
	  }
	  
	  if(/sandbox\.pay\.holest/.test(current_script)){
		  is_sandbox = true;
		  hpay_base_url = "https://sandbox.pay.holest.com";
	  }else{
		  is_sandbox = false;
		  hpay_base_url = "https://pay.holest.com";
	  }
	  
	  is_indev = /\.indev\./.test(current_script);
	  
	  try{
		  if(sessionStorage.__dev_scripts_load){
			  is_indev = true;
		  }
	  }catch(s_ex){}
	  
	  onInit = function(){ 
		  document.querySelectorAll("script[src*='" + (is_sandbox ? "sandbox." : "") + "pay.holest.com/clientpay/cscripts/hpay.']").forEach(s => {
			 if(s.getAttribute("onInit")){
				try{
					if(window[s.getAttribute("onInit")]){
						window[s.getAttribute("onInit")]();
					}
				}catch(ex){
					//
				} 
			 }
		  });
	  }
	}catch(exc){
		//
	}
	
	const reportFrontError = (...error_data) => {
		___hfetch(hpay_base_url + "/clientpay/reportscrerror",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
			source:"hpay-js",
			errorData: [...error_data],
			request_data: _currentRequestData || "--",
			merchant_site_uid: merchant_site_uid || "--",
			checkout_session_uid: checkout_session_uid || "--",
			clientErrorInfo:{
				source:"hpay-js",
				location: {
					href: window.location.href || "",
					origin: window.location.origin || "",
					hash: window.location.hash || ""
				},
				navigator: {
					userAgent: navigator.userAgent || "",
					appVersion: navigator.appVersion || "",
					language: navigator.language || "",
					platform: navigator.platform || "",
					cookieEnabled: navigator.cookieEnabled || ""
				},
				datetime: {
					timestamp: new Date().toISOString(),
					timezoneOffset: new Date().getTimezoneOffset()
				}
			}
		})}).catch(console.error);
	};
	
	let HolestPayClient = function(merchantUid, language, environment){
		merchant_site_uid = merchantUid;
		merchant_language = language;
		let EXCHANGE_RATE_CACHE = {};
		
		if(environment){
			if(environment == "production" || environment == "sandbox"){
				if(environment == "production"){
					is_sandbox = false;
					hpay_base_url = "https://pay.holest.com";
				}else{
					is_sandbox = true;
					hpay_base_url = "https://sandbox.pay.holest.com";
				}
			}
		}
		
		this.extractNumber = extractNumber;
		this.extractCurrency = extractCurrency;
		
		this.getMerchantSiteUid = function(){
			return merchant_site_uid;
		};
		
		this.getMerchantLanguage = function(){
			return merchant_language;
		};
		
		let currentlang = null;
		let self = this;
		
		let getPOSConfiguration = async function(callback, lang){
			try{
				currentlang = fixed_language || lang || language;
				
				let res = await ___hfetch(hpay_base_url + "/clientpay/getposdata",{
					method:"POST",
					headers:{
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						request_data: packDataForTransfer({
											merchant_site_uid: merchantUid,
											hpaylang: normalizeLng(currentlang),
											source: "client",
											view: self.view || "frontend"
									  })
					})
				}).then(r => r.json());
				
				if(res.response){
					res = unpackTransferData(res.response);
				}
				
				if(callback){
					try{ callback(res) }catch(uexc){}	
				}
				try{
					if(res && res.FixedLanguage){
						fixed_language = res.FixedLanguage || null;
						if(fixed_language){
							currentlang = fixed_language;
						}
					}
					if(res && res.pos_parameters["Input Form Style"] && res.pos_parameters["Input Form Style"]["primaryColor"]){
						document.documentElement.style.setProperty('--hpay-primary-color', res.pos_parameters["Input Form Style"]["primaryColor"]);
					}
				}catch(pex){
					console.error(pex);
				}
				return res;
			}catch(ex){
				return {error: ex.message, error_code: -1};
			}
		};
		
		this.filter_methods = async function (mehods_type, country2, total, currency){
			if(!__HPAY_CLIENT || !__HPAY_CLIENT.POS || !__HPAY_CLIENT.POS[mehods_type] || !__HPAY_CLIENT.POS[mehods_type].length)
				return [];
			let filtered = __HPAY_CLIENT.POS[mehods_type].filter(m => !(m.Hidden && !/false|0|no/i.test(String(m.Hidden))));
			let oamt = extractNumber(total);
			if(total || /0/.test(String(total))){
				let tmp = [];
				for(var i = 0; i < filtered.length; i++){
					let m = filtered[i];
					let ocur = extractCurrency(total) || currency || m.PaymentCurrency || "";
					
					if(m["Minimal Order Amount"] || m["Maximal Order Amount"]){
						if(m["Minimal Order Amount"] && parseFloat(m["Minimal Order Amount"]) > 0){
							let ccur = extractCurrency(m["Minimal Order Amount"]) || m.PaymentCurrency || currency || "";
							let camt = extractNumber(m["Minimal Order Amount"]);
							if((!ocur || !ccur) || (ocur == ccur)){
								if(oamt < camt) continue;
							}else{
								let e_rate = await this.getMerchantExchnageRate(ocur,ccur);
								if(!e_rate.rate) continue;
								let e_omt = oamt * e_rate.rate;
								if(e_oamt < camt) continue;
							}
						}
						if(m["Maximal Order Amount"] && parseFloat(m["Maximal Order Amount"]) > 0){
							let ccur = extractCurrency(m["Maximal Order Amount"]) || m.PaymentCurrency || currency || "";
							let camt = extractNumber(m["Maximal Order Amount"]);
							if((!ocur || !ccur) || (ocur == ccur)){
								if(oamt > camt) continue;
							}else{
								let e_rate = await this.getMerchantExchnageRate(ocur,ccur);
								if(!e_rate.rate) continue;
								let e_omt = oamt * e_rate.rate;
								if(e_oamt > camt) continue;
							}
						}
						tmp.push(m);
					}else{
						tmp.push(m);
					}
				}
				filtered = tmp;
			}
			
			if(country2){
				country2 = String(country2).trim().toUpperCase().substring(0,2);
				if(country2 == 'SR' || country2 == 'СР' || country2 == 'РС') country2 = "RS"; 
				if(country2 == 'МК') country2 = "MK"; 
				let tmp = [];
				for(var i = 0; i < filtered.length; i++){
					let m = filtered[i];
					if(m["Only For Countries"] && m["Only For Countries"].length){
						if(m["Only For Countries"].indexOf(country2) == -1) continue;
					}
					if(m["Excluded Countries"] && m["Excluded Countries"].length){
						if(m["Excluded Countries"].indexOf(country2) != -1) continue;
					}
					tmp.push(m);
				}
				filtered = tmp;
			}
			return filtered;
		};
		
		this.availablePaymentMethods = async function(country2, total, currency){
			if(typeof HolestPayCheckout !== 'undefined' && HolestPayCheckout && HolestPayCheckout.cart){
				if((country2 === undefined || country2 === null) && HolestPayCheckout.cart.order_billing && HolestPayCheckout.cart.order_billing.country)
					country2 = HolestPayCheckout.cart.order_billing.country;
				if(total === undefined || total === null){
					total = HolestPayCheckout.cart.order_amount || null;
					currency = HolestPayCheckout.cart.order_currency || "";
				}
			}
			return this.filter_methods("payment", country2, total, currency);
		};
		
		this.availableShippingMethods = async function(country2, cart_total, currency){
			if(typeof HolestPayCheckout !== 'undefined' && HolestPayCheckout && HolestPayCheckout.cart){
				if((country2 === undefined || country2 === null) && HolestPayCheckout.cart.order_billing && HolestPayCheckout.cart.order_billing.country)
					country2 = HolestPayCheckout.cart.order_billing.country;
				if(cart_total === undefined || cart_total === null){
					cart_total = HolestPayCheckout.cart.cart_amount || HolestPayCheckout.cart.order_amount || null;
					currency = HolestPayCheckout.cart.order_currency || "";
				}
			}
			return this.filter_methods("shipping", country2, cart_total, currency);
		};
		
		this.getPayByLinkForOrderUid = (order_uid) => {
			if(!__HPAY_CLIENT || !__HPAY_CLIENT.POS)
				return null;
			return hpay_base_url + "/pbl/" + __HPAY_CLIENT.POS.HPaySiteId + "-" + addChecksum27(String(order_uid).replace(/^PBL/,''));
		};
		
		this.getMerchantExchnageRate = async function(from, to, callback){
			if(from == to){
				try{
					if(callback){
						callback({rate: 1.00});	
					}
				}catch(ex){
					console.error(ex);
				}
				return {rate: 1.00};
			}
			
			let rate = await this.getExchnageRate(from, to);
			if(!rate.error){
				if(parseFloat(this.POS.ExchanageCorrection)){
					rate = Object.assign({}, rate);
					rate.rate *= (1 + parseFloat(this.POS.ExchanageCorrection)/100); 
				}
			}
			
			try{
				if(callback){
					callback(rate);	
				}
			}catch(ex){
				console.error(ex);
			}
			
			return rate;
		};
		
		this.getExchnageRate = async function(from, to, callback){
			if(from == to){
				try{
					if(callback){
						callback({rate: 1.00});	
					}
				}catch(ex){
					console.error(ex);
				}
				return {rate: 1.00};
			}
			
			if(EXCHANGE_RATE_CACHE[String(from) + String(to)]){
				return EXCHANGE_RATE_CACHE[String(from) + String(to)];
			}
			
			try{
				let res = await ___hfetch(hpay_base_url + "/clientpay/exchangerate?from=" + String(from) + "&to=" + String(to),{
					method:"GET",
					headers:{
						"Content-type": "application/json"
					}
				}).then(r => r.json());
				
				if(res && !res.error){
					EXCHANGE_RATE_CACHE[String(from) + String(to)] = res;
				}
				
				if(callback){
					try{ callback(res) }catch(uexc){}	
				}
				
				return res;
			}catch(ex){
				return {error: ex.message, error_code: -1};
			}
		};
		
		this.addQueryArg = (url,param_name, param_value) => {
			if(/\?/.test(url || "")){
				return (url || "") + "&" + param_name + "=" + encodeURIComponent(param_value);
			}else{
				return (url || "") + "?" + param_name + "=" + encodeURIComponent(param_value);
			}
		};

		this.addQueryArgs = (url, params) => {
			if(params){
				for(var param in params){
					if(params.hasOwnProperty(param)){
						url = this.addQueryArg(url, param, params[param]);
					}
				}
			}
			return url;
		};
		
		this.setPaymentMethodDock = ( payment_method_id, data, dock_container, force_new ) => {
			
			if(_in_pay_session)
				return;//if pay modal is opened
			
			if(__setPaymentMethodDock_handle){
				clearTimeout(__setPaymentMethodDock_handle);
				__setPaymentMethodDock_handle = null;
			}
			__setPaymentMethodDock_handle = setTimeout(()=>{
				__setPaymentMethodDock_handle = null;
				__HPAY_CLIENT.__doSetPaymentMethodDock(payment_method_id, data, dock_container, force_new);
			},100);
			
			addHPayStyles();
		};
		
		this.__doSetPaymentMethodDock = ( payment_method_id, data, dock_container, force_new ) => {
			try{
				if(data && payment_method_id && __HPAY_CLIENT && __HPAY_CLIENT.POS && __HPAY_CLIENT.POS.payment){
					data.hpaylang = normalizeLng(data.hpaylang || currentlang || "");
					
					if(data.hpaylang && __current_docked && __current_docked.data && __current_docked.data.hpaylang != data.hpaylang){
						force_new = true;
					}
					
					let pm = __HPAY_CLIENT.POS.payment.find(p => (p.HPaySiteMethodId == payment_method_id || p.Uid == payment_method_id));
					if(pm){
						if(pm.PayInputUrl){
							let vault_el = null;
							let cnt_el = null;
							for(var prop in data){
								if(data.hasOwnProperty(prop) && /^(order_amount|order_currency|monthly_installments|vault_token_uid)$/.test(prop)){
									if(data[prop]){
										if(typeof data[prop] === "string" && !parseFloat(data[prop]) && /\#|\.|input|select|textarea|div|span/i.test(data[prop])){
											try{
												data[prop] = data[prop].replace(/\{\$pmid\}/g,payment_method_id);
												data[prop] = document.querySelector(data[prop]);
											}catch(selex){}
										}
										if(data[prop] && data[prop] instanceof HTMLElement){
											if(!/input|select|textarea/i.test(data[prop].tagName)){
												if(data[prop].querySelector("input,select,textarea")){
													data[prop] = data[prop].querySelector("input,select,textarea");
												}
											}
											if(/input|select|textarea/i.test(data[prop].tagName)){
												data[prop] = data[prop].value;
											}else{
												data[prop] = data[prop].innerText.trim()
											}
											if(!data[prop]){
												data[prop] = null;
											}
										}
									}
								}
							}
							
							if(dock_container && typeof dock_container === 'string'){
								try{
									dock_container = document.querySelectorAll(dock_container.replace(/\{\$pmid\}/g, payment_method_id));
									if(dock_container.length){
										for(var i = 0; i < dock_container.length; i++){
											if(isVisible(dock_container[i])){
												dock_container = dock_container[i];
												break;
											}
										}
									}else
										dock_container = null;
								}catch(selex){}
							}
							if(!dock_container){
								dock_container = document.querySelectorAll("div[data-hpay-dock-payment]");
								if(dock_container.length){
									for(var i = 0; i < dock_container.length; i++){
										if(isVisible(dock_container[i])){
											dock_container = dock_container[i];
											break;
										}
									}
								}else
									dock_container = null;
							}
							
							if(!data.order_currency){
								data.order_currency = "RSD";
							}
							
							if(dock_container){
								let existed = false;
								
								if(__dock_frames[pm.HPaySiteMethodId] && !__dock_frames[pm.HPaySiteMethodId].parentNode){
									force_new = true;
								}
								
								if(force_new && __dock_frames[pm.HPaySiteMethodId]){
									if(__dock_frames[pm.HPaySiteMethodId].parentNode){
										__dock_frames[pm.HPaySiteMethodId].parentNode.removeChild(__dock_frames[pm.HPaySiteMethodId]);
									}
									dock_container.innerHTML = '';
									delete __dock_frames[pm.HPaySiteMethodId];
								}
								
								if(!__dock_frames[pm.HPaySiteMethodId]){
									
									let ifr = document.createElement("iframe");
									__dock_frames[pm.HPaySiteMethodId] = ifr;
									
									ifr.className = 'hpay-dock-frame hpay-dock-frame-loading';
									ifr.setAttribute("src",this.addQueryArgs(pm.PayInputUrl,{
										"docked": window.location.href.split("?")[0],//DO NOT ENCODE HERE 
										"checkout_session_uid": checkout_session_uid,
										"payment_method_id": pm.HPaySiteMethodId,
										"hpaylang": normalizeLng(data.hpaylang)
									}));
									
									ifr.setAttribute("frameborder","0");
									ifr.style.minWidth = '100%';
									// ifr.addEventListener("onload", () => {
										// if(__current_docked && __current_docked.payment_method_id == pm.HPaySiteMethodId){
											
										// }
									// }, false);
									
									attachHandler(window,"message", function(e){
										if(e.data && e.data.checkout_session_uid == checkout_session_uid && e.data.payment_method_id == pm.HPaySiteMethodId){
											if(debugMessages()){
												console.log("hpay dock message received", e.data);
											}
										
											if(e.data.command == "dock_load"){
												
												ifr.className = String(ifr.className).replace(" hpay-dock-frame-loading","");
												if(String(ifr.className).indexOf("hpay-dock-frame-loaded") == -1){
													ifr.className += " hpay-dock-frame-loaded";
												}
												ifr.msource = e.source;
												
												__HPAY_CLIENT.getMerchantExchnageRate(data.order_currency, pm.PaymentCurrency || data.order_currency, (r) => {
													
													let __cur_data = null;
													if(__current_docked && __current_docked.data && __current_docked.payment_method_id == pm.HPaySiteMethodId){
														__cur_data = __current_docked.data;
													}
													
													let exchange_rates = {};
													exchange_rates[data.order_currency + (pm.PaymentCurrency || data.order_currency)] = r.rate;
													ifr.msource.postMessage({
														command: "setPublicDockData",
														checkout_session_uid: checkout_session_uid,
														payment_method_id: pm.HPaySiteMethodId,
														data: packDataForTransfer({
															...data,
															...(__cur_data || {}),
															exchange_rates: exchange_rates,
															POS: __HPAY_CLIENT.POS
														})
													},ifr.getAttribute("src").split("?")[0]);
												});
												
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
												
											}else if(e.data.command == "dock_dimensions"){
												ifr.style.height = e.data.height + "px";												
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
											}else if(e.data.command == "dock-setlocation"){
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
												window.location.href = e.data.href;
											}else if(e.data.command == "hppformiddleware"){
												if(middleware_source){
													middleware_source.postMessage({
														action:"hppsite_dock_message",
														checkout_session_uid: e.data.message.checkout_session_uid,
														payment_method_id: e.data.message.payment_method_id,
														docked_payment_method_id: e.data.message.docked_payment_method_id,
														message: e.data.message
													},hpay_base_url);
													if(debugMessages()){
														console.log("hpay dock message handled", e.data);
													}
												}
											}else if(e.data.command == "dock_assertError"){
												closeHP("error");
												
												reportFrontError({
													error: "dock_assertError",
													...e.data
												});
												
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
											}else if(e.data.command == "user-challenge-frame-on"){
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
												ifr.className = ifr.className.replace(/\s?user-challenge-frame-(on|off)/,'') + " user-challenge-frame-on";
												if(ifr.parentNode){
													for(var cus of ifr.parentNode.querySelectorAll('a.hpay-cancel-user-challenge')){
														cus.parentNode.removeChild(cus);//clean
													}
												}
												ifr.cancelchallenge = document.createElement('a');
												ifr.cancelchallenge.className = 'hpay-cancel-user-challenge';
												attachHandler(ifr.cancelchallenge,"click",(e) => {
													e.preventDefault();
													ifr.className = ifr.className.replace(/\s?user-challenge-frame-(on|off)/,'') + " user-challenge-frame-off";
													ifr.msource.postMessage({//card 3d does not recive this
														command: "user-challenge-cancel",
														checkout_session_uid: checkout_session_uid,
														payment_method_id: pm.HPaySiteMethodId
													},ifr.getAttribute("src").split("?")[0]);
													setTimeout(function(){
														closeHP("cancel");
														self.setPaymentMethodDock(payment_method_id,data,dock_container,true);	
													},350);	
												});
												if(ifr.parentNode)
													ifr.parentNode.appendChild(ifr.cancelchallenge);
											}else if(e.data.command == "user-challenge-frame-off"){
												ifr.className = ifr.className.replace(/\s?user-challenge-frame-(on|off)/,'') + " user-challenge-frame-off";
												if(ifr.cancelchallenge && ifr.cancelchallenge.parentNode){
													ifr.cancelchallenge.parentNode.removeChild(ifr.cancelchallenge);
												}
												if(debugMessages()){
													console.log("hpay dock message handled", e.data);
												}
											}else if(e.data.command == "dock-reset"){
												if(/user-challenge-frame-off/.test(ifr.className)){
													setTimeout(function(){
														closeHP("cancel");
														self.setPaymentMethodDock(payment_method_id,data,dock_container,true);	
													},350);	
												}else{
													closeHP("cancel");
													self.setPaymentMethodDock(payment_method_id,data,dock_container,true);
												}
											} 
										}
									});
								}else{
									existed = true;
								}
								
								let dataInit = !__current_docked;
								if(__current_docked && __current_docked.ifr !== __dock_frames[pm.HPaySiteMethodId]){
									dataInit = true;
									if(__current_docked.ifr && __current_docked.ifr.parentNode){
										//__current_docked.ifr.parentNode.removeChild(__current_docked.ifr);
										__current_docked.ifr.style.display = 'none';
									}
								}
								
								if(!__dock_frames[pm.HPaySiteMethodId].parentNode){
									dock_container.appendChild(__dock_frames[pm.HPaySiteMethodId]);
								}else if(__dock_frames[pm.HPaySiteMethodId].parentNode !== dock_container){
									__dock_frames[pm.HPaySiteMethodId].parentNode.removeChild(__dock_frames[pm.HPaySiteMethodId]);
									dock_container.appendChild(__dock_frames[pm.HPaySiteMethodId]);
								}
								__current_docked = {
									ifr: __dock_frames[pm.HPaySiteMethodId],
									payment_method_id: payment_method_id,
									data: data
								};
								
								if(__current_docked.ifr.style.display == 'none'){
									__current_docked.ifr.style.display = "";
								}
								
								if(__current_docked.ifr.msource){
									__HPAY_CLIENT.getMerchantExchnageRate(data.order_currency, pm.PaymentCurrency || data.order_currency, (r) => {
										let exchange_rates = {};
										exchange_rates[data.order_currency + (pm.PaymentCurrency || data.order_currency)] = r.rate;
										
										let __cur_data = null;
										if(__current_docked && __current_docked.data && __current_docked.payment_method_id == pm.HPaySiteMethodId){
											__cur_data = __current_docked.data;
										}
										
										__current_docked.ifr.msource.postMessage({
											command: dataInit ? "setPublicDockData" : "updatePublicDockData",
											checkout_session_uid: checkout_session_uid,
											payment_method_id: pm.HPaySiteMethodId,
											data: packDataForTransfer({
												...data,
												...(__cur_data || {}),
												exchange_rates: exchange_rates,
												...(dataInit ? {POS: __HPAY_CLIENT.POS} : {})
											})
										},__current_docked.ifr.getAttribute("src").split("?")[0]);
									});
								}
								
								return;
							}
						}
					}
				}
				
				if(__current_docked){
					if(__current_docked.ifr && __current_docked.ifr.parentNode){
						__current_docked.ifr.style.display = 'none';
						//__current_docked.ifr.parentNode.removeChild(__current_docked.ifr);
					}
				}
			}catch(ex){
				console.error(ex);
			}
			__current_docked = null;
		};
		
		this.getCurrentPaymentMethodDock = () => {
			return __current_docked;
		};
		
		this.init = async function(){
			let POS = await getPOSConfiguration();
			
			if(!POS)
				POS = {error: "Unable to initialize HPay"};
			
			if(POS.error){
				throw POS;
			}
			this.POS = POS;
			
			try{
				let scopes = ["payment","shipping","fiscal"];
				let can_evl = false; 
				try {
					can_evl = eval('true');
				} catch (eex) {}
				for(var j = 0; j < scopes.length; j++){
					let scope = scopes[j];
					if(this.POS && this.POS[scope] && this.POS[scope].length){
						let ffn = "e-v";
						for(var i = 0; i < this.POS[scope].length;i++){
							let p2 = "a-l" + i; 
							
							for(var mprop in this.POS[scope][i]){
								if(this.POS[scope][i].hasOwnProperty(mprop)){
									if(this.POS[scope][i][mprop] && typeof this.POS[scope][i][mprop] === 'string' && /^function\(|^async function\(|^\(.*\)\s*=>\s*{.*}\s*$|^async \(.*\)\s*=>\s*{.*}\s*$/.test(this.POS[scope][i][mprop])){
										try{
											let sfn = this.POS[scope][i][mprop];
											let fprop = "__s" + parseInt(Math.random() * 999999); 
											window[fprop] = null;
											window[(ffn + p2).replace(/\-/g,"").substring(0,4)](fprop + " = " + sfn + "");
											this.POS[scope][i][mprop] = window[fprop];
											delete window[fprop];
										}catch(eex){
											delete this.POS[scope][i][mprop];
										}
									}
								}
							}
						}
					}
				}
			}catch(ex){
				
			}
			
			try{
				if(onInit)
					onInit();
			}catch(ex){
				//
			}
			return true;
		};
		
		this.syncPOS = async function(callback){
			let POS = await getPOSConfiguration();
			if(POS.error){
				if(callback){
					callback(POS);
				}
				throw POS;
			}
			this.POS = POS;
			if(callback){
				callback(POS);
			}
			return POS;
		};
		
		this.setLanguage = async function(lng, callback){
			
			if(currentlang != lng){
				let POS = await getPOSConfiguration(null, lng);
				if(POS.error){
					throw POS;
				}
				this.POS = POS;
			}
			
			if(callback){
				callback(currentlang);
			}
		};
		
		this.getLanguage = function(){
			return currentlang;
		};
		
		this.getUserPaymentMethods = function(){
			let user_pmethods = [];
			if(this.POS.payment && this.POS.payment.length){
				let group_map = {};
				for(var i = 0; i < this.POS.payment.length; i++){
					if(this.POS.payment[i].Group){
						if(!group_map.hasOwnProperty(this.POS.payment[i].Group)){
							group_map[this.POS.payment[i].Group] = user_pmethods.length;
							this.POS.payment[i].method_siblings = [];
							user_pmethods.push(this.POS.payment[i]);
						}else{
							user_pmethods[group_map[this.POS.payment[i].Group]].method_siblings.push(this.POS.payment[i]);
						}
					}else{
						user_pmethods.push(this.POS.payment[i]);
					}
				}
				return user_pmethods;
			}else{
				return [];
			}
		};
		
		this.getUserShippingMethods = function(){
			return this.POS.shipping || [];
		};
		
		this.getUserFiscalMethods = function(){
			return this.POS.fiscal || [];
		};
		
		this.enterClientWait = function(){
			
			if(holestpay_panel)
				return;
			
			if(client_wait_screen){
				return;
			}
			
			addHPayStyles();
			
			client_wait_screen = document.createElement("div");
			client_wait_screen.setAttribute("id","hpay_payment_panel_wrapper");
			client_wait_screen.__spinner = document.createElement("div");
			client_wait_screen.__spinner.className = 'hpay-spinner';
			client_wait_screen.appendChild(client_wait_screen.__spinner);
			
			Object.assign(client_wait_screen.style, hpayWrapperStyle());
			document.body.appendChild(client_wait_screen); 
			
			if(!/hpay-backdrop/.test(document.body.className || ""))
				document.body.className = (document.body.className || "") + ' hpay-backdrop';
		};
		
		this.exitClientWait  = function(){
			if(client_wait_screen){
				if(client_wait_screen.parentNode){
					client_wait_screen.parentNode.removeChild(client_wait_screen);
				}
				client_wait_screen = null;
			}
			
			if(holestpay_panel)
				return;
			
			document.body.className = (document.body.className || "").replace(/ hpay\-backdrop/g,'');
		};
		
		let loadTranlations = async function(lang){
			if(!lang) lang = fixed_language || merchant_language;
			try{
				if(typeof __hpay_translations !== 'undefined' && __hpay_translations && lang){
					if(!(__hpay_translations && __hpay_translations[lang] && __hpay_translations[lang].__t_load)){
						if(!__hpay_translations[lang]) __hpay_translations[lang] = {};
						__hpay_translations[lang].__t_load = 1;
						return await fetch(hpay_base_url + "/clientpay/translations?languages=" + lang).then(r=>r.json()).then(r=> {
							try{
								if(r && r[lang]){
									Object.keys(r[lang]).forEach(k => {
										__hpay_translations[lang][k] = r[lang][k];	
									});
								}
							}catch(ex){}
							return true;
						}).catch(err => {
							return false;
						});
					}
				}
			}catch(ex){console.error(ex)}
			return null;
		};
		
		let __loadHUIPromise   = null;
		this.loadHPayUI = async function(callback){
			if(typeof hpay_require_script === 'function'){
				await loadTranlations();
				if(callback && typeof callback === 'function'){
					try{
						callback();
					}catch(ex){
						
					}
				}
				return true;
			}else{
				if(!__loadHUIPromise){
					__loadHUIPromise = new Promise((resolve, reject) => {
						try {
							const scriptEle = document.createElement("script");
							scriptEle.type  = "text/javascript";
							scriptEle.async = true;
							scriptEle.src   = (hpay_base_url + "/clientpay/cscripts/") + (is_indev ? "hpay.clientadmin.ui.indev.js" : "hpay.clientadmin.ui.js" );
							
							scriptEle.addEventListener("load", (ev) => {
								setTimeout(async function(){
									await loadTranlations();
									resolve(true);	
								},50)
							});

							scriptEle.addEventListener("error", (ev) => {
								resolve(false);	
							});
							
							document.body.appendChild(scriptEle);
							
						} catch (error) {
							resolve(false);
						}
					});
				}
				
				let loaded = await __loadHUIPromise;
				
				//"https://" + (__hpay_ui_environment() == "sandbox" ? "sandbox." : "") + "pay.holest.com/clientpay/translations?languages="
				
				
				if(callback && typeof callback === 'function'){
					try{
						callback();
					}catch(ex){
						
					}
				}
				return loaded;
			}
		};
		
		Object.defineProperty(this, 'presentHPayPayForm', {
		  get() {
			  if(typeof _presentHPayPayForm === 'function'){
				  return _presentHPayPayForm;
			  }
			  return undefined;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
		
		Object.defineProperty(this, 'HPayIsSandbox', {
		  get() {
			  if(typeof HPayIsSandbox !== 'undefined'){
				  return HPayIsSandbox;
			  }
			  return HPayIsSandbox;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	};
	
	let HolestPayAdminClient = function(merchantUid, language, environment, secretkey){
		HolestPayClient.apply(this,arguments);
		
		if(!secretkey){
			throw {error: "Secret key required!", error_code:-1};
		}
		
		this.verifyRequestCredentials = async function(callback){
			try{
				
				let hashedstring        = makerandom(48);
				let verificationhash    = await sha512Async(md5(hashedstring + merchantUid) + secretkey);
				
				let res = await ___hfetch(hpay_base_url + "/clientpay/verifyrequestcredentials",{
					method:"POST",
					headers:{
						"Content-type": "application/json"
					},
					body: JSON.stringify({
						request_data: packDataForTransfer({
											merchant_site_uid: merchantUid,
											hashedstring: hashedstring,
											verificationhash: verificationhash,
											hpaylang: normalizeLng(language)
									  })
					})
				}).then(r => r.json());
				
				if(res.response){
					res = unpackTransferData(res.response);
				}
				
				if(callback){
					try{ callback(res) }catch(uexc){}	
				}
				return res;
			}catch(ex){
				return {error: ex.message, error_code: -1};
			}
		};
		
		let verifyRequestCredentials = this.verifyRequestCredentials;
		
		this.generatePOSRequestSignature = async (request) => {
			try{
				let amt_for_signature = parseFloat(request.order_amount || 0).toFixed(8);
				let cstr = String(request.transaction_uid || "").trim() + "|";
				cstr += String(request.status || "").trim() + "|";
				cstr += String(request.order_uid || "").trim()    + "|";
				cstr += String(amt_for_signature || "").trim()   + "|";
				cstr += String(request.order_currency || "").trim()     + "|";
				cstr += String(request.vault_token_uid  || "").trim() + "|";
				cstr += String(request.subscription_uid || "").trim();
				cstr += String(request.rand || "").trim();
				let cstrmd5 = md5(cstr + merchantUid);
				return await sha512Async(cstrmd5 + secretkey);
			}catch(ex){
				return null;
			}
		};
		window.HPayGeneratePOSRequestSignature = this.generatePOSRequestSignature;
		
		this.verifyPOSResultSignature = async (result) => {
			try{
				let amt_for_signature = parseFloat(result.order_amount || 0).toFixed(8);
				
				let cstr = String(result.transaction_uid || "").trim() + "|";
				cstr += String(result.status || "").trim() + "|";
				cstr += String(result.order_uid || "").trim()    + "|";
				cstr += String(amt_for_signature || "").trim()   + "|";
				cstr += String(result.order_currency || "").trim()     + "|";
				cstr += String(result.vault_token_uid  || "").trim() + "|";
				cstr += String(result.subscription_uid || "").trim();
				cstr += String(result.rand || "").trim();
				
				let cstrmd5 = md5(cstr + merchantUid);
				let expected_hash = await sha512Async(cstrmd5 + secretkey);
				
				let res = {};
				
				if(!result.verificationhash){
					res.result = "failed";
					return res;
				}
				
				if(expected_hash.toLowerCase() != result.verificationhash.toLowerCase()){
					let err = {
						expected_signature: expected_hash,
						fount_signature: result.verificationhash || "",
						cstr: cstr,
						cstrmd5: cstrmd5
					};
					
					if(/^\|\|/.test(cstr)){
						//COMAPATIBILITY VERIFICATION
						cstr = cstr.substring(2);
						cstrmd5 = md5(cstr + merchantUid);
						expected_hash = await sha512Async(cstrmd5 + secretkey);
						if(expected_hash.toLowerCase() == result.verificationhash.toLowerCase()){
							res.result = "ok";
						}
					}
					
					if(res.result != "ok"){
						res.result = "failed";
						console.error(err);
					}
				}else{
					res.result = "ok";
				}
				
				return res;
			}catch(ex){
				return null;
			}
		};
		window.HPayVerifyPOSResultSignature = this.verifyPOSResultSignature;
		
		let getItem = function(entity, item_uid_or_find_str){
			if(!entity){
				return new Promise(function(resolve,reject){
					reject({error: "entity not provided"});
				});
			}
			
			if(!item_uid_or_find_str){
				return new Promise(function(resolve,reject){
					reject({error: "item identification/find not provided"});
				});
			}
			
			entity = entity.toLowerCase().trim();
			if(entity.substr(-1) == "s"){
				entity = entity.substr(0, entity.length - 1);
			}
			
			let get_url = hpay_base_url + "/clientpay/" + entity + "s/" + merchantUid + "/" + encodeURIComponent(item_uid_or_find_str);
			let rand = String(parseInt(Math.random() * 999999)) + ((new Date()).toISOString())  + (parseInt(Math.random() * 999999));
			
			let subscription_uid = "";
			let order_uid        = "";
			let transaction_uid  = "";
			
			if(entity.toLowerCase().trim() == "order"){
				order_uid = item_uid_or_find_str;
			}else if(entity.toLowerCase().trim() == "transaction"){
				transaction_uid = item_uid_or_find_str;
			}else if(entity.toLowerCase().trim() == "subscription"){
				subscription_uid = item_uid_or_find_str;
			}else{
				return new Promise(function(resolve,reject){
					reject({error: "unknown entity " + entity});
				});
			}
			
			return HPayGeneratePOSRequestSignature({
				rand: rand,
				transaction_uid: transaction_uid,
				order_uid: order_uid,
				subscription_uid: subscription_uid
			}).then(sig => {
				return ___hfetch(get_url,{
					method:"GET",
					headers:{
						rand: rand,
						verificationhash: sig
					}
				}).then(r => r.json()).catch(err => err);
			});
		};
		
		let getItems = function(entity, offset, limit, filter, sort_order){
			if(!entity){
				return new Promise(function(resolve,reject){
					reject({error: "entity not provided"});
				});
			}
			
			entity = entity.toLowerCase().trim();
			if(entity.substr(-1) == "s"){
				entity = entity.substr(0, entity.length - 1);
			}
			
			let get_url = hpay_base_url + "/clientpay/" + entity + "s/" + merchantUid;
			let rand = String(parseInt(Math.random() * 999999)) + ((new Date()).toISOString())  + (parseInt(Math.random() * 999999));
			
			let subscription_uid = "";
			let order_uid        = "";
			let transaction_uid  = "";
			
			if(entity.toLowerCase().trim() == "order"){
				//
			}else if(entity.toLowerCase().trim() == "transaction"){
				//
			}else if(entity.toLowerCase().trim() == "subscription"){
				//
			}else{
				return new Promise(function(resolve,reject){
					reject({error: "unknown entity " + entity});
				});
			}
			
			let query = {};
			
			if(offset !== undefined && offset !== null){
				query["offset"] = offset;
			}
			
			if(limit !== undefined && limit !== null){
				query["limit"] = limit;
			}
			
			if(filter !== undefined && filter !== null){
				query["filter"] = JSON.stringify(filter);
			}
			
			if(sort_order !== undefined && sort_order !== null){
				query["sort_order"] = JSON.stringify(sort_order);
			}
			
			if(Object.keys(query).length){
				if(typeof URLSearchParams !== 'undefined')
					get_url += ("?" + (new URLSearchParams(query)).toString()); 
				else
					get_url += ("?" + objToQs(query));
			}
			
			return HPayGeneratePOSRequestSignature({
				rand: rand
			}).then(sig => {
				return ___hfetch(get_url,{
					method:"GET",
					headers:{
						rand: rand,
						verificationhash: sig
					}
				}).then(r => r.json()).catch(err => err);
			});
		};
		
		
		let updateItem = function(entity, item_uid, data, create, create_or_update){
			if(!entity){
				return new Promise(function(resolve,reject){
					reject({error: "entity not provided"});
				});
			}
			
			if(!item_uid){
				return new Promise(function(resolve,reject){
					reject({error: "item identification not provided"});
				});
			}
			
			entity = entity.toLowerCase().trim();
			if(entity.substr(-1) == "s"){
				entity = entity.substr(0, entity.length - 1);
			}
			
			let op = "update";
			if(create){
				op = "create";
			}
			
			if(create_or_update){
				op = "updateorcreate";
			}
			
			let rand = String(parseInt(Math.random() * 999999)) + ((new Date()).toISOString())  + (parseInt(Math.random() * 999999));
			let post_url = hpay_base_url + "/clientpay/" + entity + "s/" + merchantUid + "/" + encodeURIComponent(item_uid) + "/" + op;
			
			let subscription_uid = "";
			let order_uid        = "";
			let transaction_uid  = "";
			
			if(entity.toLowerCase().trim() == "order"){
				order_uid = item_uid;
			}else if(entity.toLowerCase().trim() == "transaction"){
				transaction_uid = item_uid;
			}else if(entity.toLowerCase().trim() == "subscription"){
				subscription_uid = item_uid;
			}else{
				return new Promise(function(resolve,reject){
					reject({error: "unknown entity " + entity});
				});
			}
			
			return HPayGeneratePOSRequestSignature({
				rand: rand,
				transaction_uid: transaction_uid,
				order_uid: order_uid,
				subscription_uid: subscription_uid
			}).then(sig => {
				let body = {};
				
				body[ entity.substr(0,1).toUpperCase() + entity.substr(1)] = data; 
				
				return ___hfetch(post_url,{
					method:"POST",
					headers:{
						rand: rand,
						verificationhash: sig,
						"Content-type": "application/json; charset=utf-8"
					},
					body:JSON.stringify(body)
				}).then(r => r.json()).catch(err => err);
			});
		};
		
		let createItem = function(entity, item_uid, data){
			return updateItem(entity, item_uid, data, true);
		};
		
		let upsertItem = function(entity, item_uid, data){
			return updateItem(entity, item_uid, data, undefined, true);
		};
		
		this.getOrder = function(item_uid_or_find_str){
			return getItem("order", item_uid_or_find_str);
		};
		
		this.getTransaction = function(item_uid_or_find_str){
			return getItem("transaction", item_uid_or_find_str);
		};
		
		this.getSubscription = function(item_uid_or_find_str){
			return getItem("subscription", item_uid_or_find_str);
		};
		
		this.getOrders = function(offset, limit, filter, sort_order){
			return getItems("order", offset, limit, filter, sort_order);
		};
		
		this.getTransactions = function(offset, limit, filter, sort_order){
			return getItems("transaction", offset, limit, filter, sort_order);
		};
		
		this.getSubscriptions = function(offset, limit, filter, sort_order){
			return getItems("subscription", offset, limit, filter, sort_order);
		};
		
		this.updateOrder = function(item_uid, data){
			return updateItem("order",item_uid, data)
		};
		
		this.createOrder = function(item_uid, data){
			return createItem("order",item_uid, data)
		};
		
		this.upsertOrder = function(item_uid, data){
			return upsertItem("order",item_uid, data)
		};
		
		this.updateTransaction = function(item_uid, data){
			return updateItem("transaction",item_uid, data)
		};
		
		this.createTransaction = function(item_uid, data){
			return createItem("transaction",item_uid, data)
		};
		
		this.upsertTransaction = function(item_uid, data){
			return upsertItem("transaction",item_uid, data)
		};
		
		this.updateSubscription = function(item_uid, data){
			return updateItem("subscription",item_uid, data)
		};
		
		this.createSubscription = function(item_uid, data){
			return createItem("subscription",item_uid, data)
		};
		
		this.upsertSubscription = function(item_uid, data){
			return upsertItem("subscription",item_uid, data)
		};
		
		this.__client_init = this.init;
		this.init = async function(){
			this.view = 'configuration';
			
			let valid_resp = await verifyRequestCredentials();
			
			if(valid_resp.valid){
				return await this.__client_init();
			}else{
				throw {error: "bad merchant site uid or secret key", error_code:401};
			}
		};
	};
	
	window.HPayDestroy = function(){
		merchant_site_uid = null;
		merchant_language = null;	
		fixed_language    = null;
		__HPAY_CLIENT     = null;
		__FIRST_INIT      = false;
		hpay_base_url     = null;
	}; 
	
	let HPayInitLock = null;
	
	window.HPayInit = async function(_merchantUid, _callback, _language,_a1,_a2,_a3){
		let hload_hash = "";
		
		let merchantUid, callback, language;
		let hform       = null;
		let secretkey   = null;
		let environment = null;
		
		let args_set_count = 0;
		[_merchantUid, _callback, _language,_a1,_a2,_a3].forEach(v => {
			if(v){
				if(typeof v === 'function'){
					callback = v;
					
				}else if(/^[a-zA-Z]{2}(\-cyr)?$/i.test(String(v))){
					language = v.toLowerCase();
					args_set_count++;
				}else if(/^[a-zA-Z]{2}[\-|\_][a-zA-Z]{2}$/.test(String(v))){
					language = v.substring(0,2).toLowerCase();
					args_set_count++;
				}else if(String(v).trim().length == 36 && /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/.test(String(v).trim())){
					merchantUid = v.trim();
					args_set_count++;
				}else if(/sandbox|production/i.test(String(v).trim())){
					environment = String(v).trim();
				}else if(typeof v === 'string' && v.length > 22){
					secretkey = v;
				}else if(typeof v === 'object'){
					args_set_count++;
					if(v.tagName === "FROM"){
						hform = v;
					}else if(v.secretkeyinit){
						secretkey   = v.secretkeyinit;
						environment = v.environment || "sandbox";
					}
				}
			}
		});
		
		let loaded = false;
		if(__HPAY_CLIENT && !args_set_count)
			loaded = true;
		
		if(__HPAY_CLIENT && args_set_count == 1 && callback)
			loaded = true;
		
		if(loaded){
			if(callback){
				try{
					callback(__HPAY_CLIENT);	
				}catch(ex){
					console.error(ex);
				}
			}
			return __HPAY_CLIENT;
		}
		
		if(!merchantUid && merchant_site_uid){
			merchantUid = merchant_site_uid;
		}
		
		if(!language && merchant_language){
			language = merchant_language;
		}
		
		if(typeof HolestPayAdmin !== 'undefined'){
			if(HolestPayAdmin && HolestPayAdmin.settings && HolestPayAdmin.settings.environment && HolestPayAdmin.settings[HolestPayAdmin.settings.environment]){
				environment  = HolestPayAdmin.settings.environment;
				merchantUid = HolestPayAdmin.settings[environment].merchant_site_uid;
				secretkey    = HolestPayAdmin.settings[environment].secret_token;
				language    = normalizeLng(HolestPayAdmin.hpaylang || "en");
			}
		}
			
		if(!merchantUid){
			if(!merchantUid){
				if(typeof HolestPayCheckout !== 'undefined'){
					if(HolestPayCheckout && HolestPayCheckout.merchant_site_uid){
						environment  = HolestPayCheckout.environment;
						language    = normalizeLng(HolestPayCheckout.hpaylang || "en");
						merchantUid = HolestPayCheckout.merchant_site_uid;
					}
				}
			}
		}
		
		if(!hform){
			let hpayforms = document.querySelectorAll('form[action*="pay.holest.com/clientpay/pay"]');
			if(hpayforms && hpayforms.length){
				hform = hpayforms[hpayforms.length - 1];
			}
		}
		
		if(!merchantUid){
			if(hform){
				let input_muid = hform.querySelector('*[name="merchant_site_uid"]');
				if(input_muid){
					merchantUid = input_muid.value;
				}
			}
			
			if(!merchantUid && merchant_site_uid){
				merchantUid = merchant_site_uid;
			}
		}
		
		if(!language){
			if(hform){
				let input_langauge = hform.querySelector('*[name="hpaylang"]');
				if(!input_langauge){
					input_langauge = hform.querySelector('*[name="lang"]');
				}
				if(input_langauge){
					language = normalizeLng(input_langauge.value.trim());
				}
			}
				
			if(!language && merchant_language){
				language = merchant_language;
			}
		}
		
		if(!merchantUid){
			throw {
				error: "HolestPay: merchant_site_uid not set/available!",
				error_code:-1
			};
		}
		
		if(!HPayInitLock){
			HPayInitLock = {};
		}
		
		hload_hash = [environment || "", merchantUid, language];
		let init_resolve = null; 
		let init_promise = new Promise(resolve => {
			init_resolve = resolve;
		});
		
		if(HPayInitLock[hload_hash]){
			if(HPayInitLock[hload_hash].secretkey && (!secretkey || (HPayInitLock[hload_hash].secretkey == secretkey))){
				if(HPayInitLock[hload_hash].result){
				 	return HPayInitLock[hload_hash].result;
				} 
				if(!HPayInitLock[hload_hash].parallel_inits){
					HPayInitLock[hload_hash].parallel_inits = [];
				} 
				HPayInitLock[hload_hash].parallel_inits.push(init_resolve);
				return await init_promise;
			}
		}else{
			HPayInitLock[hload_hash] = {
				secretkey: secretkey || "",
				parallel_inits:[init_resolve]				
			};
		}
		
		let environ_swap = environment ? ( (is_sandbox && environment == "production") || (!is_sandbox && environment == "sandbox") ) : false;
		let fa_swap = false;
		if(__HPAY_CLIENT){
			if(!__HPAY_CLIENT.verifyPOSResultSignature && secretkey){
				fa_swap = true;
			}
		}
		
		if(!(!environ_swap && !fa_swap && __HPAY_CLIENT && __HPAY_CLIENT.merchant_site_uid && __HPAY_CLIENT.merchant_site_uid === merchantUid)){
			__FIRST_INIT = true;
			if(secretkey){
				let client = new HolestPayAdminClient(merchantUid, language, environment, secretkey);
				await client.init();
				__HPAY_CLIENT = client;
			}else{
				let client = new HolestPayClient(merchantUid, language);
				await client.init();
				__HPAY_CLIENT = client;
			}
		}else{
			if(fixed_language) language = fixed_language;
			if(language && __HPAY_CLIENT.getLanguage() != language){
				await __HPAY_CLIENT.setLanguage(language);
			}
		}
		
		if(merchantUid){
			merchant_site_uid = merchantUid;
		}
		
		if(language){
			merchant_language = language;
		}
		
		if(callback){
			try{
				callback(__HPAY_CLIENT);	
			}catch(ex){
				console.error(ex);
			}
		}
		
		delete window.__hpay_initalising;
		
		try{
			let event = new Event("onHPayClientInit");
			event.client = __HPAY_CLIENT;
			document.dispatchEvent(event);
			
			if(!document.__hpay_first_init){
				event = new Event("onHPayClientFirstInit");
				event.client = __HPAY_CLIENT;
				document.dispatchEvent(event);
				document.__hpay_first_init = true;
			}
			
			event = new Event("onHpayClientInit");
			event.client = __HPAY_CLIENT;
			document.dispatchEvent(event);
		}catch(ex){
			console.error(ex);
		}
		
		if(HPayInitLock && HPayInitLock[hload_hash]){
			HPayInitLock[hload_hash].result = __HPAY_CLIENT;
			if(HPayInitLock[hload_hash].parallel_inits.length > 1){
				setTimeout(() => {
					if(HPayInitLock && HPayInitLock[hload_hash]){
						try{
							const parallel_inits = HPayInitLock[hload_hash].parallel_inits;
							parallel_inits.forEach(resolve => {
								try{
									resolve(__HPAY_CLIENT);
								}catch(pex){}
							});
						}catch(pex2){}
						delete HPayInitLock[hload_hash];
					}
				},1);
				return await init_promise;
			}else{
				delete HPayInitLock[hload_hash];
			}
		}
		return __HPAY_CLIENT;
	};
	
	if(!window.hasOwnProperty("HPay")){
		Object.defineProperty(window, 'HPay', {
		  get() {
			  return __HPAY_CLIENT;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	}
	
	if(!window.hasOwnProperty("HPayIsSandbox")){	
		Object.defineProperty(window, 'HPayIsSandbox', {
		  get() {
			  return is_sandbox;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	}
	
	if(!window.hasOwnProperty("hpay_md5")){	
		Object.defineProperty(window, 'hpay_md5', {
		  get() {
			  return md5;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	}
	
	if(!window.hasOwnProperty("LoadHPayDDOM")){	
		Object.defineProperty(window, 'LoadHPayDDOM', {
		  get() {
			  return true;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	}
	
	attachHandler(window,"contextmenu", function(evt){
		if(holestpay_panel){
			evt.preventDefault();
			if(evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
		}
	});
	
	attachHandler(window,"keyup", function(evt){
		if(holestpay_panel){
			evt.preventDefault();
			if(evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
		}
	});
	
	attachHandler(window,"keydown", function(evt){
		if(holestpay_panel){
			evt.preventDefault();
			if(evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
		}
	});
	
	attachHandler(window,"keypress", function(evt){
		if(holestpay_panel){
			evt.preventDefault();
			if(evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
		}
	});
	
	attachHandler(window,"input", function(evt){
		if(holestpay_panel){
			evt.preventDefault();
			if(evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
		}
	});
	
	attachHandler(window,"click", function(evt){
		
		if(holestpay_panel && holestpay_panel.hpblocked){
			document.body.className = (document.body.className || "").replace(/ hpay\-backdrop/g,'');
			holestpay_panel.parentNode.removeChild(holestpay_panel);
			holestpay_panel = null;
		}
		
		if(evt && evt.target && evt.target.form){
			let form_action = evt.target.form.getAttribute("action");
			let is_button = /^BUTTON$/i.test(evt.target.nodeName);
			let is_submit = /^INPUT$/i.test(evt.target.nodeName) && /^submit$/i.test(evt.target.getAttribute("type") || "");
			if((is_button || is_submit) && /pay\.holest\.com\/clientpay\/pay/i.test(form_action)){
				
				evt.preventDefault();
				if(evt.stopImmediatePropagation)
					evt.stopImmediatePropagation();
				
				closeHP();
				
				let request_data = {};
				let formData = new FormData(evt.target.form);
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
				
				_presentHPayPayForm(request_data);
				return;
			}
		}
	});
	
	const addHPayStyles = function(){
		if(!document.getElementById("hpay_form_style")){
			try{
				let styleSheet = document.createElement("style")
				let css = "body.hpay-backdrop, html:has(body.hpay-backdrop){ overflow:hidden!important } #hpay_payment_panel_wrapper > .hpay-spinner{position: fixed;top: calc(50vh - 60px)} .hpay-spinner{width:120px;height:120px;padding:15px;background:var(--hpay-primary-color,#052864);aspect-ratio:1;border-radius:50%;--_m:conic-gradient(#0000,#000),linear-gradient(#000 0 0) content-box;-webkit-mask:var(--_m);mask:var(--_m);-webkit-mask-composite:source-out;mask-composite:subtract;box-sizing:border-box;animation:1s linear infinite load;display:inline-block}@keyframes load{to{transform:rotate(1turn)}}";
				//user-challenge 
				css += '@keyframes growAndCenterFrame{0%{position:fixed;top:50vh;left:50vw;margin-left:0;margin-top:0;opacity:0;transform:translate(-50%,-50%);background:#fff;border-radius:20px;box-shadow:0 0 20px #0a0606;z-index:2147483647;display:flex;justify-content:center;align-items:center;overflow:hidden}100%{top:50vh;left:50vw;min-width:98%;max-width:98%;height:96vh;margin-left:-49vw;margin-top:-48vh;opacity:1;transform:translate(0,0);background:#fff;border-radius:20px;box-shadow:0 0 20px #0a0606;z-index:2147483647}}@keyframes undoGrowAndCenterFrame{0%{position:fixed;top:50vh;left:50vw;min-width:98vw;height:96vh;margin-left:-49vw;margin-top:-48vh;opacity:1;transform:translate(0,0);background:#fff;border-radius:20px;box-shadow:0 0 20px #0a0606;z-index:2147483647}99%{position:fixed;top:50vh;left:50vw;margin-left:0;margin-top:0;opacity:0;transform:translate(-50%,-50%);background:#fff;border-radius:20px;box-shadow:0 0 20px #0a0606;z-index:2147483647;display:flex;justify-content:center;align-items:center;overflow:hidden}}.user-challenge-frame-on{animation:.7s ease-in-out forwards growAndCenterFrame;position:fixed}.user-challenge-frame-off{animation:.7s ease-in-out forwards undoGrowAndCenterFrame}#hpay_payment_panel_wrapper{z-index:99999999999999!important;} body *:has(.user-challenge-frame-on),.user-challenge-frame-on,.user-challenge-frame-on *{z-index:999999999999!important;} body:has(.user-challenge-frame-on) *:not(:has(.user-challenge-frame-on), .user-challenge-frame-on, .user-challenge-frame-on *){z-index:1!important}body:has(.user-challenge-frame-on) #hpay_payment_panel_wrapper{z-index: -1!important}@media(max-width: 1024px){#hpay_payment_panel_wrapper iframe{min-height:80vh!important} .user-challenge-frame-on{ max-height: 84vh!important }} .hpay-cancel-user-challenge{position:fixed;z-index:2147483647;right:1vw;top:2vh}.hpay-cancel-user-challenge:after{content:"\\00D7";font-size:1.5em;display:inline-block;width:40px;height:40px;border-radius:0 20px;text-align:center;line-height:38px;background:#ffffff8a;box-shadow:3px 0 15px #232323;cursor:pointer}.hpay-cancel-user-challenge:hover:after{background:#fbfbfb;color:#7c0101}';
				css += '@keyframes dock-spin{to{transform:translateY(-50%) rotate(360deg)}}:has(>.hpay-dock-frame-loading){display:grid;grid-template-columns:1fr;justify-content:center;align-items:center;justify-items:center}:has(>.hpay-dock-frame-loading):before{content:"";display:inline-block;width:32px;height:32px;border-radius:50%;border:2px solid #ccc;border-top-color:var(--hpay-primary-color,#1b414b);position:absolute;transform:translateY(-50%);animation:.75s linear infinite dock-spin}';
				css += '.hpay-backdrop .hpay-dock-frame{opacity:0.1}';
				css += 'iframe[layout_type_size="full"]{height:100vh;width:100vw;}';
				styleSheet.innerText = css;
				styleSheet.setAttribute("id","hpay_form_style");
				document.head.appendChild(styleSheet);
			}catch(ex){
				console.error(ex);
			}
		}
	}; 
	
	const hpayWrapperStyle = function(){
		return {
			"position": "fixed",
			"top": "0",
			"left": "0",
			"bottom": "0",
			"right": "0",
			"background-color": "rgba(0,0,0,0.35)",
			"zIndex":'2147483646',
			"display": "flex",
			"justify-content": "center",
			"align-items": "center"
		};
	};
	
	
	const _presentHPayPayForm = async function(request_data){
		
		_in_pay_session = true;
		
		if(!__HPAY_CLIENT){
			if(typeof HolestPayCheckout !== 'undefined'){
				request_data.merchant_site_uid = HolestPayCheckout.merchant_site_uid;
				request_data.hpaylang = normalizeLng(HolestPayCheckout.hpaylang);
				await HPayInit(HolestPayCheckout.merchant_site_uid, HolestPayCheckout.hpaylang);
			}else{
				await HPayInit(request_data.merchant_site_uid, normalizeLng(request_data.hpaylang || "en"));
			}
		}
		
		if(!request_data.merchant_site_uid && __HPAY_CLIENT && __HPAY_CLIENT.POS){
			request_data.merchant_site_uid = __HPAY_CLIENT.POS.MerchantsiteUid;
		}
		
		try{
			let cdata = null;
			try{
				if(sessionStorage.hpay_checkout_data){
					cdata = JSON.parse(sessionStorage.hpay_checkout_data);
				}	
			}catch(dtmp){}
			if(!cdata && typeof HADDRESS_HANDLER_ADP !== 'undefined' && HADDRESS_HANDLER_ADP && HADDRESS_HANDLER_ADP.shipping_method){
				cdata = {
					billing:  HADDRESS_HANDLER_ADP.billing,
					shipping:  HADDRESS_HANDLER_ADP.shipping,
					shipping_method: HADDRESS_HANDLER_ADP.shipping_method.HPaySiteMethodId,
					shipping_method_uid: HADDRESS_HANDLER_ADP.shipping_method.Uid
				};
			}
			
			if(cdata && cdata.shipping_method && (cdata.shipping_method == request_data.shipping_method || cdata.shipping_method == "select")){
				if(cdata.billing && Object.values(cdata.billing).filter(v=>!!v).length){
					if(!request_data.order_billing) request_data.order_billing = {};
					for(var aprop in cdata.billing){
						if(cdata.billing.hasOwnProperty(aprop) && !request_data.order_billing[aprop]){
							request_data.order_billing[aprop] = cdata.billing[aprop];
						}
					}
				}
				
				if(cdata.shipping){
					if(!request_data.order_shipping) request_data.order_shipping = {};
					for(var aprop in cdata.shipping){
						if(cdata.shipping.hasOwnProperty(aprop) && !request_data.order_shipping[aprop]){
							request_data.order_shipping[aprop] = cdata.shipping[aprop];
						}
					}
				}
			}
		}catch(chk_data_ex){
			console.error(chk_data_ex);
		}
		
		request_data.checkout_session_uid = checkout_session_uid;
		if(typeof HolestPayCheckout !== 'undefined'){
			if(!request_data.hpaylang)
				request_data.hpaylang = normalizeLng(HolestPayCheckout.hpaylang);
		}
		request_data.docked = 0;
		try{
			if(__current_docked && __current_docked.ifr && __current_docked.ifr.parentNode && __current_docked.ifr.msource && __current_docked.payment_method_id == request_data.payment_method){
				let valid = null;
				let _valid_to = null;
				let _resolve = null;
				
				let pendValidate = function(e){
					if(e.data && e.data.command == "dock_ValidateResult" && e.data.checkout_session_uid == checkout_session_uid && e.data.payment_method_id == __current_docked.payment_method_id){
						if(debugMessages()){
							console.log("hpay pend validate message", e.data);
						}
						if(_valid_to){
							clearTimeout(_valid_to);
						}
						if(e.data.result){
							valid = true;
							if(_resolve) _resolve(true);
						}else{
							valid = false;
							if(_resolve) _resolve(false);
						}
					} 	 
				};
				
				__current_docked.ifr.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
				
				addEventListener("message", pendValidate, false);
				__current_docked.ifr.msource.postMessage({
					command: "validateDock",
					checkout_session_uid: checkout_session_uid,
					payment_method_id: __current_docked.payment_method_id
				},__current_docked.ifr.getAttribute("src").split("?")[0]);
				
				await (new Promise(resolve => {
					_resolve = resolve;
					_valid_to = setTimeout(() => {
						if(valid === null){
							valid = false;
							resolve(false);
						}
					},2500);
				}));
				
				if(!valid){
					closeHP();
					return;
				}else{
					request_data.docked = 1;
				}
			}
		}catch(ex){
			reportFrontError({error: "docked pay init failed", error_data: ex.message});
			console.error("docked pay init failed", ex);
		}
		
		if(!request_data.docked)
			__current_docked = null;
		
		addHPayStyles();
		
		if(holestpay_panel){
			if(holestpay_panel.parentNode){
				holestpay_panel.parentNode.removeChild(holestpay_panel);
			}
			holestpay_panel = null;
		}
		
		try{
			let scopes = ["payment","shipping","fiscal"];
			for(var j = 0; j < scopes.length; j++){
				let scope = scopes[j];
				if(__HPAY_CLIENT.POS && __HPAY_CLIENT.POS[scope] && __HPAY_CLIENT.POS[scope].length){
					for(var i = 0; i < __HPAY_CLIENT.POS[scope].length;i++){
						if(__HPAY_CLIENT.POS[scope][i].BeforeCheckoutCommit && typeof __HPAY_CLIENT.POS[scope][i].BeforeCheckoutCommit === 'function'){
							try{
								let res = __HPAY_CLIENT.POS[scope][i].BeforeCheckoutCommit(request_data);
								if(res === false){
									return;
								}else if(res && res.then){
									await res;
								}
							}catch(eex){
								
							}
						}
					}
				}
			}
		}catch(ex){
			
		}
		
		if(client_wait_screen){
			if(client_wait_screen.parentNode){
				client_wait_screen.parentNode.removeChild(client_wait_screen);
			}
			client_wait_screen = null;
		}
		
		holestpay_panel = document.createElement("div");
		holestpay_panel.setAttribute("id","hpay_payment_panel_wrapper");
		
		let wrapp_style = hpayWrapperStyle();
		for(let prop in wrapp_style){
			if(wrapp_style.hasOwnProperty(prop)){
				holestpay_panel.style[prop] = String(wrapp_style[prop]);
			}
		}
		
		let dhclent = String(parseInt(Math.random() * 9999999));
		public_hp_frame = document.createElement("iframe");
		public_hp_frame.style["min-height"] = "320px";
		public_hp_frame.style["max-height"] = '100vh';
		
		public_hp_frame.style["border"]     = 'none';
		public_hp_frame.style["display"]    = 'none';
		public_hp_frame.style["width"]      = '100vw';
		public_hp_frame.style["max-width"]  = '100vw';
		public_hp_frame.style["transition"] = 'width 0.5s, height 0.5s';
		
		let corigin = window.origin;
		if(!window.origin || window.origin == 'null'){
			corigin = window.location.href.split("?")[0];
		}
		
		let init_url = hpay_base_url + "/clientpay/initclient/" + request_data.merchant_site_uid + "/" + (request_data.payment_method || "none") + "/" + (request_data.shipping_method || "none")+ "/" + (request_data.fiscal_method || "none") + "?dhhssource=" + encodeURIComponent(btoa(corigin));
		if(request_data.directpaylayout){
			delete request_data.directpaylayout;
			init_url += "&directpaylayout=1";
		}
		
		if(request_data.billing_and_shipping){
			if(/^(billing|shipping|billing_shipping_o|billing_o_shipping)$/i.test(String(request_data.billing_and_shipping).trim())){
				init_url += "&billing_and_shipping=" + request_data.billing_and_shipping.toLowerCase().trim();
			}else{
				delete request_data.billing_and_shipping;
			}
		}
		
		if(__HPAY_CLIENT && __HPAY_CLIENT.POS && __HPAY_CLIENT.POS.pos_parameters && __HPAY_CLIENT.POS.pos_parameters["Docked Input"]){
			init_url += "&docked=1";
		}
		
		init_url += ("&hpaylang=" + normalizeLng(request_data.hpaylang || "en") + "&rdiff=" + parseInt(Math.random() * 99999));
	
		public_hp_frame.setAttribute("src", init_url);
		
		holestpay_panel.appendChild(public_hp_frame);
		
		holestpay_panel.__spinner = document.createElement("div");
		holestpay_panel.__spinner.className = 'hpay-spinner';
		holestpay_panel.appendChild(holestpay_panel.__spinner);
		document.body.appendChild(holestpay_panel); 
		
		if(!/hpay-backdrop/.test(document.body.className || ""))
			document.body.className = (document.body.className || "") + ' hpay-backdrop';
		
		_currentRequestData = request_data;
		
		if(request_data.verificationhash){
			const checkouthash = md5(request_data.verificationhash);
			checkouts_to_check[checkouthash] = {
				merchant_site_uid: request_data.merchant_site_uid,
				order_uid: request_data.order_uid,
				order_name: request_data.order_name,
				order_amount: request_data.order_amount,
				order_currency: request_data.order_currency,
				checkouthash: checkouthash,
				checkout_session_uid: checkout_session_uid
			};
			// try{
				// if(typeof sessionStorage !== 'undefined')
					// sessionStorage.__hpay_checkouts_to_check = JSON.stringify(checkouts_to_check);
			// }catch(ex){}
		}
		
		let hfrm = public_hp_frame;
		let iframeErrorCheck = function(){
			if(public_hp_frame && hfrm === public_hp_frame){
				if(!public_hp_frame.clientinit_started && !public_hp_frame.is_error){
					holestpay_panel.innerHTML = '<p style="color:red">ERROR: Service temporarily unavailable</p>';
					setTimeout(function(){
						closeHP();
					},10000);
					
					reportFrontError({
						error: "ERROR: Service temporarily unavailable",
						error_ref:"stu2",
						request_data: request_data
					});
				}
			}	
		};
		
		let to_handle = setTimeout(iframeErrorCheck,30000);
		attachHandler(public_hp_frame,"load", function(e){
			clearInterval(to_handle);
			to_handle = setTimeout(iframeErrorCheck,9500);
		});
	};
	
	if(!window.hasOwnProperty("presentHPayPayForm")){
		Object.defineProperty(window, 'presentHPayPayForm', {
		  get() {
			  return _presentHPayPayForm;
		  },
		  set(value){
			  throw {error: "object access violation", error_code:-1};
		  },
		  enumerable: false,
		  configurable: false
		});
	}
	
	const HPCipher = function(salt){
		salt = String(salt);
		const textToChars = function(text){return text.split('').map(function(c) { return c.charCodeAt(0)})};
		const byteHex = function(n) { 
			let h = ("0" + Number(n).toString(16));
			return h.substring(h.length - 2);
		};
		const applySaltToChar = function (code) { return textToChars(salt).reduce(function(a,b){ return a ^ b }, code)};

		return function(text){  
			let ptext = String(text).split('').map(chr => String(chr.charCodeAt(0))).join('-');
			
			return String(ptext).split('')
					   .map(textToChars)
					   .map(applySaltToChar)
					   .map(byteHex)
					   .join('');
		};
	};
		
	const HPDecipher = function(salt) {
		salt = String(salt);
		const textToChars = function(text){return text.split('').map(function(c) { return c.charCodeAt(0)})};
		const applySaltToChar = function(code){ return textToChars(salt).reduce(function(a,b){ return a ^ b }, code)};
		const hexfn = function(hex){ return parseInt(hex, 16); };
		const charCodefn = function(charCode){ return  String.fromCharCode(charCode); };
		
		return function(encoded) {
			let ptext = String(encoded).match(/.{1,2}/g)
			  .map(hexfn)
			  .map(applySaltToChar)
			  .map(charCodefn)
			  .join('');
			  
			 return ptext.split('-').map(chint => String.fromCharCode(Number(chint))).join(""); 
		};  
	};
	
	const packDataForTransfer = function(data){
		let str_data = JSON.stringify(data);
		let rnd = String(parseInt(Math.random() * 9999999999)).replace(/0/g,'A');
		for(let i = 0; i < 12; i++){
			if(rnd.length < 12)
				rnd += "C";
			else
				break;
		}
		rnd = rnd.substr(0,12);
		let crypt = new HPCipher(rnd);
		let transfer_data = crypt(str_data);
		let splitN = parseInt(rnd.substr(0,1));
		return rnd.substr(0,splitN) + transfer_data + rnd.substr(splitN);
	}; 
	
	const unpackTransferData = function(data){
		try{
			if(/^\[.*\]$|^\{.*\}$/.test(data)){
				return JSON.parse(data);
			}
			let splitN = parseInt(data.substr(0,1));
			let rnd = String(data.substr(0,splitN)) + String(data.substr(-(12 - splitN)));
			let decrypt = new HPDecipher(rnd);
			let dat = data.substr(splitN);
			dat = dat.substr(0,dat.length - (12 - splitN));
			return JSON.parse(decrypt(dat));
		}catch(ex){
			return null;	
		}
	};
	
	let public_df_common   = null; 
	let public_df_site_sec = null; 
	let public_df_secret   = null; 
	let middleware_source      = null;   
	let public_hp_frame    = null;  
	let public_hp_encrypt  = null;
	let public_hp_decrypt  = null;
	let _in_pay_session    = null;
	
	const exitHpayWait = function(no_frame_display){
		if(holestpay_panel && holestpay_panel.__spinner){
			holestpay_panel.__spinner.style["display"] = 'none';
		}
		if(!no_frame_display && public_hp_frame){
			public_hp_frame.style["display"] = '';
		}
	};
	
	const enterHpayWait = function(){
		if(public_hp_frame){
			public_hp_frame.style["display"] = 'none';
		}
		if(holestpay_panel && holestpay_panel.__spinner){
			holestpay_panel.__spinner.style["display"] = '';
		}
	};
	
	let closeHP = function(reason){
		if(holestpay_panel){
			
			document.body.className = (document.body.className || "").replace(/ hpay\-backdrop/g,'');
			holestpay_panel.parentNode.removeChild(holestpay_panel);
			
			holestpay_panel    = null;	
			public_df_common   = null; 
			public_df_site_sec = null; 
			public_df_secret   = null; 
			middleware_source      = null;   
			public_hp_frame    = null;  
			public_hp_encrypt  = null;
			public_hp_decrypt  = null;
			_in_pay_session    = false;
		}
		let user_reason = reason == "user" || reason == "timeout" || reason == "cancel";
		triggerEvent("onHPayPanelClose",{ reason: reason || "", user_reason: user_reason});
	};
	
	let triggerEvent = function(event_name, data){
		try{
			let event = new Event(event_name, {"bubbles":true, "cancelable":false});
			event.hpay_response = data;
			document.dispatchEvent(event);
		}catch(ex1){
			
		}
		
		try{
			if(window[event_name]){
				window[event_name]({hpay_response: data});
			}
		}catch(ex2){
			//	
		}
	};
	
	let closeDockChallenge = (reset) => {
		try{
			
			if(__current_docked && __current_docked.payment_method_id && __current_docked.ifr){
				
				if(__current_docked.ifr.className.indexOf("user-challenge-frame-on") > -1){
					let uclose = document.querySelector('.hpay-cancel-user-challenge');
					if(uclose && uclose.parentNode){
						uclose.parentNode.removeChild(uclose);
					}
					__current_docked.ifr.className = __current_docked.ifr.className.replace(/\s?user-challenge-frame-(on|off)/,'') + " user-challenge-frame-off";
				}	
				
				
				if(reset){
					setTimeout(function(){
						closeHP("cancel");
						HPay.setPaymentMethodDock(__current_docked.payment_method_id, __current_docked.data, __current_docked.ifr.parentNode, true);	
					},200);
				}
			}
		}catch(ex){
			console.error(ex);
		}
	};
	
	var __checkouts_check_to = null;
	const checkouts_check = async (order_uid) => {
		try{
			let checks = [];
			for(var chash in checkouts_to_check){
				if(checkouts_to_check.hasOwnProperty(chash)){
					if(order_uid){
						if(!(order_uid == checkouts_to_check[chash].order_uid && order_uid == checkouts_to_check[chash].order_name)){
							continue;
						}
					}
					checks.push(___hfetch(hpay_base_url + "/clientpay/checkout-status",{
						method:"POST",
						headers:{
							"Content-type" :"application/json"
						},
						body:JSON.stringify({
							request_data: packDataForTransfer(checkouts_to_check[chash])
						})
					}).then(r => r.json()).then(r => {
						if(r && r.order_uid){
							if(r.status && /PAID|PAYING|RESERVED|OBLIGATED/.test(r.status) && r.result && r.result.transaction_uid){
								checkouts_to_check = {};
								triggerEvent("onHPayResult",r.result);
							}
							return r;	
						}else{
							return {
								error: "error",
								error_code: 500,
								error_ref:"js255657"	
							};
						}	
					}).catch(err => {
						return {
							error: (err || {}).message || err || "error",
							error_code: 500,
							error_ref:"js255656"	
						}
					}))
				}
			}
			return Promise.all(checks);
		}catch(ex){
			console.error(ex);
		}
	};
	
	['visibilitychange','focus'].forEach(what_evt => {
		attachHandler(document,what_evt,(e) => {
			if(what_evt == 'focus' || document.visibilityState === 'visible'){
				if(Object.keys(checkouts_to_check).length){
					if(__checkouts_check_to){
						clearTimeout(__checkouts_check_to);
						__checkouts_check_to = null;					
					}
					__checkouts_check_to = setTimeout(checkouts_check, 150);
				}
			}
		});	
	});
	
	attachHandler(window, "message", function(e){
		if(debugMessages()){
			console.log("hpay message received", e.data);
		}
		
		if(e.origin.indexOf("https://" + (is_sandbox ? "sandbox." : "") + "pay.holest.com") === 0 && e.data && e.data.action){
			if(e.data.action == "hppsiteerror"){
				if(debugMessages()){
					console.log("hpay message handled", e.data);
				}
				if(public_hp_frame){
					public_hp_frame.is_error = true;
				}
				holestpay_panel.innerHTML = '<p style="color:red;background:rgba(255,255,255,0.65);padding:10px;">' + e.data.error + '</p>';
				
				if(__current_docked && __current_docked.ifr && __current_docked.ifr.parentNode){
					HPay.setPaymentMethodDock(__current_docked.payment_method_id, __current_docked.data, __current_docked.ifr.parentNode, true);
				}
				
				setTimeout(function(){
					closeHP("error");
					triggerEvent("onHPayResult",e.data);
				},2000);
			}else if(e.data.action == "setlocation"){
				if(debugMessages()){
					console.log("hpay message handled", e.data);
				}
				window.location.href = e.data.href;
			}else if(e.data.action == "initclient"){
				if(e.data.command == "initclient_loaded"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					if(public_hp_frame){
						public_hp_frame.clientinit_started = true;
					}
					if(!_currentRequestData.verificationhash && typeof hpay_frontend_script_core_sign !== 'undefined'){
						hpay_frontend_script_core_sign(_currentRequestData).then(verificationhash => {
							if(verificationhash){
								_currentRequestData.verificationhash = verificationhash;
							}
							e.source.postMessage({
								action: "do_init",
								POS: JSON.stringify(HPay.POS),
								request_data: packDataForTransfer(_currentRequestData)
							},hpay_base_url);
						});
					}else{
						e.source.postMessage({
							action: "do_init",
							POS: JSON.stringify(HPay.POS),
							request_data: packDataForTransfer(_currentRequestData)
						},hpay_base_url);
					}
				}else if (e.data.command == "initclientquit"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					closeHP();
				}else if (e.data.command == "initclientshow"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					exitHpayWait();
				}else if (e.data.command == "getexchnagerate"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					HPay.getMerchantExchnageRate(e.data.from,e.data.to).then(r => {
						e.source.postMessage({
							action: "exchangerate",
							from: e.data.from,
							to: e.data.to,
							rate: r.rate
						},hpay_base_url);
					});
				}else if(e.data.command == "initclientsize"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					if(e.data.height){
						if(public_hp_frame){
							if(e.data.height)
								public_hp_frame.style["height"] = /^\d*$/.test(e.data.height) ? (String(parseInt(e.data.height)) + "px") : e.data.height;
							if(e.data.width)
								public_hp_frame.style["width"] = /^\d*$/.test(e.data.width) ? (String(parseInt(e.data.width)) + "px") : e.data.width;
						}
					}
				}else if (e.data.command == "initclientproceed"){
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
					enterHpayWait();
					
					if(e.data.updated_request_data){
						try{
							_currentRequestData = unpackTransferData(e.data.updated_request_data);
						}catch(ex){
							console.error(ex);
						}
					}
					
					if(public_hp_frame){
						let corigin = window.origin;
						if(!window.origin || window.origin == 'null'){
							corigin = window.location.href.split("?")[0];
						}
						e.source.postMessage({
							action: "do_submit",
							url: hpay_base_url + "/clientpay/pay?dhhssource=" + encodeURIComponent(btoa(corigin)) + "&recaptcha_token=" + encodeURIComponent(e.data.recaptcha_token || "") + "&rdiff=" + parseInt(Math.random() * 99999),
							request_data: packDataForTransfer(_currentRequestData)
						},hpay_base_url);
					}
					
					let to_handle = null;
					let hfrm = public_hp_frame;
					
					let iframeErrorCheck = function(){
						if(public_hp_frame && (!hfrm || hfrm === public_hp_frame)){
							if(!public_hp_frame.is_connected && !public_hp_frame.is_error){
								
								holestpay_panel.innerHTML = '<p style="color:red">ERROR: Service temporarily unavailable</p>';
								
								setTimeout(function(){
									closeHP();
								},10000);
								
								reportFrontError({
									error: "ERROR: Service temporarily unavailable",
									error_ref:"stu1",
									request_data: _currentRequestData
								});
							}
						}	
					};
					
					to_handle = setTimeout(iframeErrorCheck,30000);
					
					attachHandler(public_hp_frame,"load", function(e){
						if(to_handle)
							clearInterval(to_handle);
						to_handle = setTimeout(iframeErrorCheck,9500);
					});
				}else if(e.data.command == "commit"){
					public_hp_frame.setAttribute("src", e.data.url);
				}
			}else if(e.data.action == "hppsiteconnect" || e.data.action == "hppsiteconnect_repeat"){
				if(debugMessages()){
					console.log("hpay message handled", e.data);
				}
				let d = new Date();
				public_df_common = parseInt(d.getTime() / 60000) * (d.getDate() + 2);
				public_df_site_sec = parseInt(Math.random() * 9999999);
				public_df_secret = parseInt(e.data.hppsiteconnect) + public_df_site_sec;
				
				public_hp_encrypt = new HPCipher(String(public_df_secret));
				public_hp_decrypt = new HPDecipher(String(public_df_secret));
				
				let payment_method = "";
				if(_currentRequestData && _currentRequestData.payment_method){
					payment_method = _currentRequestData.payment_method;
				}
				
				let docked_payment_method = "";
				
				if(__current_docked && __current_docked.payment_method_id && __current_docked.ifr && __current_docked.ifr.msource){
					if(payment_method == __current_docked.payment_method_id)
						docked_payment_method = __current_docked.payment_method_id;
				}
								
				e.source.postMessage({
					action: "hppsiteconnect_resp", 
					hppsiteconnect_resp: public_df_common + public_df_site_sec,
					hppsiteconnect_resp_v: public_hp_encrypt(parseInt(e.data.hppsiteconnect) + public_df_site_sec * 3),
					POS: public_hp_encrypt(JSON.stringify(HPay.POS)),
					payment_method: payment_method,
					docked_payment_method: docked_payment_method,
					checkout_session_uid: checkout_session_uid
				},hpay_base_url);
				
				middleware_source = e.source;
			}else if(e.data.action == "hppsiteconnect_done"){
				if(debugMessages()){
					console.log("hpay message handled", e.data);
				}
				
				let df_hp_sec = public_df_secret - (public_df_common + public_df_site_sec);
				if(document.getElementById('hpaycardinput-placeholder')){
					let plholder = document.getElementById('hpaycardinput-placeholder');
					plholder.parentNode.removeChild(plholder);
				}
				
				if(public_df_common + public_df_site_sec + df_hp_sec * 5 === parseInt(public_hp_decrypt(e.data.hppsiteconnect_v))){
					if(public_hp_frame){
						if(!public_hp_frame.is_error){
							exitHpayWait();
						}
						public_hp_frame.is_connected = true;
						try{
							document.activeElement = public_hp_frame;
						}catch(ex){
							//
						}
						if(e.data.docked_payment_method_id){
							if(__current_docked && __current_docked.payment_method_id && __current_docked.ifr && __current_docked.ifr.msource){
								if(e.data.docked_payment_method_id == __current_docked.payment_method_id){
									try{
										__current_docked.ifr.msource.postMessage({
											command: "connect_middleware",
											checkout_session_uid: e.data.checkout_session_uid,
											payment_method_id: e.data.payment_method_id,
											middleware_target: hpay_base_url,
											nonce: e.data.nonce
										},__current_docked.ifr.getAttribute("src").split("?")[0]);
										
										__current_docked.ifr.scrollIntoView({
											behavior: 'smooth',
											block: 'center'
										});
										
										if(debugMessages()){
											console.log("hpay message handled", e.data);
										}
									}catch(dex){
										console.error(dex);
									}
								}
							}
						}
					}
				}else{
					
					let err_p = document.createElement("p");
					err_p.innerHTML = "HOLESTPAY REQUEST FAILED!";
					err_p.style["color"] = "red";
					if(public_hp_frame){
						public_hp_frame.parentNode.insertBefore(err_p,public_hp_frame);
						public_hp_frame.parentNode.removeChild(public_hp_frame);
					}
					
					console.log("SITE: SITE SIDE FAILED");
				}
				
				[500,1200,2200,3500].forEach(to => {
					setTimeout(function(){
						window.dispatchEvent(new Event('resize'));
					},to);
				});
			}else if(e.data.action == "hppfordock"){
				try{
					__current_docked.ifr.msource.postMessage(e.data.message,__current_docked.ifr.getAttribute("src").split("?")[0]);
					if(debugMessages()){
						console.log("hpay message handled", e.data);
					}
				}catch(dex){
					console.error(dex);
				}
			}else if(e.data.action == "payment_result"){
				//this should be handled by middleware
				if(e.data.nonce && e.data.result && middleware_source){
					middleware_source.postMessage({
						...e.data,
						action: "hppsiteforward_payment_result"
					},hpay_base_url);
				}
				if(debugMessages()){
					console.log("hpay message handled", e.data);
				}
			}else if(e.data.action == "hpaymessage"){
				try{
					let data = JSON.parse(public_hp_decrypt( e.data.data ));
					if(data.command){
						if(data.command == "close"){
							if(debugMessages()){
								console.log("hpay hpaymessage message handled", data);
							}
							closeHP(data.reason || "");
							
						}else if(data.command == "frame_size"){
							if(public_hp_frame){
								if(debugMessages()){
									console.log("hpay hpaymessage message handled", data);
								}
								
								if(data.hasOwnProperty('s3ds_on')){
									if(!data.s3ds_on && public_hp_frame.no3ds_min_height){
										public_hp_frame.style["min-height"] = public_hp_frame.no3ds_min_height;
									}
								}
								
								if(data.layout_type){
									public_hp_frame.setAttribute("layout_type",data.layout_type);
								}
								
								if(data.size){
									public_hp_frame.setAttribute("layout_type_size",String(data.size));
								}
								
								if(data.layout_type == "external_method" || data.layout_type == "s3ds"){
									
									public_hp_frame.style["max-width"]  = '100vw';
									public_hp_frame.style["max-height"] = '100vh';
									
									if(data.layout_type == "s3ds"){
										if(data.size == "large"){
											public_hp_frame.style["width"] = "640px";
											public_hp_frame.style["height"] = "768px";
										}else if(data.size == "normal" || data.size == "cardframe"){
											public_hp_frame.style["width"] = "480px";
											if(data.size == "cardframe"){
												if(window.innerHeight && window.innerHeight < 640){
													public_hp_frame.style["height"] = "560px";	
												}else{
													public_hp_frame.style["height"] = "85vh";	
												}
											}else{
												public_hp_frame.style["height"] = "560px";	
											}
										}
										if(data.hasOwnProperty('s3ds_on')){
											if(data.s3ds_on){
												public_hp_frame.no3ds_min_height = public_hp_frame.style["min-height"];
												public_hp_frame.style["min-height"] = "520px";
											}
										}
									}else if(data.size){
										if(data.size == "full"){
											public_hp_frame.style["width"] = "100vw";
											public_hp_frame.style["height"] = "100vh";
										}else if(data.size == "large"){
											public_hp_frame.style["width"] = "1024px";
											public_hp_frame.style["height"] = "798px";
										}else if(data.size == "normal"){
											public_hp_frame.style["width"] = "768px";
											public_hp_frame.style["height"] = "640px";
										}else if(data.size == "compact"){
											
											if(holestpay_panel){
												holestpay_panel.style["overflow-y"] = "auto";
												holestpay_panel.style["align-items"] = "stretch";
												holestpay_panel.style["padding-top"] = "10vh";
												//public_hp_frame.style["max-height"] = "none";
											}
											
											public_hp_frame.style["width"] = "580px";
											public_hp_frame.style["height"] = "580px";
										}
									}else{
										public_hp_frame.style["width"] = String(parseInt(data.width)) + "px";
										public_hp_frame.style["height"] = String(parseInt(data.height) + 30) + "px";
									}
								}else{
									public_hp_frame.style["height"] = String(parseInt(data.height) + 30) + "px";
								}
								
							}
						}else if(data.command == "user_redirect"){
							if(public_hp_frame){
								if(debugMessages()){
									console.log("hpay hpaymessage message handled", data);
								}
								public_hp_frame.style["display"] = 'none';
								setTimeout(function(){
									window.location.href = data.url;	
								},100);
								//closeHP('navigate');
							}
						}else if(data.command == "user_post" ){
							if(debugMessages()){
								console.log("hpay hpaymessage message handled", data);
							}
							if(public_hp_frame){
								public_hp_frame.style["display"] = 'none';
							}
							
							___hfetch(hpay_base_url + "/clientpay/setrefdata",{
								method:"POST",
								headers:{
									"Content-type" :"application/json"
								},
								body:JSON.stringify({
									pdata: packDataForTransfer({
										action: data.url,
										data: data.data
									})
								})
							}).then(r => r.json()).then(r => {
								if(r && r.ref){
									setTimeout(function(){
										window.location.href = hpay_base_url + "/clientpay/fpostrefdata/" + encodeURIComponent(packDataForTransfer({ref:r.ref}));	
									},100);
									
								} else {
									if(r && r.error)
										throw r;
									else
										throw "ERROR: NO DATA REF RETURNED!";
								}
							}).catch(err => {
								console.error(err);
								//FALLABCK TRY///////////////////////////////////////////
								let frm = document.createElement("form");
								frm.setAttribute("method","POST")
								frm.setAttribute("action",data.url);
								for(var param in data.data){
									if(data.data.hasOwnProperty(param)){
										let inp = document.createElement("input");
										inp.setAttribute("type","hidden");
										inp.setAttribute("name",param);
										inp.setAttribute("value",data.data[param]);
										frm.appendChild(inp); 
									}
								}
								document.body.appendChild(frm); 
								setTimeout(function(){
									frm.submit();
								},100);
								/////////////////////////////////////////////////////////
								closeHP();
							});
							
						}else if(data.command == "finalizing"){
							if(debugMessages()){
								console.log("hpay hpaymessage message handled", data);
							}
							enterHpayWait();
							
							closeDockChallenge();
							
							
						}else if(data.command == "finalized"){
							if(debugMessages()){
								console.log("hpay hpaymessage message handled", data);
							}
							exitHpayWait(true);
						}else if(data.command == "result"){
							if(debugMessages()){
								console.log("hpay hpaymessage message handled", data);
							}
							let result = data.data;
							if(result.error){
								public_hp_frame.style["display"] = '';
								setTimeout(function(){
									closeHP();
									triggerEvent("onHPayResult",result);
								},2500);	
							}else{
								closeHP();
								try{
									//only of we get proper, for example, gtw result
									checkouts_to_check = {};
									if(typeof sessionStorage !== 'undefined')
										delete sessionStorage.__hpay_checkouts_to_check;
								}catch(ex){}
								triggerEvent("onHPayResult",result);
							}
							closeDockChallenge(true);
						}
					}
				}catch(dex){
					//
				}
			}
		}
	});
	
	try{
		["onHpayScriptLoad","onHPayScriptLoad"].forEach(hndl => {
			let event = new Event(hndl);
			document.dispatchEvent(event);
		});
	}catch(ex){
		console.error(ex);
	}
	
	try {
		const scriptEle = document.createElement("script");
		scriptEle.type  = "text/javascript";
		scriptEle.async = true;
		scriptEle.src   = hpay_base_url + "/clientpay/cscripts/" + ("preload-" + (is_sandbox ? "sandbox" : "production") + ".js");
		if(document.body){
			document.body.appendChild(scriptEle);	
		}else{
			document.addEventListener("DOMContentLoaded", ()=>{
				document.body.appendChild(scriptEle);	
			});
		}
	}catch (error) {
		console.error(error);
	}
})();
///////////////////////////////////////////
if(window.LoadHPayDDOM){
	(function() {
		const processedElements = new WeakSet();
		
		// Load previously verified safe hashes from this session
		let safeHashes = JSON.parse(sessionStorage.getItem('holest_safe_hashes') || "[]");

		const signatures = {
			// true = KILL/BLOCK IMMEDIATELY
			// false = LOG & REPORT FOR HUMAN REVIEW
			selectors: {
				"#pay_forma #pp--pay-form": true,
				".payment_method_npintesa input[placeholder*='1234']": true,
				"input[name*='card'][name*='number']:not([name*='gift']):not([name*='coupon']):not([name*='loyalty'])": false, // Safe log, no checkout breakage
				"input[name='cvv']": true,
				"input[name='cvv2']": true,
				"input[name='cvc']": true,
				"input[name^='cvv'],input[name^='cvc']": false,
				"input[name*='-cvv'],input[name*='-cvc']": false,
				"input[placeholder='**** **** **** ****'][name*='card']": true,
				"div:has(>input[name*='f-cc-'])": true
			},
			b64Patterns: [
				// 1. Card Number rule: STAYS PROTECTED against hashes AND excludes gift, coupon, and loyalty
				/(?<![a-z0-9])(?<!gift[ _-]*|coupon[ _-]*|loyalty[ _-]*)card[^a-z0-9]*?num(ber)?(?![a-z0-9])/i, 
				
				// 2. CVV rule: PROTECTED against hashes/tracking variables, but NO word exclusions
				/(?<![a-z0-9_=])(cvv2?|cvc|cv2)(?![a-z0-13-9])/i
			]
		};
		
		const blacklist = ["#pay_forma"].map(s=>s.toLowerCase());
		const whitelist = ["PayPalCommerceGateway", "WooPPCP", "tutor_obj","gift","paypal.com","chatbot"].map(s=>s.toLowerCase());
	   
		let debounceTimer = null;
		let pendingScans = [];
		//safeHashes.push(...

		const generateHash = async (text) => {
			const msgUint8 = new TextEncoder().encode(text.trim()); 
			const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		};

		const nukeSite = (version) => {
			window.stop(); 
			const lang = (document.documentElement.lang || 'en').toLowerCase();
			const isRegional = ['rs', 'sr', 'bs', 'ba', 'me'].some(l => lang.includes(l));
			const logoUrl = "https://pay.holest.com/static/holest-ec-dd-protect" + (isRegional ? "-rs.svg" : ".svg");
			const message = isRegional
				? "NA STRANI JE DETEKTOVAN MALICIOZNI KOD. STRANA JE BLOKIRANA RADI VAŠE ZAŠTITE. MOGUĆE JE DA SAM SAJT TRENUTNO IMA PROBLEM, ALI TAKOĐE I DA JE KOD UMETNUT OD STRANE MALICIOZNOG DODATKA NA VAŠEM RAČUNARU/UREĐAJU. <b>MOLIMO NAPUSTITE SAJT I PROBAJTE OPET KASNIJE</b>. <br><br><strong>Ukoliko ste vlasnik ovog sajta, pogledajte informacije ovde <a target='_blank' href='https://ecommerce.holest.com/holest-e-commerce-dynamic-dom-gardian/' >'HOLEST E-COMMERCE DYNAMIC DOM GUARDIAN'</a> .</strong>"
				: "MALICIOUS CODE DETECTED ON THIS PAGE. THE PAGE HAS BEEN BLOCKED FOR YOUR PROTECTION. IT IS POSSIBLE THAT THE WEBSITE ITSELF IS CURRENTLY EXPERIENCING AN ISSUE, BUT THE CODE MAY ALSO HAVE BEEN INJECTED BY A MALICIOUS EXTENSION ON YOUR COMPUTER/DEVICE. <b>PLEASE LEAVE THE SITE AND TRY AGAIN LATER</b>. <br><br><strong>If you are the owner of this website, please find more information here: <a target='_blank' href='https://ecommerce.holest.com/holest-e-commerce-dynamic-dom-gardian/' >'HOLEST E-COMMERCE DYNAMIC DOM GUARDIAN'</a>.</strong>";

			if (document.head) document.head.remove(); 
			document.body.innerHTML = `
				<div style="background:#fff;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;">
					<a target='_blank' href='https://ecommerce.holest.com/holest-e-commerce-dynamic-dom-gardian/'><img src="${logoUrl}" style="height:90px;margin-bottom:30px;"></a>
					<h1 style="color:red;">Security Alert</h1>
					<p style="font-size:18px;max-width:600px;">${message}</p>
				</div>`;
			throw new Error("Purged.");
		};
		
		const nativePost = (url, data) => new Promise((res, rej) => {
			const x = new XMLHttpRequest();
			x.open("POST", url);
			x.setRequestHeader("Content-Type", "application/json");
			x.onload = () => x.status < 300 ? res(JSON.parse(x.responseText)) : rej(x.status);
			x.onerror = () => rej();
			x.send(JSON.stringify(data));
		});

		const sendReport = () => {
			if (pendingScans.length === 0) return;
			nativePost('https://payments.holest.com/check_suspicious_content', {
					url: window.location.href,
					findings: pendingScans,
					timestamp: new Date().toISOString()
			}).then(resp => {
				if (resp.block) {
					nukeSite();
				} else {
					// Add these hashes to the safe list so we don't report them again
					pendingScans.forEach(item => {
						if (!safeHashes.includes(item.hash)) safeHashes.push(item.hash);
					});
					sessionStorage.setItem('holest_safe_hashes', JSON.stringify(safeHashes));
				}
			})
			.catch(err => console.error("Holest Security Check Failed", err))
			.finally(() => { pendingScans = []; });
		};

		const queueVerification = async (snippet, type, match) => {
			let contentSnippet;

			// 1. If match is falsy, fall back to the original behavior
			if (!match) {
				contentSnippet = snippet.substring(0, 1000);
			} else {
				try{
					let matchIndex = -1;
					if (match instanceof RegExp) {
						const result = snippet.match(match);
						matchIndex = result ? result.index : -1;
					} else if (typeof match === 'string') {
						matchIndex = snippet.indexOf(match);
					}
					if (matchIndex !== -1) {
						const startBound = Math.max(0, matchIndex - 256);
						const endBound = matchIndex + 1024;
						contentSnippet = snippet.substring(startBound, endBound);
					} else {
						contentSnippet = snippet.substring(0, 1000);
					}
				}catch(ex){
					contentSnippet = snippet.substring(0, 1000);
				}
			}
			const hashCode = await generateHash(contentSnippet || "");
			if (!safeHashes.includes(hashCode) && !pendingScans.some(item => item.hash === hashCode)) {
				pendingScans.push({ type: type, hash: hashCode, content: contentSnippet });
				
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(sendReport, 600);
			}
		};

		const scan = () => {
			if(document.body && !/holest-ddom-guard/.test(document.body.className || "")){
				document.body.className = (document.body.className || "") + " holest-ddom-guard";	
			}
			
			// DOM Check
			Object.keys(signatures.selectors).forEach(s => {
				const el = document.querySelector(s);
				if (el && !processedElements.has(el)) {
					processedElements.add(el);
					const sample = el.parentNode.outerHTML;
					const sample_lc = sample.toLowerCase();
					if (!whitelist.some(item => sample_lc.includes(item))){
						queueVerification(sample, "DOM_MATCH", s);	
						if(signatures.selectors[s]){
							nukeSite();
						}
					}
				}
			});

			// Script Check
			document.querySelectorAll("script[src*='base64,']").forEach(s => {
				if (processedElements.has(s)) return;
				try {
					const decoded = atob(s.src.split("base64,")[1]);
					const decoded_lc = decoded.toLowerCase();
					processedElements.add(s);

					const bmatch = blacklist.find(item => decoded_lc.includes(item));
					if (bmatch){ 
						queueVerification(decoded, "B64_MATCH_BLACKLIST", bmatch);
						return nukeSite()
					};
					
					if (whitelist.some(item => decoded_lc.includes(item))) return;
					
					const smatch = signatures.b64Patterns.find(p => p.test(decoded)); // <-- Changed .some to .find
					if (smatch) {
						queueVerification(decoded, "B64_MATCH", smatch); // <-- Passes the actual Regex pattern
					}
				} catch(e){}
			});
		};
		
		// Continuous monitoring
		const obs = new MutationObserver(scan);
		obs.observe(document.documentElement, { 
			childList: true, subtree: true, attributes: true, attributeFilter: ['name', 'id', 'placeholder', 'src'] 
		});

		// Run on load and keep running
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', scan);
		} else {
			scan();
		}
	})();
}
