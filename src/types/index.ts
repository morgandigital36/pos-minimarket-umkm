export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'kasir' | 'manajer'
  pin?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  barcode?: string
  name: string
  category_id?: string
  supplier_id?: string
  description?: string
  image_url?: string
  purchase_price: number
  selling_price: number
  stock_quantity: number
  min_stock: number
  unit: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CashSession {
  id: string
  user_id: string
  opened_at: string
  closed_at?: string
  opening_balance: number
  closing_balance?: number
  expected_balance?: number
  variance?: number
  notes?: string
  status: 'open' | 'closed'
  created_at: string
}

export interface Sale {
  id: string
  invoice_number: string
  user_id: string
  cash_session_id?: string
  sale_date: string
  subtotal: number
  discount_amount: number
  discount_percent: number
  tax_amount: number
  total_amount: number
  payment_method: 'tunai' | 'qris' | 'transfer' | 'e-wallet'
  payment_amount: number
  change_amount: number
  status: 'completed' | 'void' | 'draft'
  notes?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount_amount: number
  subtotal: number
  created_at: string
}

export interface Purchase {
  id: string
  purchase_number: string
  supplier_id: string
  user_id: string
  purchase_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_status: 'pending' | 'partial' | 'paid'
  status: 'draft' | 'approved' | 'received' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface StockMovement {
  id: string
  product_id: string
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return'
  reference_id?: string
  quantity: number
  stock_before: number
  stock_after: number
  notes?: string
  created_by: string
  created_at: string
}

export interface StoreSettings {
  id: string
  store_name: string
  store_address?: string
  store_phone?: string
  store_email?: string
  npwp?: string
  logo_url?: string
  tax_rate: number
  receipt_header?: string
  receipt_footer?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  discount: number
  subtotal: number
}

export interface DashboardMetrics {
  salesMetrics: {
    totalSalesToday: number
    transactionCount: number
    averageTransaction: number
  }
  lowStockProducts: Product[]
  topProducts: {
    productId: string
    productName: string
    totalQuantity: number
  }[]
  inventoryMetrics: {
    totalProducts: number
    lowStockCount: number
  }
}