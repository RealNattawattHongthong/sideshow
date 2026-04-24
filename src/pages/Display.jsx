import { useEffect, useRef, useCallback } from 'react'
import { useOntime } from '../context/OntimeContext'
import { useAdmin } from '../context/AdminContext'
import './Display.css'

function FullscreenBtn({ canvasRef }) {
  const toggle = useCallback(() => {
    if (!document.fullscreenElement) canvasRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }, [canvasRef])

  return (
    <button className="disp-fs-btn" onClick={toggle} title="Enter fullscreen">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function Display() {
  const { rundown, runtimeState, connected, selectedEventId, nextEventId } = useOntime()
  const { blink, speakers } = useAdmin()

  const events     = rundown.filter(e => e.type === 'event')
  const currentIdx = events.findIndex(e => e.id === selectedEventId)
  const isOnAir    = runtimeState?.onAir

  const currentRef = useRef(null)
  const canvasRef  = useRef(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedEventId])

  return (
    <div className="display-shell">
      <div className="display-canvas" ref={canvasRef}>

        {/* Header */}
        <div className="disp-header">
          <div className="disp-header-left">
            <svg className="disp-logo-icon" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
              <rect x="12" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4"/>
              <rect x="1" y="12" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4"/>
              <rect x="12" y="12" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
            </svg>
            <span className="disp-show-title">SESSION SCHEDULE</span>
          </div>
          <div className="disp-header-right">
            {isOnAir && <span className="disp-onair">● LIVE</span>}
            <FullscreenBtn canvasRef={canvasRef} />
          </div>
        </div>

        {/* Event list */}
        <div className="disp-list">
          {events.length === 0 && (
            <div className="disp-empty">
              {connected ? 'No events loaded' : 'Not connected to OnTime'}
            </div>
          )}

          {events.map((event, idx) => {
            const isCurrent = event.id === selectedEventId
            const isNext    = event.id === nextEventId
            const isPast    = currentIdx > -1 && idx < currentIdx
            const rowSpeakers = speakers.filter(s => s.sessionId === event.id && (s.name || s.image))

            let cls = 'disp-row'
            if (isCurrent)   cls += blink ? ' dr-current dr-blink' : ' dr-current'
            else if (isNext) cls += ' dr-next'
            else if (isPast) cls += ' dr-past'

            return (
              <div
                key={event.id}
                className={cls}
                ref={isCurrent ? currentRef : null}
                style={event.colour ? { '--rc': event.colour } : {}}
              >
                <div className="dr-left">
                  {isCurrent
                    ? <span className={`dr-dot ${blink ? 'dr-dot-blink' : ''}`} />
                    : <span className="dr-num">{idx + 1}</span>
                  }
                </div>

                <div className="dr-content">
                  <div className="dr-title">{event.title || '—'}</div>
                  {event.subtitle  && <div className="dr-sub">{event.subtitle}</div>}
                  {event.presenter && (
                    <div className="dr-presenter">
                      <svg viewBox="0 0 12 12" fill="currentColor">
                        <circle cx="6" cy="4" r="2"/>
                        <path d="M1 11c0-2.761 2.239-5 5-5s5 2.239 5 5"/>
                      </svg>
                      {event.presenter}
                    </div>
                  )}
                  {rowSpeakers.length > 0 && (
                    <div className="dr-speakers">
                      {rowSpeakers.map(s => (
                        <div key={s.id} className="dr-speaker">
                          <div className="dr-speaker-photo">
                            {s.image
                              ? <img src={s.image} alt={s.name || 'Speaker'} />
                              : (
                                <svg viewBox="0 0 32 32" fill="currentColor">
                                  <circle cx="16" cy="11" r="6" />
                                  <path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" />
                                </svg>
                              )
                            }
                          </div>
                          {s.name && <span className="dr-speaker-name">{s.name}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dr-right">
                  {isCurrent && <span className="dr-badge dr-badge-now">NOW</span>}
                  {isNext    && <span className="dr-badge dr-badge-next">NEXT</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="disp-footer">
          <div className={`disp-conn ${connected ? 'conn-ok' : 'conn-err'}`}>
            <span className="disp-conn-dot" />
            {connected ? 'Live' : 'Disconnected'}
          </div>
          <div className="disp-powered">Sideshow · OnTime</div>
        </div>

      </div>
    </div>
  )
}
