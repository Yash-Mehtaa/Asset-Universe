export async function GET(request: Request) {
  const FINNHUB_KEY = "d5fp60pr01qnjhodo2n0d5fp60pr01qnjhodo2ng";
  const ALPHA_KEY = "28V1KWQCGQHOYN64";
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toUpperCase() || "";
  const queryLower = query.toLowerCase();

  if (!query) {
    return Response.json({ results: [] });
  }

  const results: any[] = [];

  // 1. Finnhub - US Stocks
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${query}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.c && data.c > 0) {
      results.push({ id: queryLower, symbol: query, name: `${query} (Stock)`, price: data.c, change: data.dp || 0, type: "stock" });
    }
  } catch (e) {}

  // 2. Finnhub - Crypto via Binance
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:${query}USDT&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.c && data.c > 0 && !results.find(r => r.type === "crypto")) {
      results.push({ id: `${queryLower}-crypto`, symbol: query, name: `${query} (Crypto)`, price: data.c, change: data.dp || 0, type: "crypto" });
    }
  } catch (e) {}

  // 3. CoinGecko - All Crypto (memecoins, small caps, everything)
  try {
    const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${queryLower}`);
    const searchData = await searchRes.json();
    if (searchData.coins?.length > 0) {
      for (const coin of searchData.coins.slice(0, 5)) {
        if (results.find(r => r.symbol.toLowerCase() === coin.symbol.toLowerCase())) continue;
        try {
          const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`);
          const priceData = await priceRes.json();
          if (priceData[coin.id]?.usd) {
            results.push({ id: coin.id, symbol: coin.symbol.toUpperCase(), name: coin.name, price: priceData[coin.id].usd, change: priceData[coin.id].usd_24h_change || 0, type: "crypto" });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 4. CoinPaprika - Backup crypto source
  if (!results.find(r => r.type === "crypto")) {
    try {
      const res = await fetch(`https://api.coinpaprika.com/v1/search?q=${queryLower}&limit=5`);
      const data = await res.json();
      if (data.currencies?.length > 0) {
        for (const coin of data.currencies.slice(0, 3)) {
          try {
            const tickerRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${coin.id}`);
            const ticker = await tickerRes.json();
            if (ticker.quotes?.USD?.price) {
              results.push({ id: coin.id, symbol: coin.symbol, name: coin.name, price: ticker.quotes.USD.price, change: ticker.quotes.USD.percent_change_24h || 0, type: "crypto" });
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // 5. Alpha Vantage - Global stocks backup
  if (!results.find(r => r.type === "stock")) {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${query}&apikey=${ALPHA_KEY}`);
      const data = await res.json();
      if (data["Global Quote"]?.["05. price"]) {
        const price = parseFloat(data["Global Quote"]["05. price"]);
        const change = parseFloat(data["Global Quote"]["10. change percent"]?.replace("%", "")) || 0;
        results.push({ id: `${queryLower}-av`, symbol: query, name: `${query} (Stock)`, price, change, type: "stock" });
      }
    } catch (e) {}
  }

  // 6. Alpha Vantage - Symbol search for suggestions
  try {
    const res = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_KEY}`);
    const data = await res.json();
    if (data.bestMatches?.length > 0) {
      for (const match of data.bestMatches.slice(0, 3)) {
        const sym = match["1. symbol"];
        if (results.find(r => r.symbol === sym)) continue;
        try {
          const quoteRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${ALPHA_KEY}`);
          const quoteData = await quoteRes.json();
          if (quoteData["Global Quote"]?.["05. price"]) {
            const price = parseFloat(quoteData["Global Quote"]["05. price"]);
            const change = parseFloat(quoteData["Global Quote"]["10. change percent"]?.replace("%", "")) || 0;
            results.push({ id: sym.toLowerCase(), symbol: sym, name: match["2. name"] || sym, price, change, type: match["3. type"]?.includes("ETF") ? "etf" : "stock" });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 7. Finnhub symbol search
  try {
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.result?.length > 0) {
      for (const item of data.result.slice(0, 3)) {
        if (results.find(r => r.symbol === item.symbol)) continue;
        try {
          const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${FINNHUB_KEY}`);
          const quoteData = await quoteRes.json();
          if (quoteData.c && quoteData.c > 0) {
            results.push({ id: item.symbol.toLowerCase(), symbol: item.symbol, name: item.description || item.symbol, price: quoteData.c, change: quoteData.dp || 0, type: "stock" });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  return Response.json({ results, query, sources: ["Finnhub", "CoinGecko", "CoinPaprika", "AlphaVantage"] });
}