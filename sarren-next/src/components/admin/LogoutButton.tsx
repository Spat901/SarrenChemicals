'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[14px] text-steel hover:text-charcoal transition-colors"
    >
      Log out
    </button>
  )
}
