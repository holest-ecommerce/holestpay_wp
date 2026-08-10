/*
 * Bare C# sample – HolestPay Admin order API (from hpay.indev.js):
 *   1) getOrders  – last 30 days
 *   2) getOrder   – latest order from that list
 *   3) updateOrder – set Data.billing.note
 *
 * Usage:
 *   dotnet new console -n HpayOrdersSample -f net8.0 --force
 *   copy /Y hpay_orders_api_sample_csharp.cs HpayOrdersSample\Program.cs
 *   cd HpayOrdersSample
 *   dotnet run
 */

using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

var environment = "sandbox"; // "sandbox" | "production"
var merchantSiteUid = "6c471a88-8408-46b1-91fa-87a7f729b97f";
var secretToken = "Pi59VNFqgUfBLCimOP5aFborTvlBCtiR";

var baseUrl = environment == "sandbox"
    ? "https://sandbox.pay.holest.com"
    : "https://pay.holest.com";

using var handler = new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
};
using var http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(30) };

string HpaySign(Dictionary<string, object?> fields)
{
    string Get(string key, bool trim = true)
    {
        if (!fields.TryGetValue(key, out var v) || v is null) return "";
        var s = Convert.ToString(v, CultureInfo.InvariantCulture) ?? "";
        return trim ? s.Trim() : s;
    }

    var transactionUid = Get("transaction_uid");
    var status = Get("status");
    var orderUid = Get("order_uid");
    var currency = Get("order_currency");
    var vaultTokenUid = Get("vault_token_uid");
    var subscriptionUid = Get("subscription_uid");
    var rand = Get("rand");

    double amountNum = 0;
    if (fields.TryGetValue("order_amount", out var a) && a != null)
        amountNum = Convert.ToDouble(a, CultureInfo.InvariantCulture);
    var amount = amountNum.ToString("0.00000000", CultureInfo.InvariantCulture);

    var src = $"{transactionUid}|{status}|{orderUid}|{amount}|{currency}|{vaultTokenUid}|{subscriptionUid}{rand}";
    var md5 = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(src + merchantSiteUid))).ToLowerInvariant();
    return Convert.ToHexString(SHA512.HashData(Encoding.UTF8.GetBytes(md5 + secretToken))).ToLowerInvariant();
}

string HpayRand() =>
    Random.Shared.Next(100000, 999999) + DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'") + Random.Shared.Next(100000, 999999);

void LogRequest(string method, string url, IEnumerable<KeyValuePair<string, string>> headers, string? body)
{
    Console.WriteLine("---- REQUEST ----");
    Console.WriteLine("METHOD: " + method);
    Console.WriteLine("URL: " + url);
    Console.WriteLine("HEADERS:");
    foreach (var h in headers)
        Console.WriteLine($"  {h.Key}: {h.Value}");
    Console.WriteLine("BODY: " + (body ?? "(none)"));
    Console.WriteLine("-----------------");
}

async Task<(int http, string raw, JsonElement? json)> SignedGet(string url, Dictionary<string, object?>? signFields = null)
{
    signFields ??= new Dictionary<string, object?>();
    var rand = HpayRand();
    signFields["rand"] = rand;
    var hash = HpaySign(signFields);

    var headers = new Dictionary<string, string>
    {
        ["rand"] = rand,
        ["verificationhash"] = hash,
    };
    LogRequest("GET", url, headers, null);

    using var req = new HttpRequestMessage(HttpMethod.Get, url);
    req.Headers.TryAddWithoutValidation("rand", rand);
    req.Headers.TryAddWithoutValidation("verificationhash", hash);

    var res = await http.SendAsync(req);
    var raw = await res.Content.ReadAsStringAsync();
    JsonElement? json = null;
    try { json = JsonDocument.Parse(raw).RootElement.Clone(); } catch { }
    return ((int)res.StatusCode, raw, json);
}

async Task<(int http, string raw, JsonElement? json)> SignedPostJson(string url, Dictionary<string, object?> signFields, object body)
{
    var rand = HpayRand();
    signFields["rand"] = rand;
    var hash = HpaySign(signFields);

    var jsonBody = JsonSerializer.Serialize(body, new JsonSerializerOptions { WriteIndented = true });
    var headers = new Dictionary<string, string>
    {
        ["rand"] = rand,
        ["verificationhash"] = hash,
        ["Content-Type"] = "application/json; charset=utf-8",
    };
    LogRequest("POST", url, headers, jsonBody);

    using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

    using var req = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
    req.Headers.TryAddWithoutValidation("rand", rand);
    req.Headers.TryAddWithoutValidation("verificationhash", hash);

    var res = await http.SendAsync(req);
    var raw = await res.Content.ReadAsStringAsync();
    JsonElement? json = null;
    try { json = JsonDocument.Parse(raw).RootElement.Clone(); } catch { }
    return ((int)res.StatusCode, raw, json);
}

static List<JsonElement> ExtractOrders(JsonElement? resp)
{
    var list = new List<JsonElement>();
    if (resp is null) return list;
    var r = resp.Value;
    if (r.ValueKind == JsonValueKind.Array)
    {
        foreach (var i in r.EnumerateArray()) list.Add(i.Clone());
        return list;
    }
    if (r.ValueKind != JsonValueKind.Object) return list;
    foreach (var key in new[] { "items", "Orders", "orders", "data", "result", "Results" })
    {
        if (r.TryGetProperty(key, out var arr) && arr.ValueKind == JsonValueKind.Array)
        {
            foreach (var i in arr.EnumerateArray()) list.Add(i.Clone());
            return list;
        }
    }
    return list;
}

static string? OrderUidOf(JsonElement order)
{
    foreach (var key in new[] { "Uid", "uid", "OrderUid", "order_uid", "ID", "Id" })
    {
        if (order.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String && !string.IsNullOrEmpty(v.GetString()))
            return v.GetString();
        if (order.TryGetProperty(key, out v) && v.ValueKind == JsonValueKind.Number)
            return v.ToString();
    }
    return null;
}

static string Pretty(JsonElement? el) =>
    el is null ? "(null)" : JsonSerializer.Serialize(el.Value, new JsonSerializerOptions { WriteIndented = true });

// 1) getOrders
// filter / sort_order format matches HolestPay admin UI / API, e.g.:
// filter={"CreatedAt":{"op":"between","value":["2026-05-03T00:00:00","2026-08-10T23:59:59"]}}
// sort_order=[["id","DESC"]]
var from = DateTime.Now.AddDays(-30).Date.ToString("yyyy-MM-dd'T'HH:mm:ss");
var to = DateTime.Now.Date.AddDays(1).AddSeconds(-1).ToString("yyyy-MM-dd'T'HH:mm:ss");
var filter = new Dictionary<string, object>
{
    ["CreatedAt"] = new Dictionary<string, object>
    {
        ["op"] = "between",
        ["value"] = new[] { from, to },
    },
};
var sortOrder = new object[] { new object[] { "id", "DESC" } };

var filterJson = JsonSerializer.Serialize(filter);
var sortJson = JsonSerializer.Serialize(sortOrder);
var qs = "offset=0&limit=50"
    + "&filter=" + Uri.EscapeDataString(filterJson)
    + "&sort_order=" + Uri.EscapeDataString(sortJson);

var listUrl = $"{baseUrl.TrimEnd('/')}/clientpay/orders/{Uri.EscapeDataString(merchantSiteUid)}?{qs}";
Console.WriteLine("=== 1) getOrders (last 30 days) ===");
var listRes = await SignedGet(listUrl);
Console.WriteLine("HTTP: " + listRes.http);
Console.WriteLine(Pretty(listRes.json));
Console.WriteLine();

var orders = ExtractOrders(listRes.json);
if (orders.Count == 0)
{
    Console.WriteLine("No orders in last 30 days – stop.");
    return;
}

var orderUid = OrderUidOf(orders[0]);
if (string.IsNullOrEmpty(orderUid))
{
    Console.WriteLine("Could not resolve order Uid – stop.");
    Console.WriteLine(Pretty(orders[0]));
    return;
}
Console.WriteLine("Latest order_uid: " + orderUid);
Console.WriteLine();

// 2) getOrder
var getUrl = $"{baseUrl.TrimEnd('/')}/clientpay/orders/{Uri.EscapeDataString(merchantSiteUid)}/{Uri.EscapeDataString(orderUid)}";
Console.WriteLine("=== 2) getOrder ===");
var getRes = await SignedGet(getUrl, new Dictionary<string, object?> { ["order_uid"] = orderUid });
Console.WriteLine("HTTP: " + getRes.http);
Console.WriteLine(Pretty(getRes.json));
Console.WriteLine();

// 3) updateOrder
var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + " UTC";
var note = "Updejtovano preko api poziva , vreme " + now;
var updateBody = new
{
    Order = new
    {
        Data = new
        {
            billing = new
            {
                note
            }
        }
    }
};

var updUrl = $"{baseUrl.TrimEnd('/')}/clientpay/orders/{Uri.EscapeDataString(merchantSiteUid)}/{Uri.EscapeDataString(orderUid)}/update";
Console.WriteLine("=== 3) updateOrder ===");
var updRes = await SignedPostJson(updUrl, new Dictionary<string, object?> { ["order_uid"] = orderUid }, updateBody);
Console.WriteLine("HTTP: " + updRes.http);
Console.WriteLine(Pretty(updRes.json));
