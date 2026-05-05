# 🐀 Rat Watch Taipei — 鼠患通報系統

A citizen science app for monitoring rat infestations, street cat colonies, and rodenticide poisoning in Taipei City. Built on the One Health framework.

## Features

| Tab | What it does |
|-----|-------------|
| 通報地圖 | Interactive map with 3 toggleable layers: rat incidents, cat colonies, poison drop sites |
| 事件通報 | Report live rats, dead rats, poisoned animals, nests, or environmental risk sites |
| 🐱 街貓登記 | Register cat colonies with individual identity, photos, TNR status, and caretaker info |
| ☣️ 投藥紀錄 | Log poison drop locations, time, source, drug appearance, and proximity to cat territory |
| 數據分析 | Charts: 7-day trend, cat vs rat correlation by district, drug→poison timeline, AI analysis |
| 通報記錄 | Filterable feed of all reports (by incident type + location type) |
| 防治知識 | Knowledge base: raptor data, risk site types, One Health principles |

## Running locally

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build
# Output goes to dist/
```

## Deploying

The `dist/` folder is a static site — deploy to:
- **Vercel**: `vercel --prod`
- **Netlify**: drag & drop `dist/` folder
- **GitHub Pages**: push `dist/` to `gh-pages` branch

## AI Analysis

The Stats tab uses the Anthropic API (Claude Sonnet) directly from the browser. In production, you should proxy this through a backend to protect your API key. Add to `.env`:

```
VITE_ANTHROPIC_KEY=sk-ant-...
```

Then update `StatsTab.jsx` to pass the key:
```js
headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY }
```

## Adding a real map

Replace the SVG district grid in `MapTab.jsx` with Google Maps or Mapbox:

```bash
npm install @react-google-maps/api
```

Then wrap the map container with `<GoogleMap>` and use `<Marker>` components for each report/cat/drug pin.

## Backend / persistence

To persist reports across sessions, connect to Supabase:

```bash
npm install @supabase/supabase-js
```

Replace the `useState` arrays in `App.jsx` with Supabase queries.

---

Data based on: 野灣野生動物保育協會 & 台灣猛禽研究會
