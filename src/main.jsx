import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Inject background image path via CSS custom property so BASE_URL is applied correctly.
document.documentElement.style.setProperty(
  '--bg-image',
  `url('${import.meta.env.BASE_URL}bg.jpg')`
)

ReactDOM.createRoot(document.getElementById('app')).render(<App />)
