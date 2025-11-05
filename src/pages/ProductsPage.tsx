import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Product, Category, Supplier } from '../types'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react'

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category_id: '',
    supplier_id: '',
    description: '',
    purchase_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    min_stock: 5,
    unit: 'pcs'
  })
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
      if (error) throw error
      return data || []
    }
  })
  
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
      if (error) throw error
      return data || []
    }
  })
  
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data])
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success(editingProduct ? 'Produk diupdate' : 'Produk ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Produk dihapus')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
  
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        barcode: product.barcode || '',
        name: product.name,
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        description: product.description || '',
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        min_stock: product.min_stock,
        unit: product.unit
      })
    } else {
      setEditingProduct(null)
      setFormData({
        barcode: '',
        name: '',
        category_id: '',
        supplier_id: '',
        description: '',
        purchase_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        min_stock: 5,
        unit: 'pcs'
      })
    }
    setShowModal(true)
  }
  
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-1">Kelola produk minimarket</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk (nama atau barcode)..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.barcode}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {categories?.find(c => c.id === product.category_id)?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        Rp {product.purchase_price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        Rp {product.selling_price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={product.stock_quantity <= product.min_stock ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                          {product.stock_quantity} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada produk
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Pilih Supplier</option>
                    {suppliers?.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli *</label>
                  <input
                    type="number"
                    required
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual *</label>
                  <input
                    type="number"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
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