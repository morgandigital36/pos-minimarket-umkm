# POS Minimarket UMKM

Sistem Point of Sale (POS) lengkap untuk minimarket UMKM Indonesia - Sistem kasir modern dengan fitur lengkap untuk digitalisasi operasional minimarket.

## 🚀 Fitur Utama

### Dashboard & Analytics
- **Metrics Real-time**: Penjualan hari ini, minggu ini, bulan ini
- **Grafik Interaktif**: Chart untuk trend penjualan dan analisis
- **KPI Cards**: Total transaksi, revenue, produk terjual
- **Profit Margin**: Analisis keuntungan per produk

### Sistem Kasir (POS)
- **Interface Modern**: UI/UX yang mudah untuk kasir
- **Barcode Scanner**: Scan barcode atau input manual
- **Keranjang Belanja**: Add/remove item dengan quantity
- **Multiple Payment**: Tunai, Transfer, QRIS, E-Wallet
- **Thermal Printer**: Cetak struk otomatis
- **PWA Offline**: Bisa digunakan tanpa internet

### Manajemen Produk
- **Database Produk**: Nama, harga, barcode, kategori
- **Upload Foto**: Gambar produk dengan Supabase Storage
- **Stock Management**: Stok real-time dengan alertas
- **Kategori Produk**: Organización produk berdasarkan kategori
- **Bulk Import**: Import produk via CSV/Excel

### Laporan & Analytics
- **Sales Report**: Laporan penjualan harian/mingguan/bulanan
- **Product Analysis**: Produk best/worst seller
- **Profit Report**: Analisis keuntungan
- **Export PDF/Excel**: Download laporan dalam format berbeda
- **Real-time Dashboard**: Update data secara real-time

### Pengaturan & Admin
- **User Management**: Admin, Kasir dengan role berbeda
- **Store Settings**: Pengaturan toko (nama, alamat, NPWP)
- **Multi-branch**: Support multiple cabang
- **Backup System**: Auto backup data harian
- **Security**: Row Level Security (RLS) untuk data

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts untuk visualisasi data
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **PWA**: Service Worker untuk offline mode

## 📱 Responsive Design

- **Desktop**: Layout optimal untuk komputer kasir
- **Tablet**: Interface untuk tablet kasir
- **Mobile**: Gunakan di HP untuk akses cepat

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/morgandigital36/pos-minimarket-umkm.git
cd pos-minimarket-umkm
```

### 2. Install Dependencies
```bash
npm install
# atau
pnpm install
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env dengan Supabase credentials Anda
```

### 4. Run Development
```bash
npm run dev
# atau
pnpm dev
```

### 5. Build Production
```bash
npm run build
# atau
pnpm build
```

## 🌐 Supabase Setup

1. Buat project baru di [supabase.com](https://supabase.com)
2. Copy URL dan ANON_KEY ke file `.env`
3. Database schema sudah tersedia di folder `supabase/migrations/`
4. Edge functions akan di-deploy otomatis

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👥 Kontribusi

Kontribusi sangat diterima! Silakan fork repository ini dan buat pull request.

---

**© 2025 POS Minimarket UMKM - MiniMax Agent**