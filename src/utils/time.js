export function msToClock(ms) {
  if (ms == null) return '--:--:--'
  const sign = ms < 0 ? '-' : ''
  const abs = Math.abs(ms)
  const totalSec = Math.floor(abs / 1000)
  const h = Math.floor(totalSec / 3600) % 24
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return sign + [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function msToCountdown(ms) {
  if (ms == null) return '--:--'
  const sign = ms < 0 ? '-' : ''
  const abs = Math.abs(ms)
  const totalSec = Math.floor(abs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return sign + [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
  }
  return sign + [m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function msToHHMM(ms) {
  if (ms == null) return '--:--'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600) % 24
  const m = Math.floor((totalSec % 3600) / 60)
  return [h, m].map(v => String(v).padStart(2, '0')).join(':')
}

export function formatDuration(ms) {
  if (ms == null || ms === 0) return '0m'
  const totalSec = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0 && s > 0) return `${m}m ${s}s`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function progressPercent(elapsed, duration) {
  if (!duration || duration === 0) return 0
  const pct = (elapsed / duration) * 100
  return Math.min(100, Math.max(0, pct))
}
