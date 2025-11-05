import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Product, CashSession, StoreSettings } from '../types'
import toast from 'react-hot-toast'
import { TransactionSuccess } from '../components/TransactionSuccess'
import { 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  Percent,
  CreditCard,
  Banknote,
  Smartphone,
  Save,
  XCircle
} from 'lucide-react'

export default function POSPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const [barcode, setBarcode] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'transfer' | 'e-wallet'>('tunai')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'amount'>('percent')
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0)
  const [showSuccessPage, setShowSuccessPage] = useState(false)
  const [transactionData, setTransactionData] = useState<any>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  
  const {
    items,
    discountAmount,
    discountPercent,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    setGlobalDiscount,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotal
  } = useCartStore()
  
  // Get tax rate from settings
  const { data: settings } = useQuery<StoreSettings>({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .maybeSingle()
      if (error) throw error
      return data || { tax_rate: 11 } as StoreSettings
    }
  })
  
  // Get active cash session
  const { data: cashSession } = useQuery<CashSession>({
    queryKey: ['active-cash-session', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user
  })
  
  // Search product by barcode or name
  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return
    
    try {
      // First try to search by barcode
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode.trim())
        .eq('is_active', true)
        .maybeSingle()
      
      if (error) throw error
      
      // If not found by barcode, try searching by name (case-insensitive)
      if (!data) {
        const { data: nameSearchData, error: nameError } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${barcode.trim()}%`)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()
        
        if (nameError) throw nameError
        data = nameSearchData
      }
      
      if (data) {
        addItem(data as Product)
        setBarcode('')
        toast.success(`${data.name} ditambahkan`)
      } else {
        toast.error('Produk tidak ditemukan')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  
  // Process sale mutation
  const processSaleMutation = useMutation({
    mutationFn: async () => {
      const taxRate = settings?.tax_rate || 11
      const subtotal = getSubtotal()
      const taxAmount = getTaxAmount(taxRate)
      const totalAmount = getTotal(taxRate)
      
      const saleData = {
        userId: user?.id,
        cashSessionId: cashSession?.id,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.selling_price,
          discountAmount: item.discount,
          subtotal: item.subtotal
        })),
        subtotal,
        discountAmount: discountAmount,
        discountPercent: discountPercent,
        taxAmount,
        totalAmount,
        paymentMethod,
        paymentAmount,
        changeAmount: paymentAmount - totalAmount,
        status: 'completed'
      }
      
      const { data, error } = await supabase.functions.invoke('process-sale', {
        body: saleData
      })
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Prepare transaction data for receipt
      const receiptData = {
        invoice_number: data.data.invoiceNumber,
        items: items.map(item => ({
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.selling_price,
          subtotal: item.subtotal
        })),
        subtotal: getSubtotal(),
        tax_amount: getTaxAmount(settings?.tax_rate || 11),
        total_amount: getTotal(settings?.tax_rate || 11),
        payment_amount: paymentAmount,
        change_amount: paymentAmount - getTotal(settings?.tax_rate || 11),
        payment_method: paymentMethod,
        cashier_name: user?.full_name || user?.email || 'Kasir'
      }
      
      setTransactionData(receiptData)
      setShowSuccessPage(true)
      clearCart()
      setShowPayment(false)
      setPaymentAmount(0)
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memproses transaksi')
    }
  })
  
  const handlePayment = () => {
    const total = getTotal(settings?.tax_rate || 11)
    
    if (items.length === 0) {
      toast.error('Keranjang masih kosong')
      return
    }
    
    if (paymentMethod === 'tunai' && paymentAmount < total) {
      toast.error('Jumlah pembayaran kurang')
      return
    }
    
    processSaleMutation.mutate()
  }
  
  const applyGlobalDiscount = () => {
    if (globalDiscountType === 'percent') {
      const subtotal = getSubtotal()
      const discountAmt = subtotal * (globalDiscountValue / 100)
      setGlobalDiscount(globalDiscountValue, discountAmt)
    } else {
      setGlobalDiscount(0, globalDiscountValue)
    }
    toast.success('Diskon diterapkan')
  }

  const handleBackToPOS = () => {
    setShowSuccessPage(false)
    setTransactionData(null)
  }
  
  useEffect(() => {
    // Auto focus barcode input
    if (barcodeInputRef.current && !showPayment) {
      barcodeInputRef.current.focus()
    }
  }, [showPayment, items])
  
  const taxRate = settings?.tax_rate || 11
  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount(taxRate)
  const total = getTotal(taxRate)

  // Show success page after transaction
  if (showSuccessPage && transactionData) {
    return (
      <TransactionSuccess
        transactionData={transactionData}
        onBackToPOS={handleBackToPOS}
      />
    )
  }
  
  return (
    <div className="min-h-0 flex flex-col lg:flex-row gap-4 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-8rem)]">
      {/* Left: Product Input & Cart */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden min-h-0">
        {/* Barcode Input */}
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                placeholder="Scan barcode atau ketik nama produk..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={handleBarcodeSearch}
              className="px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Cari
            </button>
          </div>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 min-h-[200px]">
              <div className="text-center">
                <Barcode className="w-16 h-16 mx-auto mb-2" />
                <p>Scan produk untuk memulai</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        Rp {item.product.selling_price.toLocaleString('id-ID')} / {item.product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded border hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded border hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Right: Summary & Payment */}
      <div className="lg:w-96 bg-white rounded-lg shadow flex flex-col min-h-0 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-8rem)]">
        <div className="p-6 flex flex-col flex-1 min-h-0">
          {!showPayment ? (
            <>
              <h2 className="text-xl font-bold mb-4 flex-shrink-0">Ringkasan</h2>
              
              {/* Global Discount */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diskon Global
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={globalDiscountType}
                  onChange={(e) => setGlobalDiscountType(e.target.value as 'percent' | 'amount')}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="percent">%</option>
                  <option value="amount">Rp</option>
                </select>
                <input
                  type="number"
                  value={globalDiscountValue}
                  onChange={(e) => setGlobalDiscountValue(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="0"
                />
                <button
                  onClick={applyGlobalDiscount}
                  className="px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Percent className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon:</span>
                  <span className="font-semibold">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Pajak ({taxRate}%):</span>
                <span className="font-semibold">Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-3 border-t flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2 mt-auto pt-4 flex-shrink-0 border-t bg-white sticky bottom-0">
              <button
                onClick={() => {
                  setShowPayment(true)
                  setPaymentAmount(total)
                }}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                Bayar
              </button>
              <button
                onClick={() => clearCart()}
                disabled={items.length === 0}
                className="w-full bg-red-100 text-red-600 py-2 rounded-md hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="w-5 h-5 inline mr-2" />
                Batalkan
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Pembayaran</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-blue-600">
                Rp {total.toLocaleString('id-ID')}
              </p>
            </div>
            
            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('tunai')}
                  className={`p-3 border-2 rounded-md flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'tunai' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs font-medium">Tunai</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 border-2 rounded-md flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'qris' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs font-medium">QRIS</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 border-2 rounded-md flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'transfer' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-medium">Transfer</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('e-wallet')}
                  className={`p-3 border-2 rounded-md flex flex-col items-center gap-1 transition-colors ${
                    paymentMethod === 'e-wallet' 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs font-medium">E-Wallet</span>
                </button>
              </div>
            </div>
            
            {/* Payment Amount (for cash) */}
            {paymentMethod === 'tunai' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Bayar
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 border rounded-md text-lg"
                  placeholder="0"
                />
                {paymentAmount >= total && (
                  <p className="mt-2 text-sm text-green-600 font-semibold">
                    Kembalian: Rp {(paymentAmount - total).toLocaleString('id-ID')}
                  </p>
                )}
                
                {/* Quick amount buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[50000, 100000, 200000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPaymentAmount(amount)}
                      className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
                    >
                      {amount.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-2 mt-auto pt-4 flex-shrink-0 border-t bg-white sticky bottom-0">
              <button
                onClick={handlePayment}
                disabled={processSaleMutation.isPending || (paymentMethod === 'tunai' && paymentAmount < total)}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {processSaleMutation.isPending ? 'Memproses...' : 'Selesaikan Pembayaran'}
              </button>
              <button
                onClick={() => setShowPayment(false)}
                disabled={processSaleMutation.isPending}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Kembali
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}