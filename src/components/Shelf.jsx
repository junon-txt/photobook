import React, { useState, useRef } from 'react'

const SPINE_W        = 16
const DRAG_PX        = 5
const SNAP_PX        = 50
const ADJACENT_SHOW  = 80   // px of adjacent book visible at screen edge
const DEFAULT_COLOR  = '#3a1f08'

// Mirror the CSS: --book-w: min(95vw, calc(92vh / 0.63))
function computeBookDims() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const bookW  = Math.min(vw * 0.95, (vh * 0.92) / 0.63)
  const pageW  = bookW / 2
  const pageH  = bookW * 0.63
  const coverW = pageW + SPINE_W
  // Spacing: active book centered, adjacent shows ADJACENT_SHOW px from edge
  const spacing = vw / 2 + coverW / 2 - ADJACENT_SHOW
  return { pageW, pageH, coverW, spacing }
}

export default function Shelf({ books, activeIdx, onActiveChange, onSelect }) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const drag          = useRef(null)
  const containerRef  = useRef(null)

  function trackX() {
    const { coverW, spacing } = computeBookDims()
    const w = containerRef.current?.offsetWidth ?? window.innerWidth
    return w / 2 - coverW / 2 - activeIdx * spacing + dragOffset
  }

  function dragStart(x) { drag.current = { startX: x, moved: false } }

  function dragMove(x) {
    if (!drag.current) return
    const dx = x - drag.current.startX
    if (!drag.current.moved && Math.abs(dx) > DRAG_PX) { drag.current.moved = true; setIsDragging(true) }
    if (drag.current.moved) setDragOffset(dx)
  }

  function dragEnd(x) {
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
    if (drag.current?.moved) return
    if (idx !== activeIdx) { onActiveChange(idx); return }
    onSelect(books[idx])
  }

  const { pageW, pageH, coverW } = computeBookDims()

  return (
    <div
      ref={containerRef}
      className="shelf"
      onMouseDown={e => dragStart(e.clientX)}
      onMouseMove={e => dragMove(e.clientX)}
      onMouseUp={e => dragEnd(e.clientX)}
      onMouseLeave={() => { drag.current = null; setDragOffset(0); setIsDragging(false) }}
      onTouchStart={e => dragStart(e.touches[0].clientX)}
      onTouchMove={e => dragMove(e.touches[0].clientX)}
      onTouchEnd={e => dragEnd(e.changedTouches[0].clientX)}
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
