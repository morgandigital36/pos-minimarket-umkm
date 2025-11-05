import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Supplier } from '../types'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function SuppliersPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  })
  
  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    }
  })
  
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editing) {
        const { error } = await supabase
          .from('suppliers')
          .update(data)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([data])
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Supplier diupdate' : 'Supplier ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setShowModal(false)
      setEditing(null)
    }
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supplier</h1>
        <button
          onClick={() => {
            setEditing(null)
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' })
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Supplier
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Memuat...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers?.filter(s => s.is_active).map(sup => (
                <tr key={sup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{sup.name}</td>
                  <td className="px-6 py-4 text-gray-600">{sup.contact_person}</td>
                  <td className="px-6 py-4 text-gray-600">{sup.phone}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditing(sup)
                        setFormData({
                          name: sup.name,
                          contact_person: sup.contact_person || '',
                          phone: sup.phone || '',
                          email: sup.email || '',
                          address: sup.address || ''
                        })
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Tambah'} Supplier</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData) }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kontak Person</label>
                <input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telepon</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Simpan
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-md hover:bg-gray-300">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}