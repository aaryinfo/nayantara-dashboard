'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TopNav({ role }: { role?: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: '📊 Dashboard', path: '/dashboard' },
    { name: '➕ Add Entry', path: '/entry' },
    { name: '📋 Ledger', path: '/ledger' },
    { name: '📄 Reports', path: '/reports' },
    { name: '🎯 Budget', path: '/budget' },
    { name: '⚙️ Settings', path: '/settings' },
  ]

  if (role === 'admin') {
    navItems.push({ name: '👥 Users', path: '/admin/users' })
  }

  return (
    <div className="custom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`ntab ${pathname === item.path ? 'active' : ''}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}
