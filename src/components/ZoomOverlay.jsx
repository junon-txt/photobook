import React, { useEffect, useRef } from 'react'

export default function ZoomOverlay({ item, onClose, assetFn }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (item.audio) {
      const a = new Audio(assetFn(item.audio))
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
            ? <video src={assetFn(item.video)} controls autoPlay onClick={e => e.stopPropagation()} />
            : <img src={assetFn(item.src)} alt={item.caption ?? ''} onClick={onClose} style={{ cursor: 'zoom-out' }} />
          }
        </div>
        {item.annotation && <div className="zoom-annotation">{item.annotation}</div>}
      </div>
    </div>
  )
}
