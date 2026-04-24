import { useRef } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useOntime } from '../context/OntimeContext'
import './Admin.css'

/* Resize an image file to a square data-URL ≤ maxPx */
async function resizeImage(file, maxPx = 240) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function SpeakerCard({ speaker, onUpdate, onRemove, events }) {
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    onUpdate({ image: dataUrl })
  }

  return (
    <div className="speaker-card">
      {/* Photo area */}
      <div
        className="speaker-photo"
        onClick={() => fileRef.current?.click()}
        title="Click to upload photo"
      >
        {speaker.image ? (
          <img src={speaker.image} alt={speaker.name || 'Speaker'} />
        ) : (
          <div className="speaker-photo-placeholder">
            <svg viewBox="0 0 32 32" fill="currentColor">
              <circle cx="16" cy="11" r="6" />
              <path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" />
            </svg>
            <span>Photo</span>
          </div>
        )}
        <div className="speaker-photo-overlay">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 13l4-4 3 3 4-4 3 3" />
            <rect x="2" y="2" width="16" height="16" rx="2" />
          </svg>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Fields */}
      <div className="speaker-fields">
        <label className="admin-label">Name</label>
        <input
          className="admin-input"
          type="text"
          placeholder="Speaker name"
          value={speaker.name}
          onChange={e => onUpdate({ name: e.target.value })}
        />

        <label className="admin-label" style={{ marginTop: 4 }}>Session</label>
        <select
          className="admin-input admin-select"
          value={speaker.sessionId ?? ''}
          onChange={e => onUpdate({ sessionId: e.target.value })}
        >
          <option value="">— No session —</option>
          {events.map((ev, idx) => (
            <option key={ev.id} value={ev.id}>
              {idx + 1}. {ev.title || '(untitled)'}
            </option>
          ))}
        </select>

        {speaker.image && (
          <button
            className="btn-remove-photo"
            onClick={() => onUpdate({ image: null })}
          >
            Remove photo
          </button>
        )}
      </div>

      {/* Remove button */}
      <button className="speaker-remove" onClick={onRemove} title="Remove speaker">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function Admin() {
  const { blink, setBlink, speakers, addSpeaker, updateSpeaker, removeSpeaker } = useAdmin()
  const { rundown } = useOntime()
  const events = rundown.filter(e => e.type === 'event')

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin</h1>
        <span className="admin-subtitle">Controls applied live to the Display page</span>
      </div>

      {/* ── Display controls ─────────────────── */}
      <section className="admin-section">
        <div className="admin-section-title">Display Controls</div>

        <div className="admin-card">
          <div className="admin-row">
            <div className="admin-row-info">
              <div className="admin-row-name">Blink</div>
              <div className="admin-row-desc">Current session pulses with a green glow on the Display page</div>
            </div>
            <button
              className={`toggle-btn ${blink ? 'toggle-on' : ''}`}
              onClick={() => setBlink(!blink)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Speakers ─────────────────────────── */}
      <section className="admin-section">
        <div className="admin-section-header">
          <div className="admin-section-title">Speakers</div>
          <span className="admin-section-hint">Shown on the Display page</span>
        </div>

        <div className="speakers-list">
          {speakers.length === 0 && (
            <div className="speakers-empty">No speakers added yet</div>
          )}
          {speakers.map(s => (
            <SpeakerCard
              key={s.id}
              speaker={s}
              events={events}
              onUpdate={fields => updateSpeaker(s.id, fields)}
              onRemove={() => removeSpeaker(s.id)}
            />
          ))}
        </div>

        <button className="btn-add-speaker" onClick={addSpeaker}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          Add Speaker
        </button>
      </section>
    </div>
  )
}
