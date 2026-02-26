import useStore from '../store'
import './HUD.css'

export default function HUD() {
  const isLocked = useStore((s) => s.isLocked)

  return (
    <>
      {/* Click-to-enter overlay */}
      {!isLocked && (
        <div className="enter-overlay">
          <div className="enter-content">
            <h1 className="enter-title">Hinter Tattoo</h1>
            <p className="enter-tagline">Virtual Gallery</p>
            <div className="enter-prompt">
              <span className="enter-icon">&#9654;</span>
              Click anywhere to enter
            </div>
          </div>
        </div>
      )}

      {/* In-game HUD */}
      {isLocked && (
        <div className="hud">
          <div className="hud-top-left">
            <h1>Hinter</h1>
          </div>

          <div className="hud-bottom">
            <span className="hud-controls">
              [W A S D] Move &nbsp;&middot;&nbsp; [SHIFT] Sprint &nbsp;&middot;&nbsp; [ESC] Pause &nbsp;&middot;&nbsp; Mouse to look
            </span>
          </div>

          {/* Crosshair */}
          <div className="crosshair" />
        </div>
      )}
    </>
  )
}
