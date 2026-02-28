'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import type { ProductCatalog, Category, Product } from '@/lib/products'

type ModalState =
  | { mode: 'none' }
  | { mode: 'add-category' }
  | { mode: 'edit-category'; category: Category }
  | { mode: 'add-product'; categoryId: string }
  | { mode: 'edit-product'; product: Product; categoryId: string }

export default function AdminProductsPage() {
  const [catalog, setCatalog] = useState<ProductCatalog | null>(null)
  const [modal, setModal] = useState<ModalState>({ mode: 'none' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then(setCatalog)
  }, [])

  async function saveCategory(title: string, id?: string) {
    const res = await fetch('/api/admin/products', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { type: 'category', id, title } : { type: 'category', title }),
    })
    const data = await res.json()
    setCatalog(data)
    setModal({ mode: 'none' })
  }

  async function saveProduct(
    product: { label: string; name: string; desc: string },
    categoryId: string,
    productId?: string
  ) {
    const res = await fetch('/api/admin/products', {
      method: productId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        productId
          ? { type: 'product', id: productId, ...product }
          : { type: 'product', categoryId, ...product }
      ),
    })
    const data = await res.json()
    setCatalog(data)
    setModal({ mode: 'none' })
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? It must be empty first.')) return
    const res = await fetch(`/api/admin/products?type=category&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to delete')
      return
    }
    const data = await res.json()
    setCatalog(data)
    setError('')
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/admin/products?type=product&id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    setCatalog(data)
  }

  if (!catalog) {
    return (
      <div className="min-h-screen">
        <AdminNav />
        <div className="max-w-[900px] mx-auto px-8 py-12 text-steel">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px]">Products</h1>
          <button
            className="btn btn-primary h-10 text-[14px]"
            onClick={() => setModal({ mode: 'add-category' })}
          >
            + Add Category
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-[14px]">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {catalog.categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-border rounded">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-[18px] font-semibold text-navy">{cat.title}</h2>
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline h-8 text-[13px] px-4"
                    onClick={() => setModal({ mode: 'edit-category', category: cat })}
                  >
                    Edit
                  </button>
                  <button
                    className="h-8 px-4 text-[13px] border border-border rounded text-steel hover:text-red-600 hover:border-red-300 transition-colors"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="divide-y divide-border">
                {cat.products.map((product) => (
                  <div key={product.id} className="flex items-start justify-between px-6 py-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="label">{product.label}</span>
                      <p className="font-medium text-navy mt-0.5">{product.name}</p>
                      <p className="text-[14px] text-steel mt-1 line-clamp-2">{product.desc}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="btn btn-outline h-8 text-[13px] px-3"
                        onClick={() => setModal({ mode: 'edit-product', product, categoryId: cat.id })}
                      >
                        Edit
                      </button>
                      <button
                        className="h-8 px-3 text-[13px] border border-border rounded text-steel hover:text-red-600 hover:border-red-300 transition-colors"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {cat.products.length === 0 && (
                  <p className="px-6 py-4 text-[14px] text-steel italic">No products yet.</p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border">
                <button
                  className="text-[14px] text-navy font-medium hover:underline"
                  onClick={() => setModal({ mode: 'add-product', categoryId: cat.id })}
                >
                  + Add Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal.mode === 'add-category' && (
        <CategoryModal
          onSave={(title) => saveCategory(title)}
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
      {modal.mode === 'edit-category' && (
        <CategoryModal
          initialTitle={modal.category.title}
          onSave={(title) => saveCategory(title, modal.category.id)}
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
      {(modal.mode === 'add-product' || modal.mode === 'edit-product') && (
        <ProductModal
          initialProduct={modal.mode === 'edit-product' ? modal.product : undefined}
          onSave={(p) => {
            const catId = modal.categoryId
            const prodId = modal.mode === 'edit-product' ? modal.product.id : undefined
            saveProduct(p, catId, prodId)
          }}
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
    </div>
  )
}

function CategoryModal({
  initialTitle = '',
  onSave,
  onClose,
}: {
  initialTitle?: string
  onSave: (title: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(initialTitle)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded border border-border w-full max-w-md p-6">
        <h3 className="text-[18px] font-semibold mb-4">
          {initialTitle ? 'Edit Category' : 'Add Category'}
        </h3>
        <label className="label mb-1.5 block">Category Name</label>
        <input
          className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button className="btn btn-outline h-9 text-[14px] px-5" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary h-9 text-[14px] px-5" onClick={() => title && onSave(title)}>Save</button>
        </div>
      </div>
    </div>
  )
}

function ProductModal({
  initialProduct,
  onSave,
  onClose,
}: {
  initialProduct?: Product
  onSave: (p: { label: string; name: string; desc: string }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialProduct?.name ?? '')
  const [label, setLabel] = useState(initialProduct?.label ?? '')
  const [desc, setDesc] = useState(initialProduct?.desc ?? '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded border border-border w-full max-w-lg p-6">
        <h3 className="text-[18px] font-semibold mb-4">
          {initialProduct ? 'Edit Product' : 'Add Product'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Product Name</label>
            <input
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Label / Tag</label>
            <input
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
              placeholder="e.g. Resin, Solvent, Pigment"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy min-h-[100px]"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button className="btn btn-outline h-9 text-[14px] px-5" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary h-9 text-[14px] px-5"
            onClick={() => name && label && desc && onSave({ name, label, desc })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
