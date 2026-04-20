import React, { useState, useEffect } from 'react'
import { manifestPath, pagePath } from './config.js'
import { parsePage } from './parser.js'
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
  const [album, setAlbum] = useState(null)
  const [error, setError] = useState(null)
  const showRotatePrompt  = usePortrait()

  useEffect(() => {
    async function load() {
      const res = await fetch(manifestPath)
      if (!res.ok) throw new Error(`manifest ${res.status}`)
      const manifest = await res.json()
      document.title = manifest.title ?? 'Photobook'
      const pages = await Promise.all(
        manifest.pages.map(async id => {
          const r = await fetch(pagePath(id))
          return parsePage(id, r.ok ? await r.text() : '')
        })
      )
      setAlbum({ pages })
    }
    load().catch(e => setError(e.message))
  }, [])

  if (error)  return <div className="status-message">Failed to load album: {error}</div>
  if (!album) return <div className="status-message">Loading…</div>
  return (
    <>
      <Book pages={album.pages} />
      {showRotatePrompt && <RotatePrompt />}
    </>
  )
}
