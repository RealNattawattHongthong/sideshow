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
  const { blink, setBlink, presenterBlink, setPresenterBlink, blackout, setBlackout, displayBlackout, setDisplayBlackout, displayShowNow, setDisplayShowNow, displayShowNext, setDisplayShowNext, displayGreyFuture, setDisplayGreyFuture, presenterMsg, setPresenterMsg, presenterMsgOn, setPresenterMsgOn, presenterMsgBlink, setPresenterMsgBlink, presenterMsgSize, setPresenterMsgSize, triggerWoosh, wooshSchedule, setWooshSchedule, speakers, addSpeaker, updateSpeaker, removeSpeaker } = useAdmin()
  const { rundown, fetchRundown } = useOntime()
  const events = rundown.filter(e => e.type === 'event')

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="admin-title">Admin</h1>
          <button className="btn-refresh-rundown" onClick={fetchRundown} title="Refresh rundown">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4a8 8 0 0112 0M16 16a8 8 0 01-12 0"/>
              <path d="M2 10h4l-2-3M18 10h-4l2 3"/>
            </svg>
            Refresh Rundown
          </button>
        </div>
        <span className="admin-subtitle">Controls applied live to the Display page</span>
      </div>

      {/* ── Display controls ─────────────────── */}
      <section className="admin-section">
        <div className="admin-section-title">Display</div>
        <div className="admin-card">
          <div className="admin-row">
            <div className="admin-row-info">
              <div className="admin-row-name">Blink</div>
              <div className="admin-row-desc">Current session pulses on the Display page</div>
            </div>
            <button
              className={`toggle-btn ${blink ? 'toggle-on' : ''}`}
              onClick={() => setBlink(!blink)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Blackout</div>
              <div className="admin-row-desc">Black out the Display screen</div>
            </div>
            <button
              className={`toggle-btn ${displayBlackout ? 'toggle-on toggle-blackout' : ''}`}
              onClick={() => setDisplayBlackout(!displayBlackout)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Show NOW badge</div>
              <div className="admin-row-desc">Display the NOW label on the current session</div>
            </div>
            <button
              className={`toggle-btn ${displayShowNow ? 'toggle-on' : ''}`}
              onClick={() => setDisplayShowNow(!displayShowNow)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Show NEXT badge</div>
              <div className="admin-row-desc">Display the NEXT label on the upcoming session</div>
            </div>
            <button
              className={`toggle-btn ${displayShowNext ? 'toggle-on' : ''}`}
              onClick={() => setDisplayShowNext(!displayShowNext)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Grey out future</div>
              <div className="admin-row-desc">Dim sessions after NEXT to show they haven't started</div>
            </div>
            <button
              className={`toggle-btn ${displayGreyFuture ? 'toggle-on' : ''}`}
              onClick={() => setDisplayGreyFuture(!displayGreyFuture)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Woosh</div>
              <div className="admin-row-desc">Animate all rows sliding in from the right</div>
            </div>
            <button className="btn-woosh" onClick={triggerWoosh}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 10h14M11 4l6 6-6 6"/>
              </svg>
              Woosh
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info" style={{ width: '100%' }}>
              <div className="admin-row-name">Auto Woosh</div>
              <div className="admin-row-desc">Trigger woosh automatically at a set time</div>
              <div className="admin-msg-row" style={{ marginTop: 10 }}>
                <input
                  className="admin-input"
                  type="time"
                  value={wooshSchedule}
                  onChange={e => setWooshSchedule(e.target.value)}
                  style={{ width: 'auto' }}
                />
                {wooshSchedule && (
                  <button
                    className="btn-remove-photo"
                    onClick={() => setWooshSchedule('')}
                    style={{ marginLeft: 8 }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Presenter controls ────────────────── */}
      <section className="admin-section">
        <div className="admin-section-title">Presenter</div>
        <div className="admin-card">
          <div className="admin-row">
            <div className="admin-row-info">
              <div className="admin-row-name">Blink</div>
              <div className="admin-row-desc">Presenter screen pulses to alert the speaker</div>
            </div>
            <button
              className={`toggle-btn ${presenterBlink ? 'toggle-on' : ''}`}
              onClick={() => setPresenterBlink(!presenterBlink)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info">
              <div className="admin-row-name">Blackout</div>
              <div className="admin-row-desc">Black out the Presenter screen</div>
            </div>
            <button
              className={`toggle-btn ${blackout ? 'toggle-on toggle-blackout' : ''}`}
              onClick={() => setBlackout(!blackout)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="admin-row" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="admin-row-info" style={{ width: '100%' }}>
              <div className="admin-row-name">Custom Message</div>
              <div className="admin-row-desc">Type a message then press the eye button to show it</div>
              <div className="admin-msg-row">
                <input
                  className="admin-input"
                  style={{ marginTop: 8 }}
                  type="text"
                  placeholder="Type a message…"
                  value={presenterMsg}
                  onChange={e => setPresenterMsg(e.target.value)}
                />
              </div>
              <div className="admin-msg-size-row">
                <span className="admin-label">Size</span>
                <input
                  className="admin-size-slider"
                  type="range"
                  min={24}
                  max={160}
                  step={4}
                  value={presenterMsgSize}
                  onChange={e => setPresenterMsgSize(Number(e.target.value))}
                />
                <span className="admin-size-val">{presenterMsgSize}px</span>
              </div>
              <div className="admin-msg-row">
                <button
                  className={`btn-msg-toggle ${presenterMsgBlink ? 'msg-blink-on' : ''}`}
                  onClick={() => setPresenterMsgBlink(!presenterMsgBlink)}
                  title={presenterMsgBlink ? 'Stop blinking' : 'Blink message'}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v4a1 1 0 01-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z"/>
                  </svg>
                </button>
                <button
                  className={`btn-msg-toggle ${presenterMsgOn ? 'msg-on' : ''}`}
                  onClick={() => setPresenterMsgOn(!presenterMsgOn)}
                  title={presenterMsgOn ? 'Hide message' : 'Show message'}
                >
                  {presenterMsgOn ? (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
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
