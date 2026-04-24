import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { OntimeProvider } from './context/OntimeContext'
import { AdminProvider } from './context/AdminContext'
import Nav from './components/Nav'
import Rundown from './pages/Rundown'
import Agenda from './pages/Agenda'
import NowNext from './pages/NowNext'
import Presenter from './pages/Presenter'
import Display from './pages/Display'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import './App.css'

function AppInner() {
  const [searchParams] = useSearchParams()
  const kiosk = searchParams.has('kiosk')

  return (
    <>
      {!kiosk && <Nav />}
      <Routes>
        <Route path="/" element={<Navigate to="/agenda" replace />} />
        <Route path="/rundown"   element={<Rundown />} />
        <Route path="/agenda"    element={<Agenda />} />
        <Route path="/now-next"  element={<NowNext />} />
        <Route path="/presenter" element={<Presenter />} />
        <Route path="/display"   element={<Display kiosk={kiosk} />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <OntimeProvider>
      <AdminProvider>
        <HashRouter>
          <AppInner />
        </HashRouter>
      </AdminProvider>
    </OntimeProvider>
  )
}
