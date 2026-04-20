// import.meta.env.BASE_URL is '/' in dev and '/photobook/' in prod (set by vite.config.js).
// Strip the trailing slash so callers can write asset('photos/img.jpg') uniformly.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const asset       = path => `${BASE}/${path}`
export const pagePath    = id   => `${BASE}/pages/${id}.md`
export const manifestPath       = `${BASE}/pages/manifest.json`
