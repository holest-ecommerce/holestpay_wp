<?php
/**
 * Bare PHP sample – HolestPay Admin order API (from hpay.indev.js):
 *   1) getOrders  – last 30 days
 *   2) getOrder   – latest order from that list
 *   3) updateOrder – set Data.billing.note
 *
 * Usage:
 *   php hpay_orders_api_sample_php.php
 */

$environment       = 'sandbox'; // 'sandbox' | 'production'
$merchant_site_uid = '6c471a88-8408-46b1-91fa-87a7f729b97f';
$secret_token      = 'Pi59VNFqgUfBLCimOP5aFborTvlBCtiR';

$base_url = ($environment === 'sandbox')
	? 'https://sandbox.pay.holest.com'
	: 'https://pay.holest.com';

function hpay_sign(array $fields, $merchant_site_uid, $secret_token) {
	$transaction_uid  = isset($fields['transaction_uid']) ? trim((string) $fields['transaction_uid']) : '';
	$status           = isset($fields['status']) ? trim((string) $fields['status']) : '';
	$order_uid        = isset($fields['order_uid']) ? trim((string) $fields['order_uid']) : '';
	$currency         = isset($fields['order_currency']) ? trim((string) $fields['order_currency']) : '';
	$vault_token_uid  = isset($fields['vault_token_uid']) ? trim((string) $fields['vault_token_uid']) : '';
	$subscription_uid = isset($fields['subscription_uid']) ? trim((string) $fields['subscription_uid']) : '';
	$rand             = isset($fields['rand']) ? trim((string) $fields['rand']) : '';

	$amount = isset($fields['order_amount']) ? (float) $fields['order_amount'] : 0.0;
	$amount = number_format($amount, 8, '.', '');

	$src = "{$transaction_uid}|{$status}|{$order_uid}|{$amount}|{$currency}|{$vault_token_uid}|{$subscription_uid}{$rand}";
	$md5 = md5($src . $merchant_site_uid);
	return strtolower(hash('sha512', $md5 . $secret_token));
}

function hpay_rand() {
	return (string) random_int(100000, 999999) . gmdate('Y-m-d\TH:i:s.000\Z') . (string) random_int(100000, 999999);
}

function hpay_log_request($method, $url, array $headers = array(), $body = null) {
	echo "---- REQUEST ----\n";
	echo "METHOD: " . strtoupper($method) . "\n";
	echo "URL: {$url}\n";
	echo "HEADERS:\n";
	foreach ($headers as $k => $v) {
		echo "  {$k}: {$v}\n";
	}
	echo "BODY: ";
	if ($body === null) {
		echo "(none)\n";
	} else {
		echo (is_string($body) ? $body : json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "\n";
	}
	echo "-----------------\n";
}

function hpay_request($method, $url, array $headers = array(), $body = null) {
	$body_str = null;
	if ($body !== null) {
		$body_str = is_string($body) ? $body : json_encode($body, JSON_UNESCAPED_UNICODE);
	}
	hpay_log_request($method, $url, $headers, $body_str);

	$ch = curl_init($url);
	$hdrs = array();
	foreach ($headers as $k => $v) {
		$hdrs[] = $k . ': ' . $v;
	}
	$opts = array(
		CURLOPT_CUSTOMREQUEST  => strtoupper($method),
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HTTPHEADER     => $hdrs,
		CURLOPT_TIMEOUT        => 30,
		CURLOPT_SSL_VERIFYPEER => false,
	);
	if ($body_str !== null) {
		$opts[CURLOPT_POSTFIELDS] = $body_str;
	}
	curl_setopt_array($ch, $opts);
	$raw  = curl_exec($ch);
	$err  = curl_error($ch);
	$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	if ($err) {
		throw new RuntimeException('cURL error: ' . $err);
	}
	$decoded = json_decode($raw, true);
	return array(
		'http' => $code,
		'raw'  => $raw,
		'json' => (json_last_error() === JSON_ERROR_NONE) ? $decoded : null,
	);
}

function hpay_signed_get($url, $sign_fields, $merchant_site_uid, $secret_token) {
	$rand = hpay_rand();
	$sign_fields['rand'] = $rand;
	$hash = hpay_sign($sign_fields, $merchant_site_uid, $secret_token);
	return hpay_request('GET', $url, array(
		'rand'             => $rand,
		'verificationhash' => $hash,
	));
}

function hpay_signed_post_json($url, $sign_fields, $json_body, $merchant_site_uid, $secret_token) {
	$rand = hpay_rand();
	$sign_fields['rand'] = $rand;
	$hash = hpay_sign($sign_fields, $merchant_site_uid, $secret_token);
	return hpay_request('POST', $url, array(
		'rand'             => $rand,
		'verificationhash' => $hash,
		'Content-Type'     => 'application/json; charset=utf-8',
	), $json_body);
}

function hpay_extract_orders($resp) {
	if (!is_array($resp)) {
		return array();
	}
	if (isset($resp[0]) || $resp === array()) {
		return $resp;
	}
	foreach (array('items', 'Orders', 'orders', 'data', 'result', 'Results') as $key) {
		if (isset($resp[$key]) && is_array($resp[$key])) {
			return $resp[$key];
		}
	}
	return array();
}

function hpay_order_uid($order) {
	if (!is_array($order)) {
		return null;
	}
	foreach (array('Uid', 'uid', 'OrderUid', 'order_uid') as $key) {
		if (!empty($order[$key])) {
			return (string) $order[$key];
		}
	}
	return null;
}

// 1) getOrders
$from = (new DateTimeImmutable('now'))->modify('-30 days')->setTime(0, 0, 0)->format('Y-m-d\TH:i:s');
$to   = (new DateTimeImmutable('now'))->setTime(23, 59, 59)->format('Y-m-d\TH:i:s');
$filter = array(
	'CreatedAt' => array(
		'op'    => 'between',
		'value' => array($from, $to),
	),
);
$sort_order = array(array('id', 'DESC'));

$query = http_build_query(array(
	'offset'     => 0,
	'limit'      => 50,
	'filter'     => json_encode($filter),
	'sort_order' => json_encode($sort_order),
));

$list_url = rtrim($base_url, '/') . '/clientpay/orders/' . rawurlencode($merchant_site_uid) . '?' . $query;
echo "=== 1) getOrders (last 30 days) ===\n";
$list_res = hpay_signed_get($list_url, array(), $merchant_site_uid, $secret_token);
echo "HTTP: {$list_res['http']}\n";
echo json_encode($list_res['json'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

$orders = hpay_extract_orders($list_res['json']);
if (empty($orders)) {
	echo "No orders in last 30 days – stop.\n";
	exit(0);
}

$order_uid = hpay_order_uid($orders[0]);
if (!$order_uid) {
	echo "Could not resolve order Uid – stop.\n";
	exit(1);
}
echo "Latest order_uid: {$order_uid}\n\n";

// 2) getOrder
$get_url = rtrim($base_url, '/') . '/clientpay/orders/' . rawurlencode($merchant_site_uid) . '/' . rawurlencode($order_uid);
echo "=== 2) getOrder ===\n";
$get_res = hpay_signed_get($get_url, array('order_uid' => $order_uid), $merchant_site_uid, $secret_token);
echo "HTTP: {$get_res['http']}\n";
echo json_encode($get_res['json'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 3) updateOrder – HPay.updateOrder(uid, data) => POST body { Order: data }
$now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s') . ' UTC';
$note = 'Updejtovano preko api poziva , vreme ' . $now;

$update_body = array(
	'Order' => array(
		'Data' => array(
			'billing' => array(
				'note' => $note,
			),
		),
	),
);

$upd_url = rtrim($base_url, '/') . '/clientpay/orders/' . rawurlencode($merchant_site_uid) . '/' . rawurlencode($order_uid) . '/update';
echo "=== 3) updateOrder ===\n";
$upd_res = hpay_signed_post_json($upd_url, array('order_uid' => $order_uid), $update_body, $merchant_site_uid, $secret_token);
echo "HTTP: {$upd_res['http']}\n";
echo json_encode($upd_res['json'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
