import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const OntimeContext = createContext(null)
const STORAGE_KEY = 'ontime_config'

export function OntimeProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : { host: '82.26.104.52', port: 4001 }
    } catch {
      return { host: '82.26.104.52', port: 4001 }
    }
  })

  const [runtimeState, setRuntimeState] = useState(null)
  const [rundown, setRundown] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  const { host, port } = config

  const fetchRundown = useCallback(async () => {
    try {
      const res = await fetch(`http://${host}:${port}/data/rundowns/current`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Flatten entries via flatOrder
      const flat = (data.flatOrder ?? [])
        .map(id => data.entries?.[id])
        .filter(Boolean)
      setRundown(flat)
    } catch (e) {
      console.warn('Rundown fetch failed:', e.message)
    }
  }, [host, port])

  useEffect(() => {
    let ws
    let reconnectTimer
    let alive = true

    function connect() {
      if (!alive) return
      try {
        ws = new WebSocket(`ws://${host}:${port}/ws`)
        wsRef.current = ws

        ws.onopen = () => {
          if (!alive) return
          setConnected(true)
          fetchRundown()
        }

        ws.onclose = () => {
          if (!alive) return
          setConnected(false)
          reconnectTimer = setTimeout(connect, 3000)
        }

        ws.onerror = () => {
          setConnected(false)
        }

        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            // OnTime v4 uses tag:'runtime-data' and sends partial updates
            if (msg.tag === 'runtime-data') {
              setRuntimeState(prev => prev ? { ...prev, ...msg.payload } : msg.payload)
            }
          } catch {}
        }
      } catch {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      alive = false
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [host, port, fetchRundown])

  function updateConfig(next) {
    const merged = { ...config, ...next }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    setConfig(merged)
  }

  // Normalised helpers so pages don't need to know the v4 nesting
  const playback = runtimeState?.timer?.playback ?? 'stop'
  const selectedEventId = runtimeState?.eventNow?.id ?? null
  const nextEventId = runtimeState?.eventNext?.id ?? null
  const selectedEventIndex = runtimeState?.rundown?.selectedEventIndex ?? null

  return (
    <OntimeContext.Provider value={{
      runtimeState,
      rundown,
      connected,
      config,
      updateConfig,
      fetchRundown,
      // Normalised shortcuts
      playback,
      selectedEventId,
      nextEventId,
      selectedEventIndex,
    }}>
      {children}
    </OntimeContext.Provider>
  )
}

export function useOntime() {
  return useContext(OntimeContext)
}
