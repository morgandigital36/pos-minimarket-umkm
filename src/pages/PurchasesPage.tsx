import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Purchase } from '../types'

export default function PurchasesPage() {
  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('purchase_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data || []
    }
  })
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pembelian</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Memuat...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pembelian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases?.map(purchase => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{purchase.purchase_number}</td>
                  <td className="px-6 py-4">{new Date(purchase.purchase_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 text-right">Rp {purchase.total_amount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      purchase.status === 'approved' ? 'bg-green-100 text-green-700' :
                      purchase.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {purchase.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}