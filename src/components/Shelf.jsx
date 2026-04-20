import React, { useState, useRef } from 'react'

const SPINE_W        = 16
const DRAG_PX        = 5
const SNAP_PX        = 50
const ADJACENT_SHOW  = 80   // px of adjacent book visible at screen edge
const DEFAULT_COLOR  = '#3a1f08'

// Mirror the CSS formulas:
//   landscape: --book-w: min(95vw, calc(92vh / 0.63))
//   portrait:  --book-w: min(92vh, calc(95vw / 0.63))  (shelf is rotated, effective width = vh)
function computeBookDims() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const portrait = window.matchMedia('(pointer: coarse) and (orientation: portrait)').matches
  const bookW  = portrait
    ? Math.min(vh * 0.92, (vw * 0.95) / 0.63)
    : Math.min(vw * 0.95, (vh * 0.92) / 0.63)
  const pageW  = bookW / 2
  const pageH  = bookW * 0.63
  const coverW = pageW + SPINE_W
  // In portrait the shelf's CSS width is 100vh, so centering uses vh as effective viewport width
  const effectiveW = portrait ? vh : vw
  const spacing = effectiveW / 2 + coverW / 2 - ADJACENT_SHOW
  return { pageW, pageH, coverW, spacing }
}

export default function Shelf({ books, activeIdx, onActiveChange, onSelect }) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const drag         = useRef(null)
  const didDrag      = useRef(false)
  const containerRef = useRef(null)

  function trackX() {
    const { coverW, spacing } = computeBookDims()
    const w = containerRef.current?.offsetWidth ?? window.innerWidth
    return w / 2 - coverW / 2 - activeIdx * spacing + dragOffset
  }

  // Mouse drag: attach move/up to document so releasing outside the shelf still commits
  function mouseDragStart(x) {
    drag.current = { startX: x, moved: false }
    didDrag.current = false

    const onMove = e => {
      if (!drag.current) return
      const dx = e.clientX - drag.current.startX
      if (!drag.current.moved && Math.abs(dx) > DRAG_PX) {
        drag.current.moved = true
        setIsDragging(true)
      }
      if (drag.current.moved) setDragOffset(dx)
    }

    const onUp = e => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!drag.current) return
      const { startX, moved } = drag.current
      didDrag.current = moved
      drag.current = null
      setDragOffset(0)
      setIsDragging(false)
      if (moved) {
        const dx = e.clientX - startX
        if (dx < -SNAP_PX && activeIdx < books.length - 1) onActiveChange(activeIdx + 1)
        else if (dx > SNAP_PX && activeIdx > 0) onActiveChange(activeIdx - 1)
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Touch drag: touchend always fires on the originating element, so inline handlers work fine
  function touchDragStart(x) { drag.current = { startX: x, moved: false } }

  function touchDragMove(x) {
    if (!drag.current) return
    const dx = x - drag.current.startX
    if (!drag.current.moved && Math.abs(dx) > DRAG_PX) { drag.current.moved = true; setIsDragging(true) }
    if (drag.current.moved) setDragOffset(dx)
  }

  function touchDragEnd(x) {
    if (!drag.current) return
    const { startX, moved } = drag.current
    drag.current = null; setDragOffset(0); setIsDragging(false)
    if (moved) {
      const dx = x - startX
      if (dx < -SNAP_PX && activeIdx < books.length - 1) onActiveChange(activeIdx + 1)
      else if (dx > SNAP_PX && activeIdx > 0) onActiveChange(activeIdx - 1)
    }
  }

  function handleBookClick(idx) {
    if (didDrag.current) { didDrag.current = false; return }
    if (idx !== activeIdx) { onActiveChange(idx); return }
    onSelect(books[idx])
  }

  const { pageW, pageH, coverW } = computeBookDims()

  return (
    <div
      ref={containerRef}
      className="shelf"
      onMouseDown={e => mouseDragStart(e.clientX)}
      onTouchStart={e => touchDragStart(e.touches[0].clientX)}
      onTouchMove={e => touchDragMove(e.touches[0].clientX)}
      onTouchEnd={e => touchDragEnd(e.changedTouches[0].clientX)}
    >
      <div
        className="shelf-track"
        style={{ transform: `translateX(${trackX()}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }}
      >
        {books.map((book, i) => {
          const color = book.config?.color ?? DEFAULT_COLOR
          return (
            <div
              key={book.id}
              className={`shelf-book${i === activeIdx ? ' shelf-book--active' : ''}`}
              style={{ width: `${coverW}px`, height: `${pageH}px`, '--book-color': color }}
              onClick={() => handleBookClick(i)}
            >
              <div className="shelf-book-spine" />
              <div className="shelf-book-front">
                <div className="shelf-book-title">{book.title}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="shelf-hint">
        {books.length > 1 ? 'Drag to browse · Click to open' : 'Click to open'}
      </div>
    </div>
  )
}
