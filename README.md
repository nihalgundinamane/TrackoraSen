# TrackoraSen 🌸📺

> *Your personal anime tracker — beautifully designed, offline-first.*

A dual-theme anime tracking app built with React + React Router. Switch between **Sakura Dark** (deep pink glow on black) and **Retro Manga** (halftone dots, bold Bebas Neue type) with a single pill toggle in the navbar.

---

## ✨ Features

| Feature | Details |
|---|---|
| **5 Sections** | Next to Watch · Watching Now · Airing in Future · Watch Again · Completed |
| **Two Themes** | 🌸 Sakura Dark · 📺 Retro Manga — toggle persists in localStorage |
| **Season Cards** | Multi-season anime in one expandable card with per-season episode tracking |
| **Season Editor** | Add, rename, remove seasons directly from the edit modal |
| **Episode Tracker** | +/− buttons per season or flat ep count with live progress bar |
| **Rating System** | 1–10 pip picker, star display on cards, histogram on stats page |
| **Notes / Comments** | Per-anime text field shown as a quote on the card |
| **Genre Tags** | Comma-separated input with autocomplete suggestions |
| **Search** | Live search dropdown in navbar — click result to jump to entry |
| **Stats Dashboard** | Watch time, avg rating, genre breakdown, rating histogram, top rated |
| **Persistent Storage** | All data saved to `localStorage` — survives browser restarts |
| **Sort Options** | Title A–Z · Top Rated · Progress · Date Added per section |

---

## 🗂 Project Structure

```
trackorasen/
├── public/
│   ├── index.html              # HTML shell with favicon + Google Fonts
│   └── trackorasen-logo.png    # App logo / favicon
├── src/
│   ├── App.jsx                 # Root — BrowserRouter, routes, hooks
│   ├── index.js                # ReactDOM.createRoot entry point
│   ├── styles/
│   │   └── globals.css         # Theme tokens, reset, keyframes, shared components
│   ├── hooks/
│   │   ├── useAnimeStore.js    # All anime CRUD + localStorage persistence
│   │   └── useTheme.js         # Theme toggle (sakura / manga) + body class
│   ├── data/
│   │   └── initialData.js      # 291 seed entries (242 Next · 25 Airing · 24 Watch Again)
│   ├── utils/
│   │   └── helpers.js          # Progress, watch-time, sort, genre frequency, uid
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx      # Nav links, live search dropdown, pill theme toggle
│   │   │   └── Navbar.css
│   │   ├── AnimeCard/
│   │   │   ├── AnimeCard.jsx   # Card with seasons, progress bar, rating, ep ±
│   │   │   ├── AnimeCard.css
│   │   │   ├── SectionBlock.jsx  # Collapsible section with sort controls
│   │   │   └── SectionBlock.css
│   │   ├── Modal/
│   │   │   ├── EditModal.jsx   # Add/Edit modal — title, section, genres, seasons, rating
│   │   │   └── Modal.css
│   │   └── Petals/
│   │       ├── Petals.jsx      # Floating petal animation (Sakura theme only)
│   │       └── Petals.css
│   └── pages/
│       ├── Home/
│       │   ├── Home.jsx        # Landing page with hero + stat bubbles + feature cards
│       │   └── Home.css
│       ├── WatchList/
│       │   ├── WatchList.jsx   # All 5 sections rendered as SectionBlocks
│       │   └── WatchList.css
│       └── Stats/
│           ├── StatsPage.jsx   # Full stats: watch time, genres, histogram, top rated
│           └── StatsPage.css
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
# → Opens at http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output in /build — deploy to Render, Netlify, Vercel, or GitHub Pages
```

---

## 🌐 Deploying to Render (Static Site)

1. Push the repo to GitHub
2. On [render.com](https://render.com) → New → **Static Site**
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `build`
5. Deploy — your list is live!

> **Note:** All data is stored in the visitor's browser `localStorage`. Data persists across sessions on the same device/browser. Nothing is sent to any server.

---

## 📊 Seed Data (v2)

| Section | Count |
|---|---|
| Next to Watch | 242 |
| Airing in Future | 25 |
| Watch Again | 24 |
| **Total** | **291** |

The seed data loads only if `localStorage` is empty. After first load, all changes are saved there automatically.

---

## 🎨 Themes

### 🌸 Sakura Dark
- Background: deep obsidian `#0d0508`
- Accent: cherry blossom pink `#ff6fa0`
- Fonts: Cinzel Decorative (headings) · Noto Serif JP (body)
- Special effects: floating petal animation

### 📺 Retro Manga
- Background: parchment cream `#f0ebe0`
- Accent: ink black `#1a1208` with crimson `#cc2200`
- Fonts: Bebas Neue (headings) · Josefin Sans (body)
- Special effects: halftone dot overlay

---

## 🛠 Tech Stack

- **React 18** — UI
- **React Router 6** — Client-side routing
- **CSS Custom Properties** — Theme tokens
- **localStorage** — Persistence (no backend needed)
- **Google Fonts** — Cinzel Decorative, Noto Serif JP, Bebas Neue, Josefin Sans

---

*Made with 🌸 for anime fans everywhere.*
