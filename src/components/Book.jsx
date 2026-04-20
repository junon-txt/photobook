import React, { useState, useCallback } from 'react'
import Page from './Page.jsx'
import ZoomOverlay from './ZoomOverlay.jsx'

export default function Book({ pages }) {
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [zoomedItem, setZoomedItem]   = useState(null)

  const total    = pages.length
  const slices   = Math.min(Math.ceil(total / 4), 8)
  const hasLeft  = spreadIndex > 0
  const hasRight = spreadIndex + 2 < total

  const goToPage = useCallback(id => {
    const i = pages.findIndex(p => p.id === id)
    if (i !== -1) setSpreadIndex(i % 2 === 0 ? i : i - 1)
  }, [pages])

  const onItemClick = useCallback(item => {
    if (item.kind === '_navigate') goToPage(item.targetPage)
    else setZoomedItem(item)
  }, [goToPage])

  const stackRange = Array.from({ length: slices }, (_, i) => i + 1)

  return (
    <>
      <div className="book">
        <div className="book-cover" />

        {stackRange.map(i => (
          <div key={`sl${i}`} className="stack-slice stack-slice--left"
            style={{ '--i': i, visibility: hasLeft ? 'visible' : 'hidden' }} />
        ))}

        <div className="page page--left">
          <Page page={pages[spreadIndex]} onItemClick={onItemClick} />
        </div>

        <div className="book-spine" />

        <div className="page page--right">
          <Page page={pages[spreadIndex + 1]} onItemClick={onItemClick} />
        </div>

        {stackRange.map(i => (
          <div key={`sr${i}`} className="stack-slice stack-slice--right"
            style={{ '--i': i, visibility: hasRight ? 'visible' : 'hidden' }} />
        ))}

        {hasLeft  && <div className="book-nav book-nav--left"  onClick={() => setSpreadIndex(s => s - 2)} />}
        {hasRight && <div className="book-nav book-nav--right" onClick={() => setSpreadIndex(s => s + 2)} />}
      </div>

      {zoomedItem && <ZoomOverlay item={zoomedItem} onClose={() => setZoomedItem(null)} />}
    </>
  )
}
