# StyleSync — Intelligent Design System Extraction Tool

A powerful, full-stack web application designed to automatically extract, visualize, and manage design tokens from any live website. Built as a comprehensive tool for designers and developers to instantly analyze websites and export their underlying design language into reusable code.

🔗 **GitHub Repository**: [nithin-2707/StyleSync](https://github.com/nithin-2707/StyleSync)

**Next.js • TypeScript • Tailwind CSS • Prisma • GSAP • Framer Motion**

---

## 🌟 Features

- **Automated Token Extraction** — Scrapes live URLs to extract colors, typography, and spacing variables using intelligent DOM analysis.
- **Real-Time Token Visualization** — Immediately preview extracted tokens applied to functional UI components like buttons and inputs.
- **Advanced Token Editor** — Modify extracted tokens in real-time, with the ability to "lock" specific tokens against future rescrapes.
- **Multi-Format Export** — Instantly export your tailored design system directly to `CSS Variables`, `JSON`, or `tailwind.config.js` formats.
- **Version History Tracking** — View historical changes to individual tokens and revert modifications using the built-in time machine.
- **Premium Glassmorphic UI** — Immersive, cosmic-themed aesthetic featuring smooth GSAP navigational structures and Framer Motion micro-interactions.
- **Robust Fallback Engine** — Gracefully handles both JavaScript-heavy sites via Playwright and standard Server-Side websites via intelligent CSS parsing.

---

## 📄 Core Architecture

| Module | Description |
| :--- | :--- |
| **API Scraper (`api/scrape`)** | Next.js API route that initiates dual-layer DOM scraping (Playwright/Cheerio) to fetch raw design signals. |
| **Token Normalizer (`lib/tokens`)** | Algorithmic normalization engine that translates raw scraped web tokens into cohesive semantic mappings (e.g., Primary, Text, Borders). |
| **Zustand Store (`store/`)** | Manages real-time application state synchronization between the Token Editor, the Visualizer, and the Database. |
| **Export Engine (`api/export`)** | Dynamically generates downloadable configurations (CSS/Tailwind/JSON) from the actively managed database state. |

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Vanilla CSS Variables |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **State Management** | Zustand |
| **Animations** | GSAP, Framer Motion |
| **Scraping Engine** | Playwright, Cheerio, Color.js, Chroma.js |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A PostgreSQL Database URL (e.g. Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/nithin-2707/StyleSync.git

# Navigate to project directory
cd StyleSync

# Install dependencies
npm install

# Set up your Environment Variables by creating a .env file
# DATABASE_URL=postgresql://user:password@domain:port/db
# DIRECT_URL=postgresql://user:password@domain:port/db (if using connection pooling)

# Push the Prisma schema to your database
npx prisma db push

# Run development server
npm run dev
```

Open `http://localhost:3000` in your browser to begin analyzing websites!

---

## 📁 Project Structure

```text
├── prisma/
│   └── schema.prisma         # Postgres database schema
├── src/
│   ├── app/
│   │   ├── api/              # Core API Routes (Scrape, Export, Tokens)
│   │   ├── analyzing/        # Loading transition page
│   │   ├── dashboard/        # Main token visualizer & editor interface
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── layout/           # GSAP CardNav and Rail configurations
│   │   ├── preview/          # Live UI specimen components (Buttons, Cards)
│   │   └── token-editor/     # Token modification interface and color pickers
│   ├── lib/
│   │   ├── scraper/          # Cheerio & Playwright dual DOM extraction engines
│   │   └── tokens/           # Algorithmic token normalization and compiling
│   ├── store/                # Zustand state management
│   └── types/                # Strict TypeScript definitions
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🎨 System Concept

Unlike generic screenshot tools, StyleSync actively injects itself into a website's stylesheet structure, determining the hierarchy of colors based on DOM presence, contrast ratios, and strict CSS tracking. Extracted elements are automatically mapped into functional design tokens ready for drop-in deployment directly into a new application.

---

## 👨‍💻 Author

**Gandrathi Nithin**

- GitHub: [@nithin-2707](https://github.com/nithin-2707)

*This project is open-source and intended to accelerate frontend workflows.*
