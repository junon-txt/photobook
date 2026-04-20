// Parses a single page .md file into a Page domain object.
// Page      : { id: string, items: Item[] }
// PhotoItem : { kind:'photo', src, caption, annotation, audio }
// VideoItem : { kind:'video', src, video, still, caption, annotation, audio }
// IndexItem : { kind:'index', entries: [{ label, targetPage }] }

function parseMediaItem(alt, src, title) {
  const item = { caption: alt || null, src, annotation: null, audio: null }
  if (title) {
    const videoMatch = title.match(/video:\s*([^\s|]+)/)
    const stillMatch = title.match(/still:\s*([^\s|]+)/)
    if (videoMatch) {
      return { ...item, kind: 'video', video: videoMatch[1].trim(), still: stillMatch?.[1].trim() ?? null }
    }
  }
  return { ...item, kind: 'photo' }
}

export function parsePage(id, text) {
  if (!text?.trim()) return { id, items: [] }

  const items = []
  let current = null

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const media = line.match(/^!\[([^\]]*)\]\(([^\s)"]+)(?:\s+"([^"]*)")?\)$/)
    if (media) { current = parseMediaItem(media[1], media[2], media[3] ?? null); items.push(current); continue }

    const annot = line.match(/^\*(.+)\*$/)
    if (annot && current) { current.annotation = annot[1]; continue }

    const audio = line.match(/^\[audio:([^\]]+)\]$/)
    if (audio && current) { current.audio = audio[1].trim(); continue }

    const idx = line.match(/^-\s+\[([^\]]+)\]\(#(\d+)\)$/)
    if (idx) {
      if (!current || current.kind !== 'index') { current = { kind: 'index', entries: [] }; items.push(current) }
      current.entries.push({ label: idx[1], targetPage: idx[2].padStart(4, '0') })
    }
  }

  return { id, items }
}
