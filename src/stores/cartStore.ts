import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  discountPercent: number
  discountAmount: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateDiscount: (productId: string, discount: number) => void
  setGlobalDiscount: (percent: number, amount: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTaxAmount: (taxRate: number) => number
  getTotal: (taxRate: number) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountPercent: 0,
      discountAmount: 0,
      
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.product.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.selling_price - item.discount }
                : item
            )
          })
        } else {
          set({
            items: [...items, {
              product,
              quantity: 1,
              discount: 0,
              subtotal: product.selling_price
            }]
          })
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.product.id !== productId)
        })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, quantity, subtotal: quantity * item.product.selling_price - item.discount }
              : item
          )
        })
      },
      
      updateDiscount: (productId, discount) => {
        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, discount, subtotal: item.quantity * item.product.selling_price - discount }
              : item
          )
        })
      },
      
      setGlobalDiscount: (percent, amount) => {
        set({ discountPercent: percent, discountAmount: amount })
      },
      
      clearCart: () => {
        set({ items: [], discountPercent: 0, discountAmount: 0 })
      },
      
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0)
      },
      
      getTaxAmount: (taxRate) => {
        const subtotal = get().getSubtotal()
        const afterDiscount = subtotal - get().discountAmount
        return afterDiscount * (taxRate / 100)
      },
      
      getTotal: (taxRate) => {
        const subtotal = get().getSubtotal()
        const afterDiscount = subtotal - get().discountAmount
        const tax = get().getTaxAmount(taxRate)
        return afterDiscount + tax
      },
    }),
    {
      name: 'pos-cart-storage',
    }
  )
)