import { describe, it, expect } from 'vitest'
import {
  addCategoryToCatalog,
  updateCategoryInCatalog,
  deleteCategoryFromCatalog,
  addProductToCategory,
  updateProductInCatalog,
  deleteProductFromCatalog,
  isCategoryEmpty,
  type ProductCatalog,
} from '../products'

const emptyCatalog: ProductCatalog = { categories: [] }

const sampleCatalog: ProductCatalog = {
  categories: [
    {
      id: 'resins',
      title: 'Resins & Polymers',
      products: [
        { id: 'p1', label: 'Resin', name: 'Alkyd Resin', desc: 'Test desc' },
        { id: 'p2', label: 'Resin', name: 'Acrylic Emulsion', desc: 'Test desc 2' },
      ],
    },
    {
      id: 'solvents',
      title: 'Solvents',
      products: [],
    },
  ],
}

describe('addCategoryToCatalog', () => {
  it('adds a new category', () => {
    const result = addCategoryToCatalog(emptyCatalog, 'Resins & Polymers')
    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].title).toBe('Resins & Polymers')
    expect(result.categories[0].products).toEqual([])
  })

  it('slugifies the category id', () => {
    const result = addCategoryToCatalog(emptyCatalog, 'Resins & Polymers')
    expect(result.categories[0].id).toBe('resins-polymers')
  })

  it('does not mutate the original catalog', () => {
    addCategoryToCatalog(emptyCatalog, 'New Cat')
    expect(emptyCatalog.categories).toHaveLength(0)
  })

  it('trims leading and trailing hyphens from id', () => {
    const result = addCategoryToCatalog(emptyCatalog, '(Special Category!)')
    expect(result.categories[0].id).not.toMatch(/^-|-$/)
  })
})

describe('updateCategoryInCatalog', () => {
  it('updates the category title', () => {
    const result = updateCategoryInCatalog(sampleCatalog, 'resins', 'Polymers Only')
    const updated = result.categories.find((c) => c.id === 'resins')
    expect(updated?.title).toBe('Polymers Only')
  })

  it('leaves other categories unchanged', () => {
    const result = updateCategoryInCatalog(sampleCatalog, 'resins', 'New Title')
    const solvents = result.categories.find((c) => c.id === 'solvents')
    expect(solvents?.title).toBe('Solvents')
  })
})

describe('deleteCategoryFromCatalog', () => {
  it('removes the specified category', () => {
    const result = deleteCategoryFromCatalog(sampleCatalog, 'solvents')
    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].id).toBe('resins')
  })

  it('does not mutate the original', () => {
    deleteCategoryFromCatalog(sampleCatalog, 'solvents')
    expect(sampleCatalog.categories).toHaveLength(2)
  })
})

describe('addProductToCategory', () => {
  it('adds a product to the correct category', () => {
    const result = addProductToCategory(sampleCatalog, 'solvents', {
      label: 'Solvent',
      name: 'MEK',
      desc: 'High-purity MEK',
    })
    const solvents = result.categories.find((c) => c.id === 'solvents')
    expect(solvents?.products).toHaveLength(1)
    expect(solvents?.products[0].name).toBe('MEK')
  })

  it('assigns a unique id to the new product', () => {
    const result = addProductToCategory(sampleCatalog, 'solvents', {
      label: 'Solvent',
      name: 'MEK',
      desc: 'Test',
    })
    const product = result.categories.find((c) => c.id === 'solvents')?.products[0]
    expect(product?.id).toBeTruthy()
    expect(typeof product?.id).toBe('string')
  })
})

describe('updateProductInCatalog', () => {
  it('updates the product name', () => {
    const result = updateProductInCatalog(sampleCatalog, 'p1', { name: 'Updated Alkyd' })
    const product = result.categories
      .flatMap((c) => c.products)
      .find((p) => p.id === 'p1')
    expect(product?.name).toBe('Updated Alkyd')
  })

  it('does not affect other products', () => {
    const result = updateProductInCatalog(sampleCatalog, 'p1', { name: 'Updated' })
    const product = result.categories
      .flatMap((c) => c.products)
      .find((p) => p.id === 'p2')
    expect(product?.name).toBe('Acrylic Emulsion')
  })
})

describe('deleteProductFromCatalog', () => {
  it('removes the specified product', () => {
    const result = deleteProductFromCatalog(sampleCatalog, 'p1')
    const products = result.categories.flatMap((c) => c.products)
    expect(products).toHaveLength(1)
    expect(products[0].id).toBe('p2')
  })
})

describe('isCategoryEmpty', () => {
  it('returns true for a category with no products', () => {
    expect(isCategoryEmpty(sampleCatalog, 'solvents')).toBe(true)
  })

  it('returns false for a category with products', () => {
    expect(isCategoryEmpty(sampleCatalog, 'resins')).toBe(false)
  })

  it('returns true for a non-existent category', () => {
    expect(isCategoryEmpty(sampleCatalog, 'doesnotexist')).toBe(true)
  })
})
