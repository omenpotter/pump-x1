'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

export default function LazySection({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const ref  = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShow(true); io.disconnect() } },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {show ? children : (fallback ?? <div style={{ minHeight: 320 }} />)}
    </div>
  )
}
