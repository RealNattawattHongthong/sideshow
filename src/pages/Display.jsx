import { useEffect, useRef, useCallback } from 'react'
import { useOntime } from '../context/OntimeContext'
import { useAdmin } from '../context/AdminContext'
import './Display.css'

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

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

export default function Display({ kiosk = false }) {
  const { rundown, runtimeState, connected, selectedEventId, nextEventId } = useOntime()
  const { blink, speakers, wooshKey, wooshSchedule, triggerWoosh, displayBlackout, displayShowNow, displayShowNext, displayGreyFuture } = useAdmin()

  const events     = rundown.filter(e => e.type === 'event')
  const currentIdx = events.findIndex(e => e.id === selectedEventId)
  const nextIdx    = events.findIndex(e => e.id === nextEventId)
  const isOnAir    = runtimeState?.onAir

  const canvasRef = useRef(null)

  useEffect(() => {
    if (!wooshSchedule) return
    const check = () => {
      const hhmm = nowHHMM()
      if (hhmm === wooshSchedule) {
        const firedKey = `woosh_auto_${hhmm}`
        if (!sessionStorage.getItem(firedKey)) {
          sessionStorage.setItem(firedKey, '1')
          triggerWoosh()
        }
      }
    }
    check()
    const id = setInterval(check, 10000)
    return () => clearInterval(id)
  }, [wooshSchedule, triggerWoosh])


  return (
    <div className={`display-shell${kiosk ? ' display-kiosk' : ''}`}>
      <div className="display-canvas" ref={canvasRef}>

        <div className={`disp-blackout ${displayBlackout ? 'disp-blackout--on' : ''}`} />

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

        {/* Event table */}
        <div className="disp-list">
          {events.length === 0 ? (
            <div className="disp-empty">
              {connected ? 'No events loaded' : 'Not connected to OnTime'}
            </div>
          ) : (
            <table className="disp-table">
              <thead>
                <tr>
                  <th className="dt-th dt-col-num">#</th>
                  <th className="dt-th dt-col-session">Session</th>
                  <th className="dt-th dt-col-speaker">Speaker</th>
                  <th className="dt-th dt-col-status"></th>
                </tr>
              </thead>
              <tbody key={wooshKey}>
                {events.map((event, idx) => {
                  const isCurrent   = event.id === selectedEventId
                  const isNext      = event.id === nextEventId
                  const isPast      = currentIdx > -1 && idx < currentIdx
                  const rowSpeakers = speakers.filter(s => s.sessionId === event.id && (s.name || s.image))

                  const isFuture = displayGreyFuture && !isCurrent && !isNext && !isPast && nextIdx > -1 && idx > nextIdx

                  let cls = 'dt-row'
                  if (isCurrent && displayShowNow)    cls += blink ? ' dr-current dr-blink' : ' dr-current'
                  else if (isNext && displayShowNext) cls += ' dr-next'
                  else if (isPast)                    cls += ' dr-past'
                  else if (isFuture)                  cls += ' dr-future'

                  return (
                    <tr
                      key={event.id}
                      className={cls}

                      style={{ '--row-delay': `${idx * 0.12}s` }}
                    >
                      <td className="dt-td dt-col-num">
                        {isCurrent
                          ? <span className="dr-dot" />
                          : <span className="dr-num">{idx + 1}</span>
                        }
                      </td>
                      <td className="dt-td dt-col-session">
                        <div className="dr-title">{event.title || '—'}</div>
                        {event.subtitle && <div className="dr-sub">{event.subtitle}</div>}
                      </td>
                      <td className="dt-td dt-col-speaker">
                        {rowSpeakers.length > 0 ? (
                          <div className="dr-speakers">
                            {rowSpeakers.map(s => (
                              <div key={s.id} className="dr-speaker">
                                <div className="dr-speaker-photo">
                                  {s.image
                                    ? <img src={s.image} alt={s.name || 'Speaker'} />
                                    : <svg viewBox="0 0 32 32" fill="currentColor"><circle cx="16" cy="11" r="6"/><path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12"/></svg>
                                  }
                                </div>
                                {s.name && <span className="dr-speaker-name">{s.name}</span>}
                              </div>
                            ))}
                          </div>
                        ) : event.presenter ? (
                          <span className="dt-presenter">{event.presenter}</span>
                        ) : null}
                      </td>
                      <td className="dt-td dt-col-status">
                        {isCurrent && displayShowNow  && <span className="dr-badge dr-badge-now">NOW</span>}
                        {isNext    && displayShowNext && <span className="dr-badge dr-badge-next">NEXT</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
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
