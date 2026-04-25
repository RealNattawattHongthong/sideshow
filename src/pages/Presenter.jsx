import { useOntime } from '../context/OntimeContext'
import { useAdmin } from '../context/AdminContext'
import { msToClock, msToCountdown, msToHHMM } from '../utils/time'
import './Presenter.css'

export default function Presenter() {
  const { runtimeState, connected, playback } = useOntime()
  const { blackout, presenterBlink, presenterMsg, presenterMsgOn, presenterMsgBlink, presenterMsgSize } = useAdmin()

  const event = runtimeState?.eventNow
  const nextEvent = runtimeState?.eventNext
  const timer = runtimeState?.timer
  const isOvertime = (timer?.current ?? 0) < 0
  const isOnAir = runtimeState?.onAir
  const clock = timer?.clock

  return (
    <div className={`presenter-page ${isOvertime ? 'is-overtime' : ''}`}>
      {blackout && <div className="presenter-blackout" />}
      {presenterMsgOn && presenterMsg && !blackout && (
        <div className="presenter-msg" style={{ fontSize: presenterMsgSize }}>
          <span className={presenterMsgBlink ? 'msg-text-blink' : ''}>{presenterMsg}</span>
        </div>
      )}
      <div className="presenter-topbar">
        <div className="presenter-clock">{msToClock(clock)}</div>
        <div className="presenter-indicators">
          {isOnAir && <span className="p-badge onair">● ON AIR</span>}
          {playback === 'pause' && <span className="p-badge paused">⏸ PAUSED</span>}
          {playback === 'stop' && <span className="p-badge stopped">■ STOPPED</span>}
          {!connected && <span className="p-badge offline">OFFLINE</span>}
        </div>
      </div>

      {event ? (
        <div className="presenter-main">
          <div className="presenter-meta">
            {event.cue && <span className="presenter-cue">{event.cue}</span>}
          </div>
          <div className="presenter-title">{event.title || '—'}</div>
          {event.subtitle && <div className="presenter-subtitle">{event.subtitle}</div>}
          {event.presenter && (
            <div className="presenter-name">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="5" r="3" />
                <path d="M2 13c0-3.314 2.686-6 6-6s6 2.686 6 6" />
              </svg>
              {event.presenter}
            </div>
          )}
          <div
            className={`presenter-timer ${isOvertime ? 'timer-over' : ''} ${presenterBlink && !isOvertime ? 'timer-blink' : ''}`}
            style={event.colour && !isOvertime ? { color: event.colour } : {}}
          >
            {msToCountdown(timer?.current)}
          </div>
          <div className="presenter-schedule">
            <span>{msToHHMM(event.timeStart)}</span>
            <span className="sched-sep">→</span>
            <span>{msToHHMM(event.timeEnd)}</span>
          </div>
        </div>
      ) : (
        <div className="presenter-idle">
          <div className="idle-label">No event running</div>
          {!connected && <div className="idle-sub">Connect to OnTime in Settings</div>}
        </div>
      )}

      {nextEvent && (
        <div className="presenter-footer">
          <span className="footer-label">NEXT</span>
          {nextEvent.cue && <span className="footer-cue">{nextEvent.cue}</span>}
          <span className="footer-title">{nextEvent.title}</span>
          {nextEvent.presenter && (
            <>
              <span className="footer-sep">·</span>
              <span className="footer-presenter">{nextEvent.presenter}</span>
            </>
          )}
          <span className="footer-time">{msToHHMM(nextEvent.timeStart)}</span>
        </div>
      )}
    </div>
  )
}
