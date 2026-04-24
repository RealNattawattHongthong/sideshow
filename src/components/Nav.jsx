import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useOntime } from '../context/OntimeContext'
import './Nav.css'

const PLAYBACK_LABEL = {
  play: 'PLAYING', pause: 'PAUSED', stop: 'STOPPED', roll: 'ROLLING', armed: 'ARMED',
}
const PLAYBACK_COLOR = {
  play: 'var(--green)', pause: 'var(--amber)', stop: 'var(--text-3)',
  roll: 'var(--blue)',  armed: 'var(--purple)',
}

function FullscreenBtn() {
  const [isFs, setIsFs] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  return (
    <button className="fs-btn" onClick={toggle} title={isFs ? 'Exit fullscreen' : 'Enter fullscreen'}>
      {isFs ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M7 3H3v4M13 3h4v4M7 17H3v-4M13 17h4v-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

export default function Nav() {
  const { connected, playback, config } = useOntime()

  return (
    <nav className="nav">
      <div className="nav-brand">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
          <rect x="3"  y="3"  width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
          <rect x="14" y="3"  width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="3"  y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
        </svg>
        <span className="nav-title">Sideshow</span>
      </div>

      <div className="nav-links">
        <NavLink to="/rundown"   className="nav-link">Rundown</NavLink>
        <NavLink to="/agenda"    className="nav-link">Agenda</NavLink>
        <NavLink to="/now-next"  className="nav-link">Now &amp; Next</NavLink>
        <NavLink to="/presenter" className="nav-link">Presenter</NavLink>
        <NavLink to="/display"   className="nav-link">Display</NavLink>
        <NavLink to="/settings"  className="nav-link">Settings</NavLink>
        <NavLink to="/admin"     className="nav-link">Admin</NavLink>
      </div>

      <div className="nav-right">
        <div className="nav-status">
          <span className="status-dot"
            style={{ background: connected ? PLAYBACK_COLOR[playback] : 'var(--text-3)' }} />
          <span className="status-label"
            style={{ color: connected ? PLAYBACK_COLOR[playback] : 'var(--text-3)' }}>
            {connected ? PLAYBACK_LABEL[playback] ?? playback.toUpperCase() : 'OFFLINE'}
          </span>
          {connected && <span className="status-host">{config.host}:{config.port}</span>}
        </div>

        <FullscreenBtn />
      </div>
    </nav>
  )
}
