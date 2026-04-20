import React, { useState } from 'react'

export default function Item({ item, onItemClick, reversed = false, assetFn }) {
  const [portrait, setPortrait] = useState(null)

  const src = item.kind === 'video' && item.still ? item.still : item.src

  const classes = [
    'item',
    portrait === true ? 'item--portrait' : '',
    reversed         ? 'item--reversed'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="item-media" onClick={() => onItemClick(item)}>
        <img
          src={assetFn(src)}
          alt={item.caption ?? ''}
          loading="lazy"
          onLoad={e => setPortrait(e.target.naturalHeight > e.target.naturalWidth)}
        />
      </div>
      {item.annotation && (
        <div className="item-annotation" onClick={() => onItemClick(item)}>{item.annotation}</div>
      )}
    </div>
  )
}
