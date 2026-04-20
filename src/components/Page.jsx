import React from 'react'
import Item from './Item.jsx'

export default function Page({ page, onItemClick, assetFn }) {
  if (!page?.items.length) return null

  return (
    <div className="page-content">
      {page.items.map((item, i) => {
        if (item.kind === 'photo' || item.kind === 'video') {
          return <Item key={i} item={item} onItemClick={onItemClick} reversed={i % 2 === 1} assetFn={assetFn} />
        }

        if (item.kind === 'index') {
          return (
            <ul key={i} className="index-list">
              {item.entries.map((entry, j) => (
                <li key={j}>
                  <a href="#" onClick={e => {
                    e.preventDefault()
                    onItemClick({ kind: '_navigate', targetPage: entry.targetPage })
                  }}>
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          )
        }

        return null
      })}
    </div>
  )
}
