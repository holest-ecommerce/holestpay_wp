<?php
/**
 * Bare PHP sample: call payment module method `queryRequest`
 *
 * Concept is the same as fiscal/integration `defaultAction`:
 *
 *   POST {base}/clientpay/handlers/{type}/{merchant_site_uid}/{module_uid}/{order_uid}/{method}
 *
 * Fiscal example (from plugin):
 *   handlers/fiscal/{merchant_site_uid}/{fiscal_uid}/{order_uid}/defaultAction
 *
 * Payment equivalent:
 *   handlers/payment/{merchant_site_uid}/{payment_method_uid}/{order_uid}/queryRequest
 *
 * No WordPress / HolestPay plugin code required.
 *
 * Usage:
 *   php hpay_payment_queryRequest_sample_php.php
 */

// ---------------------------------------------------------------------------
// Config – fill these in
// ---------------------------------------------------------------------------
$environment        = 'sandbox'; // 'sandbox' | 'production'
$merchant_site_uid  = '6c471a88-8408-46b1-91fa-87a7f729b97f';//'YOUR_MERCHANT_SITE_UID';
$secret_token       = 'Pi59VNFqgUfBLCimOP5aFborTvlBCtiR';//'YOUR_SECRET_TOKEN';
$payment_method_uid = 'ipgtas_redirect-2';//( ili 823)  'YOUR_PAYMENT_METHOD_UID'; // HPaySiteMethodId / payment module Uid
$order_uid          = '145700';//'YOUR_ORDER_UID';           // site order key / order_uid known to HolestPay

$base_url = ($environment === 'sandbox')
	? 'https://sandbox.pay.holest.com'
	: 'https://pay.holest.com';

// ---------------------------------------------------------------------------
// 1) Build request body (same idea as fiscal: at least order_uid)
// ---------------------------------------------------------------------------
$request = array(
	'order_uid' => $order_uid
);

// ---------------------------------------------------------------------------
// 2) Sign request – verificationhash
//    src = "{transaction_uid}|{status}|{order_uid}|{amount}|{currency}|{vault_token_uid}|{subscription_uid}{rand}"
//    md5 = md5(src . merchant_site_uid)
//    verificationhash = sha512(md5 . secret_token)  (lowercase hex)
// ---------------------------------------------------------------------------
function hpay_sign_request(array &$data, $merchant_site_uid, $secret_token) {
	$transaction_uid  = isset($data['transaction_uid']) ? trim((string) $data['transaction_uid']) : '';
	$status           = isset($data['status']) ? (string) $data['status'] : '';
	$order_uid        = isset($data['order_uid']) ? trim((string) $data['order_uid']) : '';
	$vault_token_uid  = isset($data['vault_token_uid']) ? trim((string) $data['vault_token_uid']) : '';
	$subscription_uid = isset($data['subscription_uid']) ? trim((string) $data['subscription_uid']) : '';
	$currency         = isset($data['order_currency']) ? trim((string) $data['order_currency']) : '';

	$amount = isset($data['order_amount']) ? $data['order_amount'] : null;
	if ($amount === null) {
		$amount = 0;
	}
	$amount = number_format((float) $amount, 8, '.', '');

	if (empty($data['rand'])) {
		$data['rand'] = uniqid('rnd', true);
	}
	$rand = (string) $data['rand'];

	$src = "{$transaction_uid}|{$status}|{$order_uid}|{$amount}|{$currency}|{$vault_token_uid}|{$subscription_uid}{$rand}";
	$md5 = md5($src . $merchant_site_uid);
	$data['verificationhash'] = strtolower(hash('sha512', $md5 . $secret_token));

	return $data;
}

hpay_sign_request($request, $merchant_site_uid, $secret_token);

// ---------------------------------------------------------------------------
// 3) Call endpoint (same pattern as fiscal defaultAction)
// ---------------------------------------------------------------------------
// Fiscal:   .../handlers/fiscal/{merchant_site_uid}/{fiscal_uid}/{order_uid}/defaultAction
// Payment:  .../handlers/payment/{merchant_site_uid}/{payment_method_uid}/{order_uid}/queryRequest
$url = rtrim($base_url, '/')
	. '/clientpay/handlers/payment/'
	. rawurlencode($merchant_site_uid) . '/'
	. rawurlencode($payment_method_uid) . '/'
	. rawurlencode($order_uid) . '/'
	. 'queryRequest';

$ch = curl_init($url);
curl_setopt_array($ch, array(
	CURLOPT_POST           => true,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
	CURLOPT_POSTFIELDS     => json_encode($request),
	CURLOPT_TIMEOUT        => 22,
	CURLOPT_SSL_VERIFYPEER => false,
));

$raw  = curl_exec($ch);
$err  = curl_error($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "URL:  {$url}\n";
echo "HTTP: {$code}\n";
if ($err) {
	echo "cURL error: {$err}\n";
	exit(1);
}

echo "Request:\n";
echo json_encode($request, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "Response:\n";
$decoded = json_decode($raw, true);
if (json_last_error() === JSON_ERROR_NONE) {
	echo json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
	echo $raw . "\n";
}

/*
 * Minimal conceptual comparison
 * -----------------------------
 * Fiscal / integration:
 *   POST /clientpay/handlers/fiscal/{merchant_site_uid}/{module_uid}/{order_uid}/defaultAction
 *   body: { "order_uid": "...", "rand": "...", "verificationhash": "..." }
 *
 * Payment queryRequest:
 *   POST /clientpay/handlers/payment/{merchant_site_uid}/{module_uid}/{order_uid}/queryRequest
 *   body: { "order_uid": "...", "rand": "...", "verificationhash": "..." }
 *
 * Only path segment type (`fiscal` vs `payment`) and method name differ.
 */
