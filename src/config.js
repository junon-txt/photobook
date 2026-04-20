const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const manifestPath          = `${BASE}/manifest.json`
export const bookPath  = id       => `${BASE}/books/${id}/book.md`
export const bookAsset = (id, path) => `${BASE}/books/${id}/${path}`
