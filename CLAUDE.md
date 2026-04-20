# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A fully static webpage — no server, no build step required, no backend. All assets (images, audio, video) live in the repository. The UI simulates a physical book: two open pages side-by-side, photos with handwritten-style text annotations, hover-to-zoom, page-turn navigation. No backend. No social features.

## Stack

Vite + React (JSX, no TypeScript). No other libraries.

## Development Commands

```bash
npm install       # first time only
npm run dev       # dev server at http://localhost:5173 with HMR
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

When adding new pages, add their IDs to `public/pages/manifest.json`.

## Base Path

Handled entirely by Vite — no manual detection needed. `vite.config.js` sets `base: '/photobook/'` for production builds and `base: '/'` for dev. All asset paths in the app use `import.meta.env.BASE_URL` via the `asset()` helper in `src/config.js`. Never hardcode `/photobook/` anywhere else.

## Design Principles

- Use the most reliable, maintainable frontend technologies — optimized for a developer with a backend background.
- Keep abstractions small and elegant. Prefer clarity over cleverness.
- Modularize and reuse logic. Desktop and Mobile share behavior; implementation differences must be hidden behind meaningful abstractions (not scattered conditionals).
- Book and Pages UI components are drawn programmatically because they are animated (page-turn effect). Do not use static HTML/CSS for these.

## Media

- All assets (images, audio, video) are committed to the repo and referenced by relative path in the content data.
- Photos in the photobook display a still image. A photo entry can optionally point to a video file; clicking the zoomed image plays the video. A separate still can be provided for the thumbnail; if omitted, the video's first frame is used.
- Vertical (portrait-orientation) photos and videos are allowed but the UI is designed for horizontal aspect ratios. Portrait media is fit-to-height and displayed as-is — nothing is rotated or scaled up to fill width.
- Audio, when attached, is independent of video. A photo entry can have audio, a video, both, or neither.

## Hosting & Base Path

The site is hosted at `<domain>/photobook/` via GitHub Pages, but must also work when opened directly from the filesystem or a local server at `/`.

All internal navigation and asset paths must go through a single `basePath()` helper (or equivalent constant). This is the only place where the path prefix is resolved:

- **Local** (`localhost` or `file://`): prefix is `""` (empty).
- **Production** (any other hostname): prefix is `"/photobook"`.

```js
const BASE = (location.hostname === 'localhost' || location.protocol === 'file:')
  ? ''
  : '/photobook';
```

Asset paths in content data files are written as bare relative paths (e.g. `"photos/img1.jpg"`). The `basePath()` helper prepends `BASE` when constructing `src` or `href` values. Never hardcode `/photobook/` anywhere else in the codebase.

## Desktop UX

- Simulates an open book: left page + right page visible simultaneously.
- Photos can appear on either page.
- **Hover photo** → zooms to fill most of the screen.
- **Click zoomed photo** → if the entry has a video, plays the video inline; otherwise returns to book state. Returning from video also returns to book state.
- Vertical media is displayed at its natural aspect ratio, fit to the available height. No cropping or rotation.
- **Hover text annotation** → zoom shows photo + text, with text taking more prominence than the photo.
- If audio is attached to a photo, a speaker emoji appears; clicking plays it. Audio stops when UI returns to book state.
- **Click left/right edge** → turns page in that direction.
- Text annotations use a pen/handwriting-style font with configurable color.

## Mobile UX

- Phone held in landscape orientation so the book layout works horizontally.
- Touch events replace click/hover events.
- Same visual layout and behavior as desktop, adapted for touch.

## Book Visual Anatomy

The book is drawn programmatically (canvas or SVG). Key visual elements:

- **Pages**: rectangular. Near the spine (center), each page curves inward to mimic natural page curvature — achieved with a subtle concave arc on the inner edge, not a border-radius.
- **Cover/back**: a flat, slightly darker rectangle that extends a few pixels beyond the page edges on all sides, visible behind both open pages. Represents the book cover.
- **Page stack (depth)**: behind each open page, draw additional thin page-edge slices to convey book thickness. The number of visible slices scales with total page count — more pages = thicker stack — up to a reasonable visual cap. This is purely decorative and drawn once; it does not animate.
- **Spine shadow**: a soft vertical shadow at the center where the two pages meet reinforces the 3D effect.

## Content Format (Domain Language)

Content is authored in `.md` files using a minimal, UI-agnostic domain language. The parser reads these files and produces a `Page[]` domain model consumed by the renderer. The `.md` format must remain implementation-agnostic so it can be consumed by a future UI without change.

**Domain model types** (shared, not tied to any renderer):

```
Album        { title, pages: Page[] }
Page         { number: number, items: Item[] }   // one page = one side of the open book
                                                  // pages[0] = page 00 (empty), pages[1] = page 01 (index)
Item         { kind, caption?, audio? }
  PhotoItem  { kind: "photo", src: string }
  VideoItem  { kind: "video", src: string, still?: string }
              // still: optional thumbnail; omit to use first frame
  IndexItem  { kind: "index", entries: IndexEntry[] }  // only valid on page 01
IndexEntry   { label: string, targetPage: number }
```

**Page file naming**: each page is its own `.md` file named `NNNN.md` (4-digit zero-padded, e.g. `0000.md`, `0001.md`, `0012.md`). Pages are paired into spreads: `(0000, 0001)`, `(0002, 0003)`, … The album loads them in order.

**Reserved pages:**
- `0000.md` — always empty. Left page of the first spread; mirrors the blank first page of a real book. No content, no items.
- `0001.md` — the index. Right page of the first spread and the landing view of the web. Contains a list of named entries, each referencing a target page number. Clicking an entry navigates directly to that spread.

**Index page format** (`0001.md`):

```markdown
- [A day at the beach](#0012)
- [Sunset hike](#0020)
- [City lights](#0034)
```

Each list item is a navigation link. `#NNNN` refers to the page number to jump to (the spread containing that page is shown).

**Regular page format** (all other `.md` files):

```markdown
![A day at the beach](photos/beach.jpg)
*It was warm and bright.*

![](photos/sunset.jpg "still:photos/sunset-thumb.jpg | video:videos/sunset.mp4")
[audio:audio/waves.mp3]
*The last light of the day.*
```

Rules:
- `![]()` is a photo or video item. The alt text is the caption. Title attribute carries optional `still:` and `video:` overrides separated by `|`.
- `[audio:path]` attaches audio to the preceding item.
- `*...*` italics is the text annotation (rendered in handwriting font).
- All paths are bare and relative (no leading `/`); the renderer applies `basePath()`.

The parser lives in its own module and only produces domain model objects — it has no knowledge of the renderer.

## Architecture Notes

- Desktop and Mobile paths share core data and logic. When adding a feature, implement the logic once and expose it through a shared abstraction; Desktop and Mobile consume the abstraction differently.
- Layers: **content files** (`.md`) → **parser** (produces `Album`) → **renderer** (Book/Page drawing) → **interaction layer** (zoom, video, audio state). These layers must not be entangled.
- Audio playback is tied to UI state: always stop audio (and video) on any UI transition back to the book view.
