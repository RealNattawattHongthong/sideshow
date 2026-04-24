import { createContext, useContext, useState, useCallback } from 'react'

const AdminContext = createContext(null)
const KEY = 'sideshow_admin'

function load() {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : { blink: false, speakers: [] }
  } catch {
    return { blink: false, speakers: [] }
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function AdminProvider({ children }) {
  const [state, setState] = useState(load)

  const patch = useCallback((next) => {
    setState(prev => {
      const merged = { ...prev, ...next }
      save(merged)
      return merged
    })
  }, [])

  const setBlink = useCallback((v) => patch({ blink: v }), [patch])

  const addSpeaker = useCallback(() => {
    patch({
      speakers: [
        ...state.speakers,
        { id: crypto.randomUUID(), name: '', image: null, sessionId: '' },
      ],
    })
  }, [state.speakers, patch])

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
      speakers: state.speakers,
      setBlink,
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
