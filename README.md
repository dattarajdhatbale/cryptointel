# CryptoIntel AI — Trading Dashboard

A modern, AI-powered cryptocurrency trading dashboard built with **React, Vite, and Tailwind CSS**.
This application provides real-time market insights, trade signals, and intelligent analysis to assist users in making informed trading decisions.

---

## Features

* Real-time market data visualization
* AI-powered trade analysis
* Smart notifications and alerts
* Interactive charts using Recharts
* Customizable settings panel
* Fast and lightweight (Vite-powered)
* Email alerts integration (EmailJS)

---

## Folder Structure

```
probstat/
│── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ChartView.tsx
│   │   ├── Settings.tsx
│   │   ├── Notifications.tsx
│   │   ├── TradeDisplay.tsx
│   │   └── TradeSignals.tsx
│   │
│   ├── context/
│   │   └── TradeContext.tsx
│   │
│   ├── hooks/
│   │   └── useBinanceData.ts
│   │
│   ├── utils/
│   │   ├── cn.ts
│   │   └── aiAnalysis.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
│── index.html
│── package.json
│── tsconfig.json
│── vite.config.ts
```

---

## Tech Stack

* **Frontend:** React 19 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Charts:** Recharts
* **State Management:** React Context API
* **API/Data:** Binance (via custom hook)
* **Email Service:** EmailJS

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd probstat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview build

```bash
npm run preview
```

---

## Core Architecture

* Component-based UI for modular design
* Custom Hooks (`useBinanceData`) for API abstraction
* Context API (`TradeContext`) for global state
* Utility layer (`aiAnalysis`) for intelligent insights

---

## Environment Setup (Email Alerts)

To enable email alerts using EmailJS:

1. Create an account on EmailJS
2. Configure your service, template, and public key
3. Add your credentials in the appropriate config file

Example:

```env
VITE_EMAILJS_PUBLIC_KEY=your_key
VITE_EMAILJS_SERVICE_ID=your_service
VITE_EMAILJS_TEMPLATE_ID=your_template
```

---

## Future Improvements

* Authentication system
* Backend integration for persistent data
* Advanced AI trading models
* Mobile responsiveness improvements
* Portfolio tracking

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

* Binance API for market data
* Recharts for visualization
* EmailJS for notifications

---

## Author

Built by me and my team for the General Championships Webathon problem statement solution.
