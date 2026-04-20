// Parses a single book.md file into a Book domain object.
//
// Book       : { id, title, config: { color? }, pages: Page[] }
// Page       : { index, items: Item[] }
// PhotoItem  : { kind:'photo', src, caption, annotation, audio }
// VideoItem  : { kind:'video', src, video, still, caption, annotation, audio }
// IndexItem  : { kind:'index', entries: [{ label, targetPage }] }
//
// book.md structure:
//   --- frontmatter (key: value pairs) ---
//   #    → book title
//   ##   → section  (becomes an index entry pointing to its first #### page)
//   ###  → subsection (reserved)
//   #### → page delimiter
//
// pages[0] is always a blank left page, pages[1] is the auto-generated index.

function parseFrontmatter(text) {
  const config = {}
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { config, body: text }
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) config[kv[1].trim()] = kv[2].trim()
  }
  return { config, body: match[2] }
}

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

export function parseBook(id, text) {
  const { config, body } = parseFrontmatter(text ?? '')
  const book = { id, title: id, config, pages: [] }
  if (!body.trim()) { prependStructuralPages(book, []); return book }

  const sections = []       // { label, pageIndex: null | number }
  let pendingSection = null // section waiting for its first #### to set pageIndex
  let currentPage = null

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const heading = line.match(/^(#{1,4})(?:\s+(.*))?$/)
    if (heading) {
      const level = heading[1].length
      const content = heading[2]?.trim() ?? ''
      if (level === 1) { book.title = content; continue }
      if (level === 2) {
        pendingSection = { label: content, pageIndex: null }
        sections.push(pendingSection)
        continue
      }
      if (level === 3) continue  // subsection – reserved
      if (level === 4) {
        // +2 because blank+index pages will be prepended
        currentPage = { index: 2 + book.pages.length, items: [] }
        book.pages.push(currentPage)
        if (pendingSection) { pendingSection.pageIndex = currentPage.index; pendingSection = null }
        continue
      }
    }

    if (!currentPage) continue

    const items = currentPage.items
    let current = items.length ? items[items.length - 1] : null

    const media = line.match(/^!\[([^\]]*)\]\(([^\s)"]+)(?:\s+"([^"]*)")?\)$/)
    if (media) { current = parseMediaItem(media[1], media[2], media[3] ?? null); items.push(current); continue }

    const annot = line.match(/^\*(.+)\*$/)
    if (annot && current) { current.annotation = annot[1]; continue }

    const audio = line.match(/^\[audio:([^\]]+)\]$/)
    if (audio && current) { current.audio = audio[1].trim(); continue }
  }

  prependStructuralPages(book, sections)
  return book
}

function prependStructuralPages(book, sections) {
  const entries = sections
    .filter(s => s.pageIndex !== null)
    .map(s => ({ label: s.label, targetPage: s.pageIndex }))

  // Index page (right of first spread)
  book.pages.unshift({ index: 1, items: entries.length ? [{ kind: 'index', entries }] : [] })
  // Blank page (left of first spread)
  book.pages.unshift({ index: 0, items: [] })
}
