import { useEffect, useState } from 'react'

/** Continuous decorative motion is opt-in when the OS requests reduced motion. */
export function useOrbitalMotion() {
  const [motion, setMotion] = useState(() => typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (media.matches) setMotion(false) }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return { motion, setMotion }
}
