🌌 Asset Universe
Smart Budgeting Meets Investment Education

Live Website: asset-universe.vercel.app

📖 The Story
Most investment apps assume you already know two critical things:

How much you can afford to invest
How to invest it safely

But what if you're just starting out? What if you're a student managing monthly expenses, unsure whether you have $50 or $500 left after rent, groceries, and that weekend trip?
Asset Universe solves this by creating a complete financial journey in one platform:

First, figure out your financial reality.
Then, learn how to invest what you have—confidently and safely.

Built by Yash Kunal Mehta, a Computer Science & Finance student at Rutgers University, this app bridges the gap between budgeting and investing—turning financial confusion into financial clarity.

🚀 What Makes Asset Universe Different?
🎯 Budget-First Philosophy
Unlike traditional investment platforms that jump straight to portfolios, Asset Universe starts with a simple question:

"How much money do I actually have left this month?"

The integrated budget calculator tracks your income, expenses, and recurring transactions to show you—in real time—how much you can safely allocate to investments.
📚 Learn Before You Leap
Six comprehensive asset education modules teach you the fundamentals:

📈 Stocks — Equity ownership, growth potential, volatility
🏛️ Bonds — Fixed income, stability, interest rates
📊 ETFs — Diversification, low fees, passive investing
💎 Cryptocurrency — Digital assets, blockchain, high risk/reward
🛢️ Commodities — Gold, oil, inflation hedging
🏠 Real Estate — Property investment, REITs, tangible assets

Each module breaks down risk, return expectations, liquidity, and real-world use cases.
🎮 Real Market Simulation (No Shortcuts)
The simulator uses real-time market data from Finnhub, CoinGecko, and Alpha Vantage APIs. But here's the twist:
There's no fast-forward button.
You can't skip ahead to see if your portfolio grew. You have to wait—just like real investing. This forces users to experience actual market volatility, emotional discipline, and long-term thinking.
🧠 Unified Risk Scoring (1–10)
Every asset gets a risk score from 1 (ultra-safe bonds) to 10 (volatile crypto). Your portfolio gets an overall risk score, and the app suggests adjustments based on your risk profile quiz results.
🔍 Universal Asset Search
Search for any asset worldwide:

Stocks (AAPL, TSLA, NVDA)
Cryptocurrencies (BTC, ETH, SOL)
ETFs (SPY, QQQ, VOO)
Commodities (Gold, Oil, Silver)
Real Estate (REITs)

All with live pricing and historical data.

✨ Key Features
FeatureDescription💰 Budget CalculatorTrack income, expenses, and recurring transactions. Know exactly how much you can invest.📚 Asset EducationLearn about 6 asset classes with real-world examples, risk profiles, and historical context.📈 Live SimulatorPractice investing with real market prices. No fake money psychology—just authentic learning.🎯 My PortfolioTrack your simulated investments, see performance metrics, and monitor your risk exposure.🧩 Risk Profile QuizDiscover your risk tolerance and get personalized investment suggestions.🔍 Universal SearchFind any asset (stocks, crypto, ETFs, commodities, REITs) with instant price data.💾 Local PersistenceYour data saves automatically to your browser. No sign-up required.📱 Responsive DesignWorks seamlessly on desktop, tablet, and mobile.

🛠️ Tech Stack
Asset Universe is built with modern, production-grade technologies:

Frontend: Next.js 15 (App Router) + React 19
Language: TypeScript (98.9% type-safe)
Styling: Tailwind CSS (utility-first, responsive)
State Management: React Hooks + LocalStorage
APIs:

Finnhub — Stock prices, company data
CoinGecko — Cryptocurrency prices
Alpha Vantage — Commodities, ETFs, historical data


Deployment: Vercel (Edge Network, auto-deploy from Git)
Version Control: Git + GitHub


📸 Screenshots
🏠 Landing Page
Clean, professional introduction to the platform with clear call-to-action.
💰 Budget Calculator
Track every dollar—income, expenses, savings—and know your investable amount instantly.
📚 Learn Module
Deep dives into each asset class with historical context, risk analysis, and real examples.
📈 Simulator
Practice investing with real prices. Watch your portfolio grow (or shrink) based on actual market movements.
🎯 My Portfolio
Visual dashboard showing your holdings, performance, and overall risk score.

🚀 Getting Started
Prerequisites

Node.js 18+ and npm/yarn/pnpm installed
API keys (free tier available):

Finnhub API Key
CoinGecko API (optional, but recommended for crypto)
Alpha Vantage API Key



Installation
bash# Clone the repository
git clone https://github.com/Yash-Mehtaa/Asset-Universe.git

# Navigate to the project directory
cd Asset-Universe

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
Environment Variables
Create a .env.local file in the root directory:
envNEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key_here
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_key_here
NEXT_PUBLIC_ALPHAVANTAGE_API_KEY=your_alphavantage_key_here
Run Development Server
bashnpm run dev
# or
yarn dev
# or
pnpm dev
Open http://localhost:3000 in your browser to see the app running locally.
Build for Production
bashnpm run build
npm start

📂 Project Structure
asset-universe/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Landing page
│   ├── budget/              # Budget calculator module
│   ├── learn/               # Asset education module
│   ├── simulator/           # Investment simulator
│   ├── portfolio/           # Portfolio dashboard
│   └── profile/             # Risk profile quiz
├── components/              # Reusable React components
├── public/                  # Static assets (images, icons)
├── styles/                  # Global styles
├── utils/                   # Helper functions, API calls
├── types/                   # TypeScript type definitions
└── README.md                # You are here

🎓 Educational Philosophy
Asset Universe is designed with three core principles:
1. Reality First
No unrealistic 1000% returns. Just honest education using real market data and historical patterns.
2. Time as a Teacher
The inability to fast-forward in the simulator isn't a bug—it's a feature. Real investing requires patience, and Asset Universe teaches that from day one.
3. Risk Awareness
Every asset, every portfolio, every decision is framed through the lens of risk. Because understanding risk is the foundation of smart investing.

🤝 Contributing
Contributions are welcome! Here's how you can help:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Ideas for Contributions:

Add support for more asset types (options, futures, international markets)
Integrate news sentiment analysis
Build a mobile app (React Native)
Add social features (leaderboards, shared portfolios)
Expand educational content (video tutorials, interactive quizzes)
Implement user authentication and cloud sync


⚠️ Disclaimer
Asset Universe is an educational platform only. It is not a registered investment advisor.

Market data is for educational purposes and may be delayed or inaccurate.
Simulated portfolios do not reflect real investment performance.
Do your own research before making any real investment decisions.
Past performance does not guarantee future results.
Consult with a licensed financial advisor before investing real money.


🙏 Acknowledgments

Market Data:

Finnhub.io — Stock and company data
CoinGecko — Cryptocurrency prices
Alpha Vantage — Commodities and ETF data


Design Inspiration: Minimalist finance apps like Mint, Robinhood, and Personal Capital
Philosophy: Inspired by The Intelligent Investor by Benjamin Graham and A Random Walk Down Wall Street by Burton Malkiel


💬 Connect
Built by Yash Kunal Mehta
Computer Science & Finance Student @ Rutgers University–New Brunswick

GitHub: @Yash-Mehtaa
LinkedIn: https://www.linkedin.com/in/yash-kunal-mehta-182aa4331/
Email: ym70134@gmail.com


🌟 Star This Repo!
If Asset Universe helped you understand investing better, give it a ⭐️ on GitHub!
Live Demo: asset-universe.vercel.app

<div align="center">
Built with ❤️ and ☕ by a student who believes financial literacy should be accessible to everyone.
</div>
