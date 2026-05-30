import React from 'react'
import ReactDOM from 'react-dom/client'
import { IconContext } from '@phosphor-icons/react'
import App from './App.jsx'
import './styles/index.css'

// Worksite direction: icons default to bold for glance-ability in the field.
// Explicit weight="fill"/"light" on individual icons still overrides this.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IconContext.Provider value={{ weight: 'bold' }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>,
)
