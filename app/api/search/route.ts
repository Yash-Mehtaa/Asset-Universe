// In-memory cache — persists for the lifetime of the server process
// Resets on redeploy (fine for free tier, prevents rate limit abuse)
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 45 * 1000; // 45 seconds

function cached(key: string): any | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
}

async function fetchWithCache(url: string): Promise<any> {
  const hit = cached(url);
  if (hit) return hit;
  const res = await fetch(url);
  const data = await res.json();
  setCache(url, data);
  return data;
}

export async function GET(request: Request) {
  const FINNHUB_KEY = "d5fp60pr01qnjhodo2n0d5fp60pr01qnjhodo2ng";
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toUpperCase() || "";
  const queryLower = query.toLowerCase();

  if (!query) return Response.json({ results: [], lastUpdated: null });

  // Check full-query cache first
  const queryCacheKey = `query:${query}`;
  const queryCached = cached(queryCacheKey);
  if (queryCached) {
    return Response.json({ ...queryCached, fromCache: true });
  }

  const results: any[] = [];
  const fetchedAt = new Date().toISOString();

  // 1. Finnhub — direct quote
  try {
    const data = await fetchWithCache(
      `https://finnhub.io/api/v1/quote?symbol=${query}&token=${FINNHUB_KEY}`
    );
    if (data.c && data.c > 0) {
      results.push({
        id: queryLower, symbol: query, name: query,
        price: data.c, change: data.dp || 0, type: "stock",
        fetchedAt,
      });
    }
  } catch {}

  // 2. Finnhub — symbol search
  try {
    const data = await fetchWithCache(
      `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_KEY}`
    );
    if (data.result?.length > 0) {
      for (const item of data.result.slice(0, 5)) {
        if (results.find((r: any) => r.symbol === item.symbol)) continue;
        try {
          const qd = await fetchWithCache(
            `https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${FINNHUB_KEY}`
          );
          if (qd.c && qd.c > 0) {
            results.push({
              id: item.symbol.toLowerCase(),
              symbol: item.symbol,
              name: item.description || item.symbol,
              price: qd.c, change: qd.dp || 0,
              type: item.type === "ETP" ? "etf" : "stock",
              fetchedAt,
            });
          }
        } catch {}
      }
    }
  } catch {}

  // 3. Finnhub — crypto via Binance
  try {
    const data = await fetchWithCache(
      `https://finnhub.io/api/v1/quote?symbol=BINANCE:${query}USDT&token=${FINNHUB_KEY}`
    );
    if (data.c && data.c > 0 && !results.find((r: any) => r.type === "crypto")) {
      results.push({
        id: `${queryLower}-crypto`, symbol: query,
        name: `${query} (Crypto)`, price: data.c, change: data.dp || 0,
        type: "crypto", fetchedAt,
      });
    }
  } catch {}

  // 4. CoinGecko — crypto search
  try {
    const sd = await fetchWithCache(
      `https://api.coingecko.com/api/v3/search?query=${queryLower}`
    );
    if (sd.coins?.length > 0) {
      for (const coin of sd.coins.slice(0, 4)) {
        if (results.find((r: any) => r.symbol.toLowerCase() === coin.symbol.toLowerCase())) continue;
        try {
          const pd = await fetchWithCache(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
          );
          if (pd[coin.id]?.usd) {
            results.push({
              id: coin.id, symbol: coin.symbol.toUpperCase(), name: coin.name,
              price: pd[coin.id].usd, change: pd[coin.id].usd_24h_change || 0,
              type: "crypto", fetchedAt,
            });
          }
        } catch {}
      }
    }
  } catch {}

  // 5. CoinPaprika — backup crypto
  if (!results.find((r: any) => r.type === "crypto")) {
    try {
      const data = await fetchWithCache(
        `https://api.coinpaprika.com/v1/search?q=${queryLower}&limit=5`
      );
      if (data.currencies?.length > 0) {
        for (const coin of data.currencies.slice(0, 3)) {
          try {
            const ticker = await fetchWithCache(
              `https://api.coinpaprika.com/v1/tickers/${coin.id}`
            );
            if (ticker.quotes?.USD?.price) {
              results.push({
                id: coin.id, symbol: coin.symbol, name: coin.name,
                price: ticker.quotes.USD.price,
                change: ticker.quotes.USD.percent_change_24h || 0,
                type: "crypto", fetchedAt,
              });
            }
          } catch {}
        }
      }
    } catch {}
  }

  const response = {
    results,
    query,
    fetchedAt,
    sources: ["Finnhub", "CoinGecko", "CoinPaprika"],
    note: "Prices are real-time or near real-time for US markets. International markets may be delayed up to 15 minutes.",
  };

  // Cache the full query result
  setCache(queryCacheKey, response);

  return Response.json(response);
}
