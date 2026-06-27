import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import { useCartStore } from '@/stores/cartStore';
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Settings, 
  LogOut,
  Menu,
  MapPin,
  Search as SearchIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/common/NotificationBell';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { LocationDialog } from '@/components/common/LocationDialog';

export const Route = createFileRoute('/farmer')({
  beforeLoad: ({ location }) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !user || user.role !== 'FARMER') {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      });
    }
  },
  component: FarmerLayout,
});

function FarmerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { address, requestCurrentLocation } = useLocationStore();
  const cartCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  const navItems = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, to: '/farmer/dashboard' },
    { label: t('nav.services'), icon: Wrench, to: '/farmer/services', badge: 'New' },
    { label: t('nav.bookings'), icon: Calendar, to: '/farmer/bookings' },
    { label: t('nav.products'), icon: Package, to: '/farmer/products' },
    { label: t('nav.cart'), icon: ShoppingCart, to: '/farmer/cart', count: cartCount },
    { label: t('nav.orders'), icon: ShoppingBag, to: '/farmer/orders' },
    { label: t('nav.payments'), icon: CreditCard, to: '/farmer/payments' },
    { label: t('nav.messages'), icon: MessageSquare, to: '/farmer/messages' },
    { label: t('nav.helpSupport'), icon: HelpCircle, to: '/farmer/help' },
    { label: t('nav.settings'), icon: Settings, to: '/farmer/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop & Tablet */}
      <aside 
        className={cn(
          "hidden md:flex bg-[#166534] flex-col shrink-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-[260px]"
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} isCollapsed={isCollapsed} />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/50 md:hidden transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-[#166534] flex flex-col transition-transform duration-300 md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent navItems={navItems} pathname={location.pathname} onLogout={handleLogout} isCollapsed={false} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <LocationDialog>
              <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 max-w-[100px] sm:max-w-none truncate">{address}</span>
                <span className="text-[10px]">▼</span>
              </button>
            </LocationDialog>

            <div className="relative flex-1 hidden sm:block">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className="w-full bg-gray-50 border-none pl-11 h-11 rounded-xl placeholder:text-gray-400 focus-visible:ring-primary/20" 
                placeholder="Search services, products..." 
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <NotificationBell />
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Farmer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm ring-1 ring-primary/5">
                {user?.firstName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, pathname, onLogout, isCollapsed }: any) {
  const { t } = useTranslation();
  return (
    <>
      <div className={cn("p-6 flex items-center justify-center transition-all", isCollapsed && "p-3")}>
        <img src="/krishi_logo.png" alt="Krishi Connect" className={cn("transition-all", isCollapsed ? "h-10" : "h-14")} />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item: any) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all duration-300 group rounded-2xl",
                isActive 
                  ? "bg-white text-[#166534] shadow-xl translate-x-1" 
                  : "text-white/60 hover:bg-white/5 hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#166534]" : "text-white/40 group-hover:text-white")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-green-400/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{item.badge}</span>
                  )}
                  {item.count !== undefined && (
                     <span className="bg-white/10 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-lg font-black">{item.count}</span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-6 mt-auto space-y-4", isCollapsed && "p-2 items-center")}>
        {!isCollapsed ? <LanguageSwitcher /> : (
            <button className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-[10px]">
                {t('common.all').substring(0, 2).toUpperCase()}
            </button>
        )}
        <button
          onClick={onLogout}
          title={t('common.logout')}
          className={cn(
            "flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm font-black text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-2xl border border-white/5",
            isCollapsed && "px-0"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && t('common.logout')}
        </button>
      </div>
    </>
  );
}
