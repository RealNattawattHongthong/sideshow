import { useEffect, useRef } from 'react'
import { useOntime } from '../context/OntimeContext'
import { msToHHMM, formatDuration } from '../utils/time'
import './Rundown.css'

function SpecialRow({ item }) {
  if (item.type === 'block') {
    return (
      <tr className="rundown-block-row">
        <td colSpan={7}>
          <span className="block-title">{item.title || 'Block'}</span>
        </td>
      </tr>
    )
  }
  if (item.type === 'delay') {
    return (
      <tr className="rundown-delay-row">
        <td colSpan={7}>
          <span className="delay-label">DELAY</span>
          <span className="delay-value">+{formatDuration(item.duration)}</span>
        </td>
      </tr>
    )
  }
  return null
}

export default function Rundown() {
  const { runtimeState, rundown, connected, fetchRundown, selectedEventId, nextEventId } = useOntime()
  const selectedRef = useRef(null)

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedEventId])

  const events = rundown.filter(e => e.type === 'event')

  return (
    <div className="page rundown-page">
      <div className="rundown-header">
        <div className="rundown-header-left">
          <h1 className="page-title">Rundown</h1>
          <span className="rundown-count">{events.length} events</span>
        </div>
        <button className="btn-refresh" onClick={fetchRundown} title="Refresh rundown">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Refresh
        </button>
      </div>

      {!connected && (
        <div className="offline-banner">
          Not connected to OnTime — go to Settings to configure the server address.
        </div>
      )}

      <div className="rundown-table-wrap">
        <table className="rundown-table">
          <thead>
            <tr>
              <th className="col-index">#</th>
              <th className="col-cue">Cue</th>
              <th className="col-title">Title</th>
              <th className="col-presenter">Presenter</th>
              <th className="col-start">Start</th>
              <th className="col-end">End</th>
              <th className="col-duration">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rundown.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  {connected ? 'No events in rundown' : 'Waiting for connection…'}
                </td>
              </tr>
            )}
            {rundown.map((item, idx) => {
              if (item.type !== 'event') {
                return <SpecialRow key={item.id ?? idx} item={item} />
              }

              const isCurrent = item.id === selectedEventId
              const isNext = item.id === nextEventId
              const eventIndex = rundown.slice(0, idx + 1).filter(e => e.type === 'event').length

              let rowClass = 'rundown-row'
              if (isCurrent) rowClass += ' row-current'
              else if (isNext) rowClass += ' row-next'

              return (
                <tr
                  key={item.id ?? idx}
                  className={rowClass}
                  ref={isCurrent ? selectedRef : null}
                >
                  <td className="col-index">
                    {isCurrent ? (
                      <span className="playing-icon">▶</span>
                    ) : isNext ? (
                      <span className="next-icon">›</span>
                    ) : (
                      <span className="row-num">{eventIndex}</span>
                    )}
                  </td>
                  <td className="col-cue">
                    <span className="cue-badge">{item.cue || '—'}</span>
                  </td>
                  <td className="col-title">
                    <div className="title-cell">
                      {item.colour && <span className="color-dot" style={{ background: item.colour }} />}
                      <div>
                        <div className="event-title">{item.title || '—'}</div>
                        {item.subtitle && <div className="event-subtitle">{item.subtitle}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="col-presenter">{item.presenter || '—'}</td>
                  <td className="col-start mono">{msToHHMM(item.timeStart)}</td>
                  <td className="col-end mono">{msToHHMM(item.timeEnd)}</td>
                  <td className="col-duration mono">{formatDuration(item.duration)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
