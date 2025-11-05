import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Sale } from '../types'
import { FileText, Download } from 'lucide-react'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  
  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', `${startDate}T00:00:00`)
        .lte('sale_date', `${endDate}T23:59:59`)
        .eq('status', 'completed')
        .order('sale_date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
  
  const totalSales = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
  const totalTransactions = sales?.length || 0
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
        <p className="text-gray-600 mt-1">Analisis transaksi penjualan</p>
      </div>
      
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Penjualan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            Rp {totalSales.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Transaksi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            Rp {avgTransaction.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales?.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{sale.invoice_number}</td>
                    <td className="px-6 py-4">{new Date(sale.sale_date).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 capitalize">{sale.payment_method}</td>
                    <td className="px-6 py-4 text-right font-semibold">
                      Rp {sale.total_amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}