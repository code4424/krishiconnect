import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/common/NotificationBell';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Service Providers', icon: Users, to: '/admin/service-providers' },
    { label: 'Products', icon: Package, to: '/admin/products' },
    { label: 'Bookings', icon: Wrench, to: '/admin/bookings' },
    { label: 'Orders', icon: ShoppingCart, to: '/admin/orders' },
    { label: 'Reports', icon: BarChart3, to: '/admin/reports' },
    { label: 'Audit Logs', icon: FileText, to: '/admin/audit-logs' },
    { label: 'Settings', icon: Settings, to: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[280px] bg-black/20 flex-col shrink-0 border-r border-white/5">
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* Sidebar - Mobile */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/80 lg:hidden transition-opacity",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-gray-900 flex flex-col transition-transform lg:hidden border-r border-white/5",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/5 backdrop-blur-3xl">
        {/* Top Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-md text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
               <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live System</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <NotificationBell variant="dark" />
            <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                {user?.firstName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, pathname, onLogout }: any) {
  return (
    <>
      <div className="p-6 flex items-center justify-center">
        <img src="/krishi_logo.png" alt="Krishi Connect" className="h-14" />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item: any) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all duration-300 group rounded-2xl",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-white/20 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm font-black text-red-400 hover:bg-red-500/10 transition-all rounded-2xl border border-white/5"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </div>
    </>
  );
}
