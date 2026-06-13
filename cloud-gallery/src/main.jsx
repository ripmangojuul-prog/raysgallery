import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { UI } from './UI.jsx'
import './index.css'
import { KeyboardControls } from '@react-three/drei'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'interact', keys: ['Space'] },
        { name: 'menu', keys: ['KeyM'] },
        { name: 'close', keys: ['Escape'] },
      ]}
    >
      <App />
      <UI />
    </KeyboardControls>
  </React.StrictMode>,
)
