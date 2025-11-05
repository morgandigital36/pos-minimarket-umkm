import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { StoreSettings } from '../types'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    store_name: '',
    store_address: '',
    store_phone: '',
    store_email: '',
    npwp: '',
    tax_rate: 11,
    receipt_header: '',
    receipt_footer: ''
  })
  
  const { data: settings, isLoading } = useQuery<StoreSettings>({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .maybeSingle()
      if (error) throw error
      if (data) {
        setFormData({
          store_name: data.store_name,
          store_address: data.store_address || '',
          store_phone: data.store_phone || '',
          store_email: data.store_email || '',
          npwp: data.npwp || '',
          tax_rate: data.tax_rate,
          receipt_header: data.receipt_header || '',
          receipt_footer: data.receipt_footer || ''
        })
      }
      return data
    }
  })
  
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('store_settings')
          .update(data)
          .eq('id', settings.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('store_settings')
          .insert([data])
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success('Pengaturan disimpan')
      queryClient.invalidateQueries({ queryKey: ['store-settings'] })
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }
  
  if (isLoading) {
    return <div className="p-8 text-center">Memuat...</div>
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Toko</h1>
        <p className="text-gray-600 mt-1">Kelola informasi toko dan konfigurasi</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko *</label>
              <input
                required
                type="text"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
              <input
                type="text"
                value={formData.store_phone}
                onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.store_email}
                onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
              <input
                type="text"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <textarea
                value={formData.store_address}
                onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pajak (PPN) %</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Struk</label>
              <input
                type="text"
                value={formData.receipt_header}
                onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer Struk</label>
              <input
                type="text"
                value={formData.receipt_footer}
                onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  )
}