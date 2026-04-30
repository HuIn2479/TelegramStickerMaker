# Telegram Sticker Maker

Create and upload Telegram stickers from images and videos.

## Features

- **Static Sticker Conversion** — PNG/WEBP/JPG to 512×512 stickers (PNG + WEBP output)
- **Animated Sticker Conversion** — GIF/MP4/WEBM to WEBM VP9 via client-side ffmpeg.wasm (auto-compress to 256KB)
- **Telegram Integration** — Validate bot tokens, create sticker packs, batch upload
- **Batch Operations** — Process multiple files, batch download as ZIP
- **History Archive** — Timeline-based history with search, filters, tags
- **Dark Mode** — System preference detection with manual toggle (system/light/dark)
- **Responsive** — Mobile-first layout, lightbox preview

## Tech Stack

- **Frontend:** Nuxt 4, Vue 3, Pinia
- **Video Processing:** ffmpeg.wasm (client-side, no server FFmpeg required)
- **Image Processing:** Sharp (server-side via Nitro)
- **Deployment:** Vercel (preset configured)

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment Variables

No environment variables required. The Telegram bot token is provided per-request through the UI.

## Project Structure

```text
app/                    # Nuxt 4 frontend
  assets/css/           # Design tokens and styles
  components/           # Vue components
  composables/          # useFfmpeg, useLightbox
  layouts/              # Page layouts with theme toggle
  pages/                # Route pages
  stores/               # Pinia state
  utils/                # Helpers
server/                 # Nitro backend
  api/                  # API endpoints
  middleware/           # COOP/COEP headers for SharedArrayBuffer
  services/             # Image, video, Telegram services
  utils/                # Config, logger, file cleanup
```

## License

MIT
