/**
 * Bare Node.js sample – HolestPay Admin order API (from hpay.indev.js):
 *   1) getOrders  – last 30 days
 *   2) getOrder   – latest order from that list
 *   3) updateOrder – set Data.billing.note
 *
 * Usage:
 *   node hpay_orders_api_sample_nodejs.js
 */

const crypto = require('crypto');
const https = require('https');
const { URL, URLSearchParams } = require('url');

const environment = 'sandbox'; // 'sandbox' | 'production'
const merchantSiteUid = '6c471a88-8408-46b1-91fa-87a7f729b97f';
const secretToken = 'Pi59VNFqgUfBLCimOP5aFborTvlBCtiR';

const baseUrl = environment === 'sandbox'
  ? 'https://sandbox.pay.holest.com'
  : 'https://pay.holest.com';

function hpaySign(fields, merchantSiteUid, secretToken) {
  const transactionUid = String(fields.transaction_uid || '').trim();
  const status = String(fields.status || '').trim();
  const orderUid = String(fields.order_uid || '').trim();
  const currency = String(fields.order_currency || '').trim();
  const vaultTokenUid = String(fields.vault_token_uid || '').trim();
  const subscriptionUid = String(fields.subscription_uid || '').trim();
  const rand = String(fields.rand || '').trim();
  const amount = Number(fields.order_amount != null ? fields.order_amount : 0).toFixed(8);

  const src = `${transactionUid}|${status}|${orderUid}|${amount}|${currency}|${vaultTokenUid}|${subscriptionUid}${rand}`;
  const md5 = crypto.createHash('md5').update(src + merchantSiteUid, 'utf8').digest('hex');
  return crypto.createHash('sha512').update(md5 + secretToken, 'utf8').digest('hex').toLowerCase();
}

function hpayRand() {
  return `${Math.floor(Math.random() * 999999)}${new Date().toISOString()}${Math.floor(Math.random() * 999999)}`;
}

function logRequest(method, url, headers = {}, body = null) {
  console.log('---- REQUEST ----');
  console.log('METHOD:', method);
  console.log('URL:', url);
  console.log('HEADERS:');
  for (const [k, v] of Object.entries(headers)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('BODY:', body == null ? '(none)' : (typeof body === 'string' ? body : JSON.stringify(body, null, 2)));
  console.log('-----------------');
}

function request(method, url, headers = {}, body = null) {
  const u = new URL(url);
  const payload = body == null ? null : (typeof body === 'string' ? body : JSON.stringify(body));
  logRequest(method, url, headers, payload);
  const opts = {
    method,
    hostname: u.hostname,
    path: u.pathname + u.search,
    headers: { ...headers },
    timeout: 30000,
    rejectUnauthorized: false,
  };
  if (payload != null) {
    opts.headers['Content-Length'] = Buffer.byteLength(payload);
  }

  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch (_) {}
        resolve({ http: res.statusCode, raw, json });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    if (payload != null) req.write(payload);
    req.end();
  });
}

async function signedGet(url, signFields = {}) {
  const rand = hpayRand();
  const hash = hpaySign({ ...signFields, rand }, merchantSiteUid, secretToken);
  return request('GET', url, { rand, verificationhash: hash });
}

async function signedPostJson(url, signFields, jsonBody) {
  const rand = hpayRand();
  const hash = hpaySign({ ...signFields, rand }, merchantSiteUid, secretToken);
  return request('POST', url, {
    rand,
    verificationhash: hash,
    'Content-Type': 'application/json; charset=utf-8',
  }, jsonBody);
}

function extractOrders(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  for (const key of ['items', 'Orders', 'orders', 'data', 'result', 'Results']) {
    if (Array.isArray(resp[key])) return resp[key];
  }
  return [];
}

function orderUidOf(order) {
  if (!order || typeof order !== 'object') return null;
  for (const key of ['Uid', 'uid', 'OrderUid', 'order_uid', 'ID', 'Id']) {
    if (order[key]) return String(order[key]);
  }
  return null;
}

(async () => {
  // filter / sort_order format matches HolestPay admin UI / API, e.g.:
  // filter={"CreatedAt":{"op":"between","value":["2026-05-03T00:00:00","2026-08-10T23:59:59"]}}
  // sort_order=[["id","DESC"]]
  const pad = (n) => String(n).padStart(2, '0');
  const fmtLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    + `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date();
  toDate.setHours(23, 59, 59, 0);

  const filter = {
    CreatedAt: {
      op: 'between',
      value: [fmtLocal(fromDate), fmtLocal(toDate)],
    },
  };
  const sortOrder = [['id', 'DESC']];

  const qs = new URLSearchParams({
    offset: '0',
    limit: '50',
    filter: JSON.stringify(filter),
    sort_order: JSON.stringify(sortOrder),
  });

  const listUrl = `${baseUrl.replace(/\/$/, '')}/clientpay/orders/${encodeURIComponent(merchantSiteUid)}?${qs}`;
  console.log('=== 1) getOrders (last 30 days) ===');
  const listRes = await signedGet(listUrl);
  console.log('HTTP:', listRes.http);
  console.log(JSON.stringify(listRes.json, null, 2), '\n');

  const orders = extractOrders(listRes.json);
  if (!orders.length) {
    console.log('No orders in last 30 days – stop.');
    return;
  }

  const orderUid = orderUidOf(orders[0]);
  if (!orderUid) {
    console.log('Could not resolve order Uid – stop.');
    console.log(JSON.stringify(orders[0], null, 2));
    process.exit(1);
  }
  console.log('Latest order_uid:', orderUid, '\n');

  const getUrl = `${baseUrl.replace(/\/$/, '')}/clientpay/orders/${encodeURIComponent(merchantSiteUid)}/${encodeURIComponent(orderUid)}`;
  console.log('=== 2) getOrder ===');
  const getRes = await signedGet(getUrl, { order_uid: orderUid });
  console.log('HTTP:', getRes.http);
  console.log(JSON.stringify(getRes.json, null, 2), '\n');

  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  const note = `Updejtovano preko api poziva , vreme ${now}`;
  const updateBody = {
    Order: {
      Data: {
        billing: {
          note,
        },
      },
    },
  };

  const updUrl = `${baseUrl.replace(/\/$/, '')}/clientpay/orders/${encodeURIComponent(merchantSiteUid)}/${encodeURIComponent(orderUid)}/update`;
  console.log('=== 3) updateOrder ===');
  const updRes = await signedPostJson(updUrl, { order_uid: orderUid }, updateBody);
  console.log('HTTP:', updRes.http);
  console.log(JSON.stringify(updRes.json, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
