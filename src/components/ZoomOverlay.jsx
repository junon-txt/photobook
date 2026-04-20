import React, { useEffect, useRef } from 'react'
import { asset } from '../config.js'

export default function ZoomOverlay({ item, onClose }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (item.audio) {
      const a = new Audio(asset(item.audio))
      a.play().catch(() => {})
      audioRef.current = a
    }
    return () => { audioRef.current?.pause(); audioRef.current = null }
  }, [item])

  return (
    <div className="zoom-overlay" onClick={onClose}>
      <div
        className={`zoom-body${item.annotation ? ' has-annotation' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="zoom-media">
          {item.kind === 'video' && item.video
            ? <video src={asset(item.video)} controls autoPlay onClick={e => e.stopPropagation()} />
            : <img src={asset(item.src)} alt={item.caption ?? ''} onClick={onClose} style={{ cursor: 'zoom-out' }} />
          }
        </div>
        {item.annotation && <div className="zoom-annotation">{item.annotation}</div>}
      </div>
    </div>
  )
}
