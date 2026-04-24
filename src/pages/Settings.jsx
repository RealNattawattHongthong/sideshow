import { useState } from 'react'
import { useOntime } from '../context/OntimeContext'
import './Settings.css'

export default function Settings() {
  const { config, updateConfig, connected, fetchRundown } = useOntime()
  const [host, setHost] = useState(config.host)
  const [port, setPort] = useState(String(config.port))
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    const p = parseInt(port, 10)
    if (!host.trim() || isNaN(p) || p < 1 || p > 65535) return
    updateConfig({ host: host.trim(), port: p })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-section">
        <div className="section-title">OnTime Server</div>
        <div className="section-desc">
          Configure the address of your OnTime server. The app connects via WebSocket (port 4001 by default).
        </div>

        <form className="settings-form" onSubmit={handleSave}>
          <div className="form-row">
            <label className="form-label" htmlFor="host">Host</label>
            <input
              id="host"
              className="form-input"
              type="text"
              value={host}
              onChange={e => setHost(e.target.value)}
              placeholder="localhost"
              spellCheck={false}
            />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="port">Port</label>
            <input
              id="port"
              className="form-input form-input-sm"
              type="number"
              value={port}
              onChange={e => setPort(e.target.value)}
              min={1}
              max={65535}
              placeholder="4001"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {saved ? '✓ Saved' : 'Apply & Reconnect'}
            </button>
            <button type="button" className="btn-secondary" onClick={fetchRundown}>
              Refresh Rundown
            </button>
          </div>
        </form>
      </div>

      <div className="settings-section">
        <div className="section-title">Connection Status</div>
        <div className="status-card">
          <div className={`status-indicator ${connected ? 'status-ok' : 'status-err'}`}>
            <span className="status-dot-lg" />
            <div>
              <div className="status-main">{connected ? 'Connected' : 'Disconnected'}</div>
              <div className="status-sub">
                {connected
                  ? `ws://${config.host}:${config.port}/ws`
                  : 'Attempting to reconnect every 3 seconds…'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">Pages</div>
        <div className="pages-list">
          <div className="page-item">
            <div className="page-item-name">Rundown</div>
            <div className="page-item-desc">Full schedule table — all events with current highlighted</div>
            <a href="/rundown" className="page-item-link">Open →</a>
          </div>
          <div className="page-item">
            <div className="page-item-name">Now &amp; Next</div>
            <div className="page-item-desc">Two-panel view of the current and upcoming event with live timer</div>
            <a href="/now-next" className="page-item-link">Open →</a>
          </div>
          <div className="page-item">
            <div className="page-item-name">Presenter</div>
            <div className="page-item-desc">Full-screen presenter view — large title and countdown timer</div>
            <a href="/presenter" className="page-item-link">Open →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
