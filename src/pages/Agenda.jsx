import { useEffect, useRef, useState, useMemo } from 'react'
import { useOntime } from '../context/OntimeContext'
import { msToCountdown } from '../utils/time'
import './Agenda.css'

const CARD_W = 300
const CARD_GAP = 16

const FILTER_OPTIONS = [
  { value: 'all',       label: 'All Sessions' },
  { value: 'upcoming',  label: 'Remaining' },
  { value: 'done',      label: 'Done' },
]

const VIEW_OPTIONS = [
  { value: 'normal',  label: 'Normal' },
  { value: 'compact', label: 'Compact' },
  { value: 'focus',   label: 'Focus' },
]

function Dropdown({ value, options, onChange }) {
  return (
    <div className="dd-wrap">
      <select className="dd-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="dd-arrow" viewBox="0 0 10 6" fill="none">
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function Agenda() {
  const { rundown, runtimeState, connected, selectedEventId, nextEventId } = useOntime()

  const timer = runtimeState?.timer
  const isOvertime = (timer?.current ?? 0) < 0
  const isWarning  = !isOvertime && (timer?.current ?? Infinity) < 300_000
  const isDanger   = !isOvertime && (timer?.current ?? Infinity) < 60_000

  const [filter, setFilter] = useState('all')
  const [view,   setView]   = useState('normal')

  const events = rundown.filter(e => e.type === 'event')
  const currentIndex = events.findIndex(e => e.id === selectedEventId)

  const filteredEvents = useMemo(() => {
    if (filter === 'upcoming') return events.filter((_, i) => i >= currentIndex)
    if (filter === 'done')     return events.filter((_, i) => i < currentIndex)
    return events
  }, [events, filter, currentIndex])

  // Track index in filtered list
  const filteredCurrentIndex = filteredEvents.findIndex(e => e.id === selectedEventId)

  const prevIdRef = useRef(selectedEventId)
  const [sliding, setSliding] = useState(false)

  useEffect(() => {
    if (prevIdRef.current !== selectedEventId && selectedEventId) {
      setSliding(true)
      const t = setTimeout(() => setSliding(false), 600)
      prevIdRef.current = selectedEventId
      return () => clearTimeout(t)
    }
  }, [selectedEventId])

  const containerW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const centerOffset = Math.floor(containerW / 2) - Math.floor(CARD_W / 2)
  const translateX = centerOffset - filteredCurrentIndex * (CARD_W + CARD_GAP)

  const isCompact = view === 'compact'
  const isFocus   = view === 'focus'

  return (
    <div className="agenda-page">
      {/* Toolbar */}
      <div className="agenda-toolbar">
        <span className="agenda-toolbar-title">Agenda</span>
        <div className="agenda-toolbar-controls">
          <Dropdown value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
          <Dropdown value={view}   options={VIEW_OPTIONS}   onChange={setView} />
        </div>
        <div className="agenda-toolbar-right">
          {!connected && <span className="badge-offline">OFFLINE</span>}
          {runtimeState?.onAir && <span className="badge-onair">● ON AIR</span>}
        </div>
      </div>

      {/* Scrolling stage */}
      <div className="agenda-viewport">
        <div
          className={`agenda-track ${sliding ? 'is-sliding' : ''}`}
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {filteredEvents.map((event, idx) => {
            if (isFocus && event.id !== selectedEventId && event.id !== nextEventId) return null

            const isCurrent = event.id === selectedEventId
            const isNext    = event.id === nextEventId
            const isPast    = filteredCurrentIndex > -1 && idx < filteredCurrentIndex

            let stateClass = ''
            if (isCurrent) {
              stateClass = isOvertime ? 'card-overtime'
                : isDanger  ? 'card-danger'
                : isWarning ? 'card-warning'
                : 'card-current'
            } else if (isNext) {
              stateClass = 'card-next'
            } else if (isPast) {
              stateClass = 'card-past'
            }

            return (
              <div
                key={event.id}
                className={`agenda-card ${stateClass} ${isCompact ? 'is-compact' : ''}`}
                style={event.colour ? { '--accent': event.colour } : {}}
              >
                {/* Index bubble */}
                <div className="ac-index">{idx + 1}</div>

                <div className="ac-body">
                  <div className="ac-title">{event.title || '—'}</div>
                  {!isCompact && event.subtitle && (
                    <div className="ac-subtitle">{event.subtitle}</div>
                  )}
                  {!isCompact && event.presenter && (
                    <div className="ac-presenter">
                      <svg viewBox="0 0 14 14" fill="currentColor">
                        <circle cx="7" cy="4.5" r="2.5" />
                        <path d="M1.5 12c0-3.038 2.462-5.5 5.5-5.5S12.5 8.962 12.5 12" />
                      </svg>
                      {event.presenter}
                    </div>
                  )}
                </div>

                {isCurrent && (
                  <div className={`ac-countdown ${isOvertime ? 'is-over' : ''}`}>
                    {msToCountdown(timer?.current)}
                  </div>
                )}
                {isNext && <div className="ac-next-chip">NEXT</div>}
              </div>
            )
          })}

          {filteredEvents.length === 0 && (
            <div className="agenda-empty">
              {connected ? 'No sessions to show' : 'Waiting for connection…'}
            </div>
          )}
        </div>

        <div className="agenda-focus-ring" />
      </div>

      {/* Bottom bar */}
      {runtimeState?.eventNow && (
        <div className="agenda-bar">
          <div className="abar-section abar-now">
            <span className="abar-label">NOW</span>
            <span className="abar-text">{runtimeState.eventNow.title}</span>
          </div>
          <div className={`abar-timer ${isOvertime ? 'is-over' : isDanger ? 'is-danger' : isWarning ? 'is-warn' : ''}`}>
            {msToCountdown(timer?.current)}
          </div>
          <div className="abar-section abar-next">
            {runtimeState?.eventNext && (
              <>
                <span className="abar-label">NEXT</span>
                <span className="abar-text">{runtimeState.eventNext.title}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
