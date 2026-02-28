import { getCatalog } from '@/lib/products'
import RfqForm from '@/components/RfqForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse Sarren Chemicals industrial chemical inventory. Submit an RFQ for pricing.',
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const catalog = await getCatalog()

  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Inventory</p>
          <h1 className="text-[40px] mb-4">Products</h1>
          <p className="text-steel text-[18px]">Browse available inventory by category. All pricing is inquiry-only — submit an RFQ for quotes.</p>
        </div>
      </div>

      {/* CATEGORY NAV */}
      {catalog.categories.length > 0 && (
        <div className="border-b border-border bg-white sticky top-[72px] z-50">
          <div className="container-content flex gap-0 overflow-x-auto">
            {catalog.categories.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-5 py-3 text-[14px] font-medium text-steel border-b-2 border-transparent hover:text-navy hover:border-navy hover:no-underline whitespace-nowrap transition-colors"
              >
                {title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT CATEGORIES */}
      <section className="section-pad">
        <div className="container-content space-y-[72px]">
          {catalog.categories.length === 0 ? (
            <p className="text-steel text-[18px]">Products coming soon. Contact us for availability.</p>
          ) : (
            catalog.categories.map(({ id, title, products }) => (
              <div key={id} id={id}>
                <h2 className="mb-8 pb-4 border-b border-border">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(({ id: pid, label, name, desc }) => (
                    <div key={pid} className="card flex flex-col">
                      <p className="label mb-3">{label}</p>
                      <h3 className="text-[18px] mb-2">{name}</h3>
                      <p className="text-[15px] text-steel flex-1">{desc}</p>
                      <a href="#rfq" className="btn btn-outline mt-5 h-10 text-[14px] self-start hover:no-underline">
                        Request a Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RFQ FORM */}
      <section className="section-alt section-pad" id="rfq">
        <div className="container-content max-w-[720px] mx-auto">
          <div className="section-header">
            <p className="label">Pricing Inquiry</p>
            <h2>Request a Quote</h2>
            <p>All pricing is by inquiry only. Fill out the form below and we&apos;ll respond within one business day.</p>
          </div>
          <RfqForm />
        </div>
      </section>
    </>
  )
}
