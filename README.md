<h1 align="center">
    <img alt="project" title="#About" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="120px"/>
</h1>

<h1 align="center">
  <a href="#"> StockLens – AI-Powered Stock Market Analysis and Investment Advisor </a>
</h1>

<h3 align="center">A stock prediction web app built with React and AI integration</h3>

<p align="center">

  <img alt="Stars" src="https://img.shields.io/github/stars/Momin-786/stocklens-ai-vision-main?style=social">
  
  <a href="https://github.com/Momin-786/stocklens-ai-vision-main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Momin-786/stocklens-ai-vision-main">
  </a>
    
  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">

  <a href="https://github.com/Momin-786">
    <img alt="Momin" src="https://img.shields.io/badge/made%20by-Your%20Team-blue">
  </a>
</p>

<h4 align="center"> 
	 Status: In Progress
</h4>

<p align="center">
 <a href="#about">About</a> •
 <a href="#features">Features</a> •
 <a href="#how-it-works">How it works</a> • 
 <a href="#tech-stack">Tech Stack</a> •  
 <a href="#author">Author</a> • 
 <a href="#license">License</a>
</p>

---

## 🧠 About

**StockLens** is a web-based **Human–Computer Interaction (HCI)** project that helps users analyze and understand the stock market through a **simple, interactive, and visually guided interface**.  
It combines **AI-powered analysis**, **real-time stock data**, and **HCI design principles** to provide users with predictions for **buying, holding, or selling** stocks.

This application is **not for real trading**, but rather a **mock analytical platform** for educational and decision-support purposes.

🔗 **Live Demo:** [https://stocklens-ai-vision-main.vercel.app/](https://stocklens-ai-vision-main.vercel.app/)

---

## 🚀 Features

- [x] **Interactive Dashboard** displaying top and trending stocks  
- [x] **Search & Filter** functionality by name, category, and time period  
- [x] **AI-Powered Predictions** (Buy / Hold / Sell suggestions)  
- [x] **Graphical Visualization** of live stock data  
- [x] **User-Friendly Interface** following HCI usability rules  
- [x] **Responsive Design** suitable for desktop and mobile users  

---

## ⚙️ How it works

The project focuses on front-end interaction and design usability.  
Users can view, analyze, and receive AI insights on selected stocks in real-time.

### Pre-requisites

Before you begin, make sure you have the following installed:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- Code editor like [VS Code](https://code.visualstudio.com/)

#### Running the Web Application (Frontend)

```bash
# Clone this repository
$ git clone https://github.com/yourusername/stocklens.git

# Access the project folder
$ cd stocklens

# Install dependencies
$ npm install

# Set up environment variables
# Copy .env.example to .env.local and fill in your Supabase credentials
$ cp .env.example .env.local

# Run the app
$ npm run dev

# The app will open at http://localhost:8080
```

#### Environment Variables

Create a `.env.local` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SITE_URL=http://localhost:8080
```

#### Deploying to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions, including how to fix Supabase authentication errors.

---

## 💻 Tech Stack

**Platform:** [React.js](https://reactjs.org/) + [TypeScript]()

#### **Libraries & Tools**

* **React Router Dom** – Navigation
* **Axios** – API communication
* **Chart.js / Recharts** – Graph visualizations
* **Bootstrap / Tailwind CSS** – Styling
* **Framer Motion** – Animations
* **Lucide Icons / React Icons** – Icons
* **Moment.js** – Date formatting
* **Vercel** – Deployment

> See dependencies in `package.json`

---

## 🧠 HCI Design Principles Applied

* **Simplicity:** Minimal and clear interface.
* **Consistency:** Same color palette and layout across pages.
* **Feedback:** Real-time data updates after user actions.
* **Accessibility:** Large buttons, clear labels, and readable font sizes.
* **Color Scheme:**

  * Primary: Blue (#2563EB) – trust and professionalism
  * Secondary: Green (#10B981) – growth and positivity
  * Background: Light gray/white for clarity

---

## 👥 Author

<a href="#">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/128892619?v=4" width="80px;" alt="Author"/>
 <br />
 <p><b>Abdul Momin</b></p></a>

**Team Member:**
👨‍💻 **Mutyyab** – Developer & Analyst

---

## 📜 License

This project is licensed under the **MIT License**.
See the file [LICENSE](./LICENSE) for details.

---

## ❤️ Made With

Built with **React** and designed with a focus on **HCI principles** for usability, clarity, and interactive learning.

---

## 📘 Learn More

This project was created with [Create React App](https://github.com/facebook/create-react-app).
To learn React, visit the [React documentation](https://reactjs.org/).


```
