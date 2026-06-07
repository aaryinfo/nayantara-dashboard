'use client'

import { useEffect, useState } from 'react'

export function HeaderDate() {
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const d = new Date()
    const str = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    setDateStr(str)
  }, [])

  if (!dateStr) return null

  return (
    <div className="hdate">
      {dateStr}
    </div>
  )
}
