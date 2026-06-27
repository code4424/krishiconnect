import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  Star, 
  MessageSquare,
  BarChart3,
  Settings, 
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/provider')({
  beforeLoad: ({ location }) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user || user.role !== 'SERVICE_PROVIDER') {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      });
    }
  },
  component: ProviderLayout,
});

function ProviderLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, to: '/provider/dashboard' },
    { label: t('nav.bookings'), icon: Calendar, to: '/provider/bookings' },
    { label: t('nav.services'), icon: Wrench, to: '/provider/services' },
    { label: t('nav.products'), icon: Package, to: '/provider/products' },
    { label: t('nav.orders'), icon: ShoppingCart, to: '/provider/orders' },
    { label: t('nav.earnings'), icon: IndianRupee, to: '/provider/earnings' },
    { label: t('nav.reviews'), icon: Star, to: '/provider/reviews' },
    { label: t('nav.messages'), icon: MessageSquare, to: '/provider/messages' },
    { label: t('nav.reports'), icon: BarChart3, to: '/provider/reports' },
    { label: t('nav.settings'), icon: Settings, to: '/provider/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[260px] bg-[#166534] flex-col shrink-0">
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* Sidebar - Mobile */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 lg:hidden transition-opacity",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-[#166534] flex flex-col transition-transform lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Provider</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm ring-1 ring-primary/5">
                {user?.firstName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, pathname, onLogout }: any) {
  const { t } = useTranslation();
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
                  ? "bg-white text-[#166534] shadow-xl translate-x-1" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#166534]" : "text-white/40 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm font-black text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-2xl border border-white/5"
        >
          <LogOut className="w-5 h-5" />
          {t('common.logout')}
        </button>
      </div>
    </>
  );
}
