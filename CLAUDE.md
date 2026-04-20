# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A fully static photobook viewer — no server, no backend. All assets (images, video) live in the repository. The UI shows a shelf of books; selecting one opens a physical-book simulation with two pages side-by-side, handwritten annotations, photo zoom, and swipe/click navigation.

## Stack

Vite + React (JSX, no TypeScript). No other libraries.

## Development Commands

```bash
npm install       # first time only
npm run dev       # dev server at http://localhost:5173 with HMR
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Base Path

`vite.config.js` sets `base: '/photobook/'` for production and `'/'` for dev. All asset paths use `import.meta.env.BASE_URL` via helpers in `src/config.js`. Never hardcode `/photobook/` elsewhere.

```js
// src/config.js
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
export const manifestPath          = `${BASE}/manifest.json`
export const bookPath  = id       => `${BASE}/books/${id}/book.md`
export const bookAsset = (id, path) => `${BASE}/books/${id}/${path}`
```

## Content Structure

```
public/
  manifest.json          # { "books": ["my-book", "my-book-2"] }
  bg.jpg                 # shelf/book background texture
  books/
    <id>/
      book.md            # single file per book (see format below)
      photos/            # assets referenced in book.md
```

### book.md Format

```markdown
---
color: #7a2e0e        # cover color (CSS color value)
---

# Book Title          # sets book.title

## Section Name       # creates an index entry; first page under it is its target

####                  # page break (starts a new two-page spread slot)

![](photos/img.jpg)
*Annotation text*

![](photos/img2.jpg)
*Another annotation*

####                  # second page in the same spread (or start of next spread)

![](photos/img3.jpg)
*Text*
```

Rules:
- `#` sets the book title (one per book)
- `##` declares a named section; auto-generates an index entry pointing to its first `####` page
- `####` is a page break (each holds up to ~2 items)
- `![]()` is a photo. Alt text is ignored; the `*italic*` line below is the annotation.
- All photo paths are relative to the book directory.
- Pages 0 (blank) and 1 (auto-generated index) are prepended by the parser. Content pages start at index 2.

## Domain Model

```
Book    { id, title, config: { color? }, pages: Page[] }
Page    { index, items: Item[] }
Item    PhotoItem  { kind: 'photo', src, annotation? }
        VideoItem  { kind: 'video', src, annotation? }
        IndexItem  { kind: 'index', entries: [{ label, targetPage }] }
```

## Architecture

**Data flow**: `manifest.json` → `App.jsx` fetches book list → on book open, fetch+parse `book.md` → `Book.jsx` renders spreads.

**Key files**:
- `src/parser.js` — parses `book.md` into `Book` domain object (frontmatter + heading hierarchy + page breaks)
- `src/config.js` — all URL helpers
- `src/components/Shelf.jsx` — drag-to-browse book picker; `computeBookDims()` mirrors CSS `--book-w` formula for JS-side spacing
- `src/components/Book.jsx` — spread renderer; creates `assetFn = path => bookAsset(id, path)` and passes it down
- `src/components/Page.jsx` — renders items (photo/video/index) for one page
- `src/components/Item.jsx` — single photo+annotation unit; detects portrait orientation via `img.onload`
- `src/components/ZoomOverlay.jsx` — full-screen zoom; receives `assetFn`
- `src/components/RotatePrompt.jsx` — fixed overlay shown on mobile portrait

**CSS design tokens** (`:root` in `styles.css`):
- `--book-w: min(95vw, calc(92vh / 0.63))` — book fills the screen, no fixed cap
- `--book-color: #3a1f08` — default cover color; overridden per-book via `style={{ '--book-color': color }}`
- `color-mix(in srgb, var(--book-color), ...)` used for spine/gradient depth on cover and shelf books

**Mobile**: `(pointer: coarse) and (orientation: portrait)` media query pre-rotates `.book` and `body::before` (background) by −90deg so the layout is already correct when the user rotates their device. `RotatePrompt` is a fixed overlay rendered on top of the book, not a replacement.

**`assetFn` pattern**: `Book.jsx` owns `book.id`; it creates `assetFn` and passes it to `Page` → `Item` / `ZoomOverlay` so those components are book-agnostic.
