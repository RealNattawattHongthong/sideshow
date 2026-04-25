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

function ThemeBtn() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('sideshow_theme', next)
    setTheme(next)
  }, [theme])

  return (
    <button className="theme-btn" onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {theme === 'dark' ? (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.7.7a1 1 0 11-1.42-1.42l.7-.7zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4.78 3.78a1 1 0 00-1.42 1.42l.7.7a1 1 0 001.42-1.42l-.7-.7zM3 9a1 1 0 100 2H2a1 1 0 100-2h1zm1.22 6.22a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm5.78-1.78a1 1 0 00-1.42 1.42l.7.7a1 1 0 001.42-1.42l-.7-.7zM10 6a4 4 0 100 8 4 4 0 000-8z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
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

        <ThemeBtn />
        <FullscreenBtn />
      </div>
    </nav>
  )
}
