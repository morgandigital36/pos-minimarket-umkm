import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { TrendingUp, Package, ShoppingCart, AlertTriangle } from 'lucide-react'
import { DashboardMetrics } from '../types'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-dashboard-metrics')
      if (error) throw error
      return data.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Memuat data...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ringkasan penjualan dan inventori hari ini</p>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                Rp {metrics?.salesMetrics.totalSalesToday.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {metrics?.salesMetrics.transactionCount} transaksi
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                Rp {metrics?.salesMetrics.averageTransaction.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.inventoryMetrics.totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stok Rendah</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.inventoryMetrics.lowStockCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Perlu restok</p>
        </div>
      </div>
      
      {/* Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Produk Terlaris Hari Ini</h2>
          </div>
          <div className="p-6">
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {metrics.topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {product.totalQuantity} terjual
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Belum ada penjualan hari ini</p>
            )}
          </div>
        </div>
        
        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Produk Stok Rendah</h2>
          </div>
          <div className="p-6">
            {metrics?.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {metrics.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        Stok: {product.stock_quantity}
                      </p>
                      <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Semua stok aman</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}