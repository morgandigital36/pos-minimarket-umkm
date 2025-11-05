import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FolderTree, 
  Truck, 
  ShoppingBag,
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useSidebar } from '../contexts/SidebarContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kasir (POS)', href: '/pos', icon: ShoppingCart },
  { name: 'Produk', href: '/products', icon: Package },
  { name: 'Kategori', href: '/categories', icon: FolderTree },
  { name: 'Supplier', href: '/suppliers', icon: Truck },
  { name: 'Pembelian', href: '/purchases', icon: ShoppingBag },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const user = useAuthStore(state => state.user)
  const signOut = useAuthStore(state => state.signOut)
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    sidebarCollapsed, 
    toggleSidebarCollapse 
  } = useSidebar()
  
  const handleSignOut = async () => {
    await signOut()
  }
  
  // Calculate sidebar width based on state
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'
  const mainMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white shadow-lg transform transition-all duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-blue-600">POS Minimarket</h1>
            )}
            {sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Desktop collapse/expand button */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:block p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center ${sidebarCollapsed ? 'justify-center px-4' : 'px-6'} py-3 text-sm font-medium transition-colors group relative
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${!sidebarCollapsed ? 'mr-3' : ''}`} />
                  {!sidebarCollapsed && item.name}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User info & logout */}
          <div className="border-t p-4">
            {!sidebarCollapsed && (
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role?.toUpperCase()}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={`
                w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-4'} py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors group relative
              `}
              title={sidebarCollapsed ? 'Keluar' : undefined}
            >
              <LogOut className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
              {!sidebarCollapsed && 'Keluar'}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Keluar
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`${mainMargin} transition-all duration-300 ease-in-out`}>
        {/* Mobile header */}
        <div className="lg:hidden h-16 bg-white border-b flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold">POS Minimarket</h1>
        </div>
        
        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <div className="p-4 lg:p-8 pb-20 lg:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}