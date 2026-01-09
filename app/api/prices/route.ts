export async function GET(request: Request) {
  const FINNHUB_KEY = "d5fp60pr01qnjhodo2n0d5fp60pr01qnjhodo2ng";
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "stocks";

  const assets: Record<string, string[]> = {
    stocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "NFLX"],
    etfs: ["SPY", "QQQ", "VTI", "VOO", "IWM", "BND", "GLD", "ARKK", "VGT", "SCHD"],
    crypto: ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "BINANCE:XRPUSDT", "BINANCE:DOGEUSDT", "BINANCE:ADAUSDT", "BINANCE:AVAXUSDT", "BINANCE:DOTUSDT", "BINANCE:MATICUSDT", "BINANCE:LINKUSDT"],
    bonds: ["BND", "AGG", "TLT", "LQD", "HYG", "MUB", "TIP", "SHY", "IEF", "EMB"],
    commodities: ["GLD", "SLV", "USO", "UNG", "DBA", "DBC"],
  };

  const symbolList = assets[category] || assets.stocks;

  try {
    const promises = symbolList.map(async (symbol) => {
      try {
        const isCrypto = symbol.includes(":");
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
        const data = await res.json();
        if (!data.c || data.c <= 0) return null;

        const displaySymbol = isCrypto ? symbol.split(":")[1].replace("USDT", "") : symbol;
        const id = displaySymbol.toLowerCase();
        const name = isCrypto ? getCryptoName(id) : getStockName(symbol);

        return { id, symbol: displaySymbol, name, price: data.c, change: data.dp || 0, type: category };
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(promises)).filter(Boolean);
    return Response.json({ assets: results, category });
  } catch {
    return Response.json({ error: "Failed", assets: [] }, { status: 500 });
  }
}

function getStockName(s: string): string {
  const n: Record<string, string> = { AAPL: "Apple", MSFT: "Microsoft", GOOGL: "Google", AMZN: "Amazon", NVDA: "NVIDIA", META: "Meta", TSLA: "Tesla", JPM: "JPMorgan", V: "Visa", NFLX: "Netflix", SPY: "S&P 500 ETF", QQQ: "Nasdaq 100", VTI: "Total Market", VOO: "S&P 500", IWM: "Russell 2000", BND: "Total Bond", GLD: "Gold", ARKK: "ARK Innovation", VGT: "Tech ETF", SCHD: "Dividend ETF", AGG: "Core Bond", TLT: "20Y Treasury", LQD: "Corp Bond", HYG: "High Yield", MUB: "Muni Bond", TIP: "TIPS", SHY: "Short Treasury", IEF: "7-10Y Treasury", EMB: "EM Bonds", SLV: "Silver", USO: "Oil", UNG: "Natural Gas", DBA: "Agriculture", DBC: "Commodities" };
  return n[s] || s;
}

function getCryptoName(s: string): string {
  const n: Record<string, string> = { btc: "Bitcoin", eth: "Ethereum", sol: "Solana", xrp: "XRP", doge: "Dogecoin", ada: "Cardano", avax: "Avalanche", dot: "Polkadot", matic: "Polygon", link: "Chainlink" };
  return n[s] || s.toUpperCase();
}