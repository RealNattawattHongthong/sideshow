import { useOntime } from '../context/OntimeContext'
import { msToClock, msToCountdown, msToHHMM, progressPercent } from '../utils/time'
import './NowNext.css'

function EventCard({ label, event, timer, isActive }) {
  if (!event) {
    return (
      <div className={`event-card ${isActive ? 'card-active' : 'card-next'} card-empty`}>
        <div className="card-label">{label}</div>
        <div className="card-placeholder">No event loaded</div>
      </div>
    )
  }

  const progress = isActive ? progressPercent(timer?.elapsed, timer?.duration) : 0

  return (
    <div
      className={`event-card ${isActive ? 'card-active' : 'card-next'}`}
      style={event.colour ? { '--accent': event.colour } : {}}
    >
      <div className="card-label">{label}</div>

      {event.cue && <div className="card-cue">{event.cue}</div>}

      <div className="card-title">{event.title || '—'}</div>
      {event.subtitle && <div className="card-subtitle">{event.subtitle}</div>}

      {event.presenter && (
        <div className="card-presenter">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="5" r="3" />
            <path d="M2 13c0-3.314 2.686-6 6-6s6 2.686 6 6" />
          </svg>
          {event.presenter}
        </div>
      )}

      <div className="card-divider" />

      {isActive && (
        <>
          <div className={`card-timer ${(timer?.current ?? 0) < 0 ? 'timer-overtime' : ''}`}>
            {msToCountdown(timer?.current)}
          </div>
          {timer?.duration > 0 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
          <div className="card-times">
            <span>{msToHHMM(event.timeStart)}</span>
            <span className="times-arrow">→</span>
            <span>{msToHHMM(event.timeEnd)}</span>
          </div>
        </>
      )}

      {!isActive && (
        <div className="card-scheduled">
          <div className="scheduled-label">Scheduled</div>
          <div className="scheduled-time">{msToHHMM(event.timeStart)}</div>
        </div>
      )}
    </div>
  )
}

export default function NowNext() {
  const { runtimeState, connected, playback } = useOntime()

  const eventNow = runtimeState?.eventNow
  const eventNext = runtimeState?.eventNext
  const timer = runtimeState?.timer
  const clock = timer?.clock
  const isOnAir = runtimeState?.onAir

  return (
    <div className="page nownext-page">
      <div className="nownext-topbar">
        <div className="clock-display">{msToClock(clock)}</div>
        {isOnAir && <div className="onair-badge">● ON AIR</div>}
      </div>

      {!connected && (
        <div className="offline-banner">
          Not connected to OnTime — go to Settings to configure the server address.
        </div>
      )}

      <div className="nownext-grid">
        <EventCard label="● NOW" event={eventNow} timer={timer} isActive />
        <EventCard label="NEXT" event={eventNext} timer={timer} isActive={false} />
      </div>

      {runtimeState?.message?.timer?.visible && runtimeState.message.timer.text && (
        <div className="message-bar timer-message">
          <span className="message-icon">▸</span>
          {runtimeState.message.timer.text}
        </div>
      )}
    </div>
  )
}
