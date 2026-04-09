# StyleSync 🌌

Transform any website into an interactive, living design system. StyleSync scans any URL to extract custom color palettes, typography scales, and spacing heuristics, and then compiles them instantly into an interactive, Figma-style token dashboard where you can edit, lock, and preview your components in real-time.

**Built by Nithin Gandrathi**

---

## ⚡ Features

- **Live CSS Computed Property Extraction**: Uses Playwright to meticulously pull live DOM styles, supporting SSR, modern SPAs, and static websites.
- **Deep Image Extraction**: Pulls dominant semantic colors natively from hero images and page assets.
- **Intuitive Token Dashboard**: High-end glassmorphic interactive editor to adjust colors, spacing thresholds, and typographics in real-time.
- **Real-Time Live Previews**: See every tweak instantly reflected on a production-ready component suite (cards, buttons, inputs).
- **Time Machine Memory**: Version history database that safely logs and allows roll-backs of any change you make.
- **Persistent Locking System**: Once you configure a perfect aesthetic, freeze it! Locked tokens seamlessly ignore future re-scrapes.

## 🛠 Tech Stack

- **Frontend Core:** Next.js 14, React, Tailwind CSS 
- **Animations:** GSAP & Framer Motion
- **State Management:** Zustand
- **Database Architecture:** Prisma ORM over PostgreSQL (Supabase)
- **Extraction Engine:** Playwright headless architecture

---

## 🚀 Deployment Guide

This project is a Next.js full-stack Monolith, meaning **both the frontend and backend API endpoints can be deployed seamlessly to Vercel**. 

### Deploying to Vercel (Recommended)
1. Push your code to a GitHub repository (e.g. `nithin-2707/StyleSync`).
2. Log into [Vercel](https://vercel.com/) and create a new project from your GitHub repository.
3. Vercel will automatically detect the **Next.js** framework.
4. Set the following environment variables during setup:
   - `DATABASE_URL` (Your Supabase PostgreSQL Transaction pooler string)
   - `DIRECT_URL` (Your Supabase PostgreSQL Session connection string)
5. **Click Deploy**. Vercel will build the frontend pages and securely deploy the `/api/scrape/route.ts` as edge/serverless functions.

### Important Note Regarding the Scraper
Since Vercel serverless functions have a 50MB size limit, the standard Playwright Chromium binary might fail to bundle in production. If you encounter issues during actual execution on Vercel, simply swap `playwright` with `@sparticuz/chromium` (which is specifically engineered for AWS Lambda / Vercel compatibility), or use a third-party scraping API (like Browserless.io) inside the API route.

---

*Handcrafted by Nithin Gandrathi*
