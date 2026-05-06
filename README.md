# Asset Universe

An educational investment simulator that lets you learn investing without risking real money. Practice with near real-time market data, understand every asset class, and watch autonomous AI investors operate transparently.

**Live:** [asset-universe.vercel.app](https://asset-universe.vercel.app)

---

## What it does

- **Budget calculator** — figure out how much you can safely invest each month
- **Asset library** — every major asset class explained honestly (stocks, ETFs, bonds, crypto, commodities)
- **Investment simulator** — buy and sell with unlimited simulated capital and real market prices
- **Portfolio tracker** — track your simulated performance over time
- **AI investors** — three autonomous agents trading on real quant strategies, reviewing their own performance, and adapting over time

---

## System architecture

```
User Browser (Next.js frontend)
        │
        ▼
Next.js API Routes  (/api/search, /api/prices)
  ├── In-memory cache (45-second TTL)
  └── Rate limiting protection
        │
        ▼
External Market Data APIs
  ├── Finnhub        → US stocks, ETFs, forex (real-time)
  ├── CoinGecko      → Crypto prices (real-time)
  └── CoinPaprika    → Crypto backup (real-time)

AI Backend (Python FastAPI on Railway)
  ├── APScheduler    → Scheduled trade + review cycles
  ├── SQLite         → Agent portfolios, trades, decisions
  ├── Anthropic Claude API → Strategy self-review
  └── Public REST API → /api/agents, /api/agents/{id}/trades, etc.
```

API keys are never exposed to the browser. All external calls go through Next.js API routes on the server side.

---

## Market data

- **US stocks and ETFs:** Real-time or near real-time quotes via Finnhub (free tier, 60 calls/minute)
- **Crypto:** Real-time prices via CoinGecko and CoinPaprika
- **International markets:** May be delayed up to 15 minutes
- **Caching:** API responses cached in-memory for 45 seconds to prevent rate limit abuse

*Prices are for educational simulation only. Market data provided by Finnhub, CoinGecko, and CoinPaprika. Data may be delayed. Not suitable for real trading decisions.*

---

## AI investors

Three autonomous agents, each with $10,000 of simulated capital:

| Agent | Strategy | Trades | Reviews |
|-------|----------|--------|---------|
| Short-term | Momentum (Jegadeesh-Titman) | Every 30 min, market hours | Weekly |
| Mid-term | Trend following (MA crossover) | Daily after close | Monthly |
| Long-term | Risk parity (inverse-vol) | Weekly rebalance | Quarterly |

At each review, the Anthropic Claude API receives the agent's recent performance history (returns, drawdown, Sharpe, trade log) and returns a structured JSON decision: keep, tune parameters, switch strategy template, or blend. Changes are validated against guardrails (max 30% parameter change per cycle) and logged publicly.

Emergency review triggers at 15% drawdown regardless of schedule.

---

## Tech stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Custom CSS (no component library)

**AI backend**
- Python 3.11 / FastAPI
- SQLAlchemy + SQLite
- APScheduler
- Anthropic Claude API (claude-opus)
- Railway (deployment)

**Market data**
- Finnhub (stocks, ETFs)
- CoinGecko (crypto)
- CoinPaprika (crypto backup)

---

## Running locally

**Frontend:**
```bash
cd asset-universe
npm install
npm run dev
```

**AI backend:**
```bash
cd asset-universe-ai
cp .env.example .env  # fill in API keys
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.bootstrap
python -m app.run_once trade short_term   # test one cycle
uvicorn app.main:app --reload
```

---

## Disclaimer

Asset Universe is for educational purposes only. No real money is ever traded. This is not financial, investment, tax, or legal advice. Market data may be delayed. Past performance of the AI agents does not guarantee future results. Always consult a qualified financial advisor before making real investment decisions.

Market data attribution: [Finnhub](https://finnhub.io) · [CoinGecko](https://coingecko.com) · [CoinPaprika](https://coinpaprika.com)
