export const metadata = { title: 'Admin — Sarren Chemicals' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite">
      {children}
    </div>
  )
}
