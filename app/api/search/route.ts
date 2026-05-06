export async function GET(request: Request) {
  const FINNHUB_KEY = "d5fp60pr01qnjhodo2n0d5fp60pr01qnjhodo2ng";
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toUpperCase() || "";
  const queryLower = query.toLowerCase();

  if (!query) return Response.json({ results: [] });

  const results: any[] = [];

  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${query}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.c && data.c > 0) {
      results.push({ id: queryLower, symbol: query, name: query, price: data.c, change: data.dp || 0, type: "stock" });
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.result?.length > 0) {
      for (const item of data.result.slice(0, 5)) {
        if (results.find((r: any) => r.symbol === item.symbol)) continue;
        try {
          const qr = await fetch(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${FINNHUB_KEY}`);
          const qd = await qr.json();
          if (qd.c && qd.c > 0) {
            results.push({ id: item.symbol.toLowerCase(), symbol: item.symbol, name: item.description || item.symbol, price: qd.c, change: qd.dp || 0, type: item.type === "ETP" ? "etf" : "stock" });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:${query}USDT&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.c && data.c > 0 && !results.find((r: any) => r.type === "crypto")) {
      results.push({ id: `${queryLower}-crypto`, symbol: query, name: `${query} (Crypto)`, price: data.c, change: data.dp || 0, type: "crypto" });
    }
  } catch (e) {}

  try {
    const sr = await fetch(`https://api.coingecko.com/api/v3/search?query=${queryLower}`);
    const sd = await sr.json();
    if (sd.coins?.length > 0) {
      for (const coin of sd.coins.slice(0, 4)) {
        if (results.find((r: any) => r.symbol.toLowerCase() === coin.symbol.toLowerCase())) continue;
        try {
          const pr = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`);
          const pd = await pr.json();
          if (pd[coin.id]?.usd) {
            results.push({ id: coin.id, symbol: coin.symbol.toUpperCase(), name: coin.name, price: pd[coin.id].usd, change: pd[coin.id].usd_24h_change || 0, type: "crypto" });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return Response.json({ results, query, sources: ["Finnhub", "CoinGecko"] });
}
