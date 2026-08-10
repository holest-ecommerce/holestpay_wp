/**
 * Bare Node.js sample: call payment module method `queryRequest`
 *
 * Same concept as fiscal/integration `defaultAction`:
 *   POST {base}/clientpay/handlers/{type}/{merchant_site_uid}/{module_uid}/{order_uid}/{method}
 *
 * Payment:
 *   handlers/payment/{merchant_site_uid}/{payment_method_uid}/{order_uid}/queryRequest
 *
 * Usage:
 *   node hpay_payment_queryRequest_sample_nodejs.js
 */

const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

// ---------------------------------------------------------------------------
// Config – fill these in
// ---------------------------------------------------------------------------
const environment = 'sandbox'; // 'sandbox' | 'production'
const merchantSiteUid = '6c471a88-8408-46b1-91fa-87a7f729b97f';
const secretToken = 'Pi59VNFqgUfBLCimOP5aFborTvlBCtiR';
const paymentMethodUid = 'ipgtas_redirect-2'; // (or 823)
const orderUid = '145700';

const baseUrl = environment === 'sandbox'
  ? 'https://sandbox.pay.holest.com'
  : 'https://pay.holest.com';

// ---------------------------------------------------------------------------
// Sign request – verificationhash
// src = "{transaction_uid}|{status}|{order_uid}|{amount}|{currency}|{vault_token_uid}|{subscription_uid}{rand}"
// md5 = md5(src + merchant_site_uid)
// verificationhash = sha512(md5 + secret_token) lowercase hex
// ---------------------------------------------------------------------------
function hpaySignRequest(data, merchantSiteUid, secretToken) {
  const transactionUid = data.transaction_uid != null ? String(data.transaction_uid).trim() : '';
  const status = data.status != null ? String(data.status) : '';
  const orderUid = data.order_uid != null ? String(data.order_uid).trim() : '';
  const vaultTokenUid = data.vault_token_uid != null ? String(data.vault_token_uid).trim() : '';
  const subscriptionUid = data.subscription_uid != null ? String(data.subscription_uid).trim() : '';
  const currency = data.order_currency != null ? String(data.order_currency).trim() : '';

  let amount = data.order_amount != null ? Number(data.order_amount) : 0;
  amount = amount.toFixed(8);

  if (!data.rand) {
    data.rand = `rnd${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }
  const rand = String(data.rand);

  const src = `${transactionUid}|${status}|${orderUid}|${amount}|${currency}|${vaultTokenUid}|${subscriptionUid}${rand}`;
  const md5 = crypto.createHash('md5').update(src + merchantSiteUid, 'utf8').digest('hex');
  data.verificationhash = crypto.createHash('sha512').update(md5 + secretToken, 'utf8').digest('hex').toLowerCase();
  return data;
}

async function postJson(url, body) {
  const u = new URL(url);
  const payload = JSON.stringify(body);

  const options = {
    method: 'POST',
    hostname: u.hostname,
    path: u.pathname + u.search,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: 22000,
    // sample only – prefer proper CA verification in production
    rejectUnauthorized: false,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, raw });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

(async () => {
  const request = hpaySignRequest({ order_uid: orderUid }, merchantSiteUid, secretToken);

  const url = `${baseUrl.replace(/\/$/, '')}/clientpay/handlers/payment/`
    + `${encodeURIComponent(merchantSiteUid)}/`
    + `${encodeURIComponent(paymentMethodUid)}/`
    + `${encodeURIComponent(orderUid)}/`
    + 'queryRequest';

  console.log('URL:', url);
  console.log('Request:\n' + JSON.stringify(request, null, 2) + '\n');

  const { statusCode, raw } = await postJson(url, request);
  console.log('HTTP:', statusCode);
  console.log('Response:');
  try {
    console.log(JSON.stringify(JSON.parse(raw), null, 2));
  } catch {
    console.log(raw);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

/*
 * Fiscal:   .../handlers/fiscal/{merchant_site_uid}/{module_uid}/{order_uid}/defaultAction
 * Payment:  .../handlers/payment/{merchant_site_uid}/{module_uid}/{order_uid}/queryRequest
 */
