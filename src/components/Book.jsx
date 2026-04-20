import React, { useState, useCallback } from 'react'
import { bookAsset } from '../config.js'
import Page from './Page.jsx'
import ZoomOverlay from './ZoomOverlay.jsx'

const SWIPE_THRESHOLD = 50

export default function Book({ book, onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [zoomedItem, setZoomedItem]   = useState(null)
  const touchStartX = React.useRef(null)

  const { pages, config } = book
  const assetFn = useCallback(path => bookAsset(book.id, path), [book.id])

  const total    = pages.length
  const slices   = Math.min(Math.ceil(total / 4), 8)
  const hasLeft  = spreadIndex > 0
  const hasRight = spreadIndex + 2 < total

  const onItemClick = useCallback(item => {
    if (item.kind === '_navigate') {
      const t = item.targetPage
      setSpreadIndex(t % 2 === 0 ? t : t - 1)
    } else {
      setZoomedItem(item)
    }
  }, [])

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta < -SWIPE_THRESHOLD && hasRight) setSpreadIndex(s => s + 2)
    if (delta >  SWIPE_THRESHOLD && hasLeft)  setSpreadIndex(s => s - 2)
  }

  const stackRange = Array.from({ length: slices }, (_, i) => i + 1)
  const bookStyle  = config.color ? { '--book-color': config.color } : undefined

  return (
    <>
      <button className="back-btn" onClick={onClose}>← Back</button>

      <div className="book" style={bookStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="book-cover" />

        {stackRange.map(i => (
          <div key={`sl${i}`} className="stack-slice stack-slice--left"
            style={{ '--i': i, visibility: hasLeft ? 'visible' : 'hidden' }} />
        ))}

        <div className="page page--left">
          <Page page={pages[spreadIndex]} onItemClick={onItemClick} assetFn={assetFn} />
        </div>

        <div className="book-spine" />

        <div className="page page--right">
          <Page page={pages[spreadIndex + 1]} onItemClick={onItemClick} assetFn={assetFn} />
        </div>

        {stackRange.map(i => (
          <div key={`sr${i}`} className="stack-slice stack-slice--right"
            style={{ '--i': i, visibility: hasRight ? 'visible' : 'hidden' }} />
        ))}

        {hasLeft  && <div className="book-nav book-nav--left"  onClick={() => setSpreadIndex(s => s - 2)} />}
        {hasRight && <div className="book-nav book-nav--right" onClick={() => setSpreadIndex(s => s + 2)} />}
      </div>

      {zoomedItem && (
        <ZoomOverlay item={zoomedItem} onClose={() => setZoomedItem(null)} assetFn={assetFn} />
      )}
    </>
  )
}
