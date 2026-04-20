import React, { useState, useEffect } from 'react'
import { manifestPath, bookPath } from './config.js'
import { parseBook } from './parser.js'
import Shelf from './components/Shelf.jsx'
import Book from './components/Book.jsx'
import RotatePrompt from './components/RotatePrompt.jsx'

function usePortrait() {
  const mq = '(pointer: coarse) and (orientation: portrait)'
  const [portrait, setPortrait] = useState(() => window.matchMedia(mq).matches)
  useEffect(() => {
    const media = window.matchMedia(mq)
    const handler = e => setPortrait(e.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])
  return portrait
}

export default function App() {
  const [books, setBooks]           = useState(null)
  const [error, setError]           = useState(null)
  const [activeBookIdx, setActiveBookIdx] = useState(0)
  const [openBook, setOpenBook]     = useState(null)
  const showRotatePrompt            = usePortrait()

  useEffect(() => {
    async function load() {
      const res = await fetch(manifestPath)
      if (!res.ok) throw new Error(`manifest ${res.status}`)
      const { books: ids } = await res.json()
      const loaded = await Promise.all(
        ids.map(async id => {
          const r = await fetch(bookPath(id))
          return parseBook(id, r.ok ? await r.text() : '')
        })
      )
      setBooks(loaded)
    }
    load().catch(e => setError(e.message))
  }, [])

  if (error)  return <div className="status-message">Failed to load: {error}</div>
  if (!books) return <div className="status-message">Loading…</div>

  return (
    <>
      {openBook
        ? <Book book={openBook} onClose={() => setOpenBook(null)} />
        : <Shelf
            books={books}
            activeIdx={activeBookIdx}
            onActiveChange={setActiveBookIdx}
            onSelect={setOpenBook}
          />
      }
      {showRotatePrompt && <RotatePrompt />}
    </>
  )
}
