# 📊 StockLens AI Vision - Complete Project Guide

> **AI-Powered Stock Market Analysis and Investment Advisor**

A web-based Human–Computer Interaction (HCI) project that helps users analyze and understand the stock market through AI-powered analysis, real-time stock data, and interactive visualizations.

🔗 **Live Demo:** [https://stocklens-ai-vision.netlify.app/](https://stocklens-ai-vision.netlify.app/)

---

## 📁 Project Structure

```
stocklens-ai-vision-main/
├── src/                          # Main source code
│   ├── components/               # React components
│   │   ├── ui/                   # 49 reusable UI components (shadcn/ui)
│   │   ├── AIChat.tsx            # AI chat interface
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── Onboarding.tsx        # User onboarding flow
│   │   ├── StockComparison.tsx   # Compare stocks feature
│   │   ├── StockSelector.tsx     # Stock selection component
│   │   └── ...
│   ├── pages/                    # Application pages
│   │   ├── Landing.tsx           # Home/landing page
│   │   ├── Auth.tsx              # Authentication page
│   │   ├── Stocks.tsx            # Stock listings
│   │   ├── Analysis.tsx          # Stock analysis page
│   │   ├── Portfolio.tsx         # User portfolio
│   │   ├── Screener.tsx          # Stock screener
│   │   ├── Profile.tsx           # User profile
│   │   ├── Comparison.tsx        # Stock comparison
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React contexts
│   ├── integrations/             # Third-party integrations
│   ├── lib/                      # Utility libraries
│   ├── utils/                    # Helper utilities
│   ├── App.tsx                   # Main app component with routing
│   └── main.tsx                  # App entry point
├── supabase/                     # Backend services
│   ├── functions/                # Edge functions
│   │   ├── fetch-stock-data/     # Fetch real-time stock data
│   │   ├── fetch-historical-data/# Historical stock data
│   │   ├── stock-ai-prediction/  # AI predictions
│   │   ├── stock-chat/           # AI chat functionality
│   │   └── voice-to-text/        # Voice input processing
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── .env                          # Environment variables
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite configuration
├── tailwind.config.ts            # Tailwind CSS config
└── netlify.toml                  # Netlify deployment config
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **UI Components** | shadcn/ui (Radix UI) |
| **State Management** | TanStack React Query |
| **Routing** | React Router DOM 6 |
| **Charts** | Recharts |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Authentication** | Supabase Auth |
| **Deployment** | Netlify |

---

## 🚀 How to Run the Project

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **bun** package manager
- **Git**
- **Supabase account** (for backend services)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Momin-786/stocklens-ai-vision-main.git
cd stocklens-ai-vision-main
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster)
bun install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory (or use the existing one):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

> ⚠️ **Note:** The project already has a `.env` file with Supabase credentials configured.

### Step 4: Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:8080**

### Step 5: Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` folder.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔐 Application Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/auth` | Login/Signup | No |
| `/auth/callback` | OAuth callback handler | No |
| `/stocks` | Stock listings & market data | ✅ Yes |
| `/screener` | Stock screening tool | ✅ Yes |
| `/analysis` | AI-powered stock analysis | ✅ Yes |
| `/comparison` | Compare multiple stocks | ✅ Yes |
| `/portfolio` | User portfolio management | ✅ Yes |
| `/profile` | User profile settings | ✅ Yes |

---

## ✨ Key Features

1. **🏠 Interactive Dashboard** - Top and trending stocks display
2. **🔍 Search & Filter** - Filter by name, category, time period
3. **🤖 AI Predictions** - Buy/Hold/Sell recommendations
4. **📈 Graphical Charts** - Live stock data visualization using Recharts
5. **💬 AI Chat Assistant** - Interactive AI chat for stock queries
6. **📊 Stock Comparison** - Compare multiple stocks side-by-side
7. **💼 Portfolio Tracking** - Manage your stock portfolio
8. **🎯 Stock Screener** - Filter stocks by various criteria
9. **🎤 Voice Input** - Voice-to-text functionality
10. **📱 Responsive Design** - Works on desktop and mobile

---

## 🗄️ Supabase Edge Functions

The backend is powered by Supabase Edge Functions:

| Function | Purpose |
|----------|---------|
| `fetch-stock-data` | Fetch real-time stock market data |
| `fetch-historical-data` | Get historical stock prices |
| `stock-ai-prediction` | Generate AI predictions for stocks |
| `stock-chat` | Handle AI chat conversations |
| `voice-to-text` | Convert voice input to text |

---

## 🎨 Design System

The app follows HCI design principles:

- **Primary Color:** Blue (#2563EB) - Trust & professionalism
- **Secondary Color:** Green (#10B981) - Growth & positivity
- **Background:** Light gray/white for clarity
- **Typography:** Clean, readable fonts
- **Accessibility:** Large buttons, clear labels

---

## 📝 Database Migrations

Apply database migrations using:

```bash
# View migration SQL
cat APPLY_ALL_MIGRATIONS.sql
```

Or apply via Supabase dashboard using the SQL in `supabase/migrations/`.

---

## 🌐 Deployment

### Netlify Deployment

The project is configured for Netlify deployment via `netlify.toml`:

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

See `NETLIFY_DEPLOYMENT.md` for detailed instructions.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Authors

- **Abdul Momin** - Developer
- **Mutyyab** - Developer & Analyst

---

## 🔗 Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Run the app
npm run dev

# 3. Open in browser
# http://localhost:8080
```

**That's it! You're ready to explore StockLens AI Vision! 🚀**
