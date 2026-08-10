/*
 * Bare C# sample: call payment module method `queryRequest`
 *
 * Same concept as fiscal/integration `defaultAction`:
 *   POST {base}/clientpay/handlers/{type}/{merchant_site_uid}/{module_uid}/{order_uid}/{method}
 *
 * Payment:
 *   handlers/payment/{merchant_site_uid}/{payment_method_uid}/{order_uid}/queryRequest
 *
 * Usage (from this folder):
 *   dotnet new console -n HpayQuerySample -f net8.0 --force
 *   copy /Y hpay_payment_queryRequest_sample_csharp.cs HpayQuerySample\Program.cs
 *   cd HpayQuerySample
 *   dotnet run
 *
 * Or paste into any .NET 6+ console Program.cs (top-level statements).
 */

using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

// ---------------------------------------------------------------------------
// Config – fill these in
// ---------------------------------------------------------------------------
var environment = "sandbox"; // "sandbox" | "production"
var merchantSiteUid = "6c471a88-8408-46b1-91fa-87a7f729b97f";
var secretToken = "Pi59VNFqgUfBLCimOP5aFborTvlBCtiR";
var paymentMethodUid = "ipgtas_redirect-2"; // (or 823)
var orderUid = "145700";

var baseUrl = environment == "sandbox"
    ? "https://sandbox.pay.holest.com"
    : "https://pay.holest.com";

// ---------------------------------------------------------------------------
// 1) Build + sign request
// src = "{transaction_uid}|{status}|{order_uid}|{amount}|{currency}|{vault_token_uid}|{subscription_uid}{rand}"
// md5 = md5(src + merchant_site_uid)
// verificationhash = sha512(md5 + secret_token) lowercase hex
// ---------------------------------------------------------------------------
var request = new Dictionary<string, object?>
{
    ["order_uid"] = orderUid,
};

HpaySignRequest(request, merchantSiteUid, secretToken);

var url = $"{baseUrl.TrimEnd('/')}/clientpay/handlers/payment/"
    + $"{Uri.EscapeDataString(merchantSiteUid)}/"
    + $"{Uri.EscapeDataString(paymentMethodUid)}/"
    + $"{Uri.EscapeDataString(orderUid)}/"
    + "queryRequest";

Console.WriteLine($"URL: {url}");
Console.WriteLine("Request:");
Console.WriteLine(JsonSerializer.Serialize(request, new JsonSerializerOptions { WriteIndented = true }));
Console.WriteLine();

// ---------------------------------------------------------------------------
// 2) POST JSON
// ---------------------------------------------------------------------------
using var handler = new HttpClientHandler
{
    // sample only – prefer proper CA verification in production
    ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
};
using var http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(22) };

var json = JsonSerializer.Serialize(request);
using var content = new StringContent(json, Encoding.UTF8, "application/json");
content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

var response = await http.PostAsync(url, content);
var raw = await response.Content.ReadAsStringAsync();

Console.WriteLine($"HTTP: {(int)response.StatusCode}");
Console.WriteLine("Response:");
try
{
    using var doc = JsonDocument.Parse(raw);
    Console.WriteLine(JsonSerializer.Serialize(doc.RootElement, new JsonSerializerOptions { WriteIndented = true }));
}
catch
{
    Console.WriteLine(raw);
}

static void HpaySignRequest(Dictionary<string, object?> data, string merchantSiteUid, string secretToken)
{
    string GetStr(string key, bool trim = true)
    {
        if (!data.TryGetValue(key, out var v) || v is null) return "";
        var s = Convert.ToString(v, CultureInfo.InvariantCulture) ?? "";
        return trim ? s.Trim() : s;
    }

    var transactionUid = GetStr("transaction_uid");
    var status = GetStr("status", trim: false);
    var orderUidLocal = GetStr("order_uid");
    var vaultTokenUid = GetStr("vault_token_uid");
    var subscriptionUid = GetStr("subscription_uid");
    var currency = GetStr("order_currency");

    double amountNum = 0;
    if (data.TryGetValue("order_amount", out var amountObj) && amountObj != null)
    {
        amountNum = Convert.ToDouble(amountObj, CultureInfo.InvariantCulture);
    }
    var amount = amountNum.ToString("0.00000000", CultureInfo.InvariantCulture);

    if (!data.ContainsKey("rand") || data["rand"] is null || string.IsNullOrEmpty(Convert.ToString(data["rand"])))
    {
        data["rand"] = "rnd" + Guid.NewGuid().ToString("N");
    }
    var rand = Convert.ToString(data["rand"], CultureInfo.InvariantCulture) ?? "";

    var src = $"{transactionUid}|{status}|{orderUidLocal}|{amount}|{currency}|{vaultTokenUid}|{subscriptionUid}{rand}";

    var md5 = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(src + merchantSiteUid))).ToLowerInvariant();
    var sha = Convert.ToHexString(SHA512.HashData(Encoding.UTF8.GetBytes(md5 + secretToken))).ToLowerInvariant();
    data["verificationhash"] = sha;
}

/*
 * Fiscal:   .../handlers/fiscal/{merchant_site_uid}/{module_uid}/{order_uid}/defaultAction
 * Payment:  .../handlers/payment/{merchant_site_uid}/{module_uid}/{order_uid}/queryRequest
 */
