import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AdminContext = createContext(null)
const KEY = 'sideshow_admin'

function load() {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : { blink: false, presenterBlink: false, blackout: false, displayBlackout: false, displayShowNow: true, displayShowNext: true, displayGreyFuture: false, presenterMsg: '', presenterMsgOn: false, presenterMsgBlink: false, presenterMsgSize: 72, wooshKey: 0, wooshSchedule: '', speakers: [] }
  } catch {
    return { blink: false, presenterBlink: false, blackout: false, displayBlackout: false, displayShowNow: true, displayShowNext: true, displayGreyFuture: false, presenterMsg: '', presenterMsgOn: false, presenterMsgBlink: false, presenterMsgSize: 72, wooshKey: 0, wooshSchedule: '', speakers: [] }
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('AdminContext: failed to save', e)
  }
}

export function AdminProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEY && e.newValue) {
        try { setState(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const patch = useCallback((next) => {
    setState(prev => {
      const merged = { ...prev, ...next }
      save(merged)
      return merged
    })
  }, [])

  const setBlink          = useCallback((v) => patch({ blink: v }),          [patch])
  const setPresenterBlink = useCallback((v) => patch({ presenterBlink: v }), [patch])
  const setBlackout        = useCallback((v) => patch({ blackout: v }),        [patch])
  const setDisplayBlackout = useCallback((v) => patch({ displayBlackout: v }), [patch])
  const setDisplayShowNow    = useCallback((v) => patch({ displayShowNow: v }),    [patch])
  const setDisplayShowNext   = useCallback((v) => patch({ displayShowNext: v }),   [patch])
  const setDisplayGreyFuture = useCallback((v) => patch({ displayGreyFuture: v }), [patch])
  const setWooshSchedule   = useCallback((v) => patch({ wooshSchedule: v }),   [patch])
  const setPresenterMsg      = useCallback((v) => patch({ presenterMsg: v }),      [patch])
  const setPresenterMsgOn    = useCallback((v) => patch({ presenterMsgOn: v }),    [patch])
  const setPresenterMsgBlink = useCallback((v) => patch({ presenterMsgBlink: v }), [patch])
  const setPresenterMsgSize  = useCallback((v) => patch({ presenterMsgSize: v }),  [patch])

  const triggerWoosh = useCallback(() => {
    setState(prev => {
      const next = { ...prev, wooshKey: (prev.wooshKey ?? 0) + 1 }
      save(next)
      return next
    })
  }, [])

  const addSpeaker = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
        speakers: [...prev.speakers, { id: crypto.randomUUID(), name: '', image: null, sessionId: '' }],
      }
      save(next)
      return next
    })
  }, [])

  const updateSpeaker = useCallback((id, fields) => {
    setState(prev => {
      const speakers = prev.speakers.map(s => s.id === id ? { ...s, ...fields } : s)
      const next = { ...prev, speakers }
      save(next)
      return next
    })
  }, [])

  const removeSpeaker = useCallback((id) => {
    setState(prev => {
      const speakers = prev.speakers.filter(s => s.id !== id)
      const next = { ...prev, speakers }
      save(next)
      return next
    })
  }, [])

  return (
    <AdminContext.Provider value={{
      blink: state.blink,
      presenterBlink: state.presenterBlink ?? false,
      blackout: state.blackout ?? false,
      displayBlackout: state.displayBlackout ?? false,
      displayShowNow: state.displayShowNow ?? true,
      displayShowNext: state.displayShowNext ?? true,
      displayGreyFuture: state.displayGreyFuture ?? false,
      wooshSchedule: state.wooshSchedule ?? '',
      presenterMsg: state.presenterMsg ?? '',
      presenterMsgOn: state.presenterMsgOn ?? false,
      presenterMsgBlink: state.presenterMsgBlink ?? false,
      presenterMsgSize: state.presenterMsgSize ?? 72,
      wooshKey: state.wooshKey ?? 0,
      speakers: state.speakers,
      setBlink,
      setPresenterBlink,
      setBlackout,
      setDisplayBlackout,
      setDisplayShowNow,
      setDisplayShowNext,
      setDisplayGreyFuture,
      setWooshSchedule,
      setPresenterMsg,
      setPresenterMsgOn,
      setPresenterMsgBlink,
      setPresenterMsgSize,
      triggerWoosh,
      addSpeaker,
      updateSpeaker,
      removeSpeaker,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
