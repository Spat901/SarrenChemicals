import Link from 'next/link'
import { getCatalog } from '@/lib/products'
import { getPdfCatalog } from '@/lib/pdfs'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [catalog, pdfCatalog] = await Promise.all([getCatalog(), getPdfCatalog()])

  const productCount = catalog.categories.reduce((sum, c) => sum + c.products.length, 0)
  const categoryCount = catalog.categories.length
  const pdfCount = pdfCatalog.documents.length

  return (
    <div className="min-h-screen">
      <AdminNav />

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <h1 className="text-[32px] mb-8">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <StatCard label="Products" value={productCount} href="/admin/products" />
          <StatCard label="Categories" value={categoryCount} href="/admin/products" />
          <StatCard label="Documents" value={pdfCount} href="/admin/pdfs" />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <Link href="/admin/products" className="btn btn-primary justify-center hover:no-underline">
            Manage Products
          </Link>
          <Link href="/admin/pdfs" className="btn btn-outline justify-center hover:no-underline">
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block bg-white border border-border rounded p-6 hover:border-steel hover:no-underline transition-colors">
      <p className="label mb-1">{label}</p>
      <p className="text-[40px] font-bold text-navy leading-none">{value}</p>
    </Link>
  )
}
