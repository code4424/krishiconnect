import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Star, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/farmer/settings')({
  component: FarmerSettingsPage,
});

function FarmerSettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Personal Information', icon: User, color: 'text-blue-500 bg-blue-50', to: '/farmer/settings/personal' },
    { label: 'Addresses', icon: MapPin, color: 'text-orange-500 bg-orange-50', to: '/farmer/settings/addresses' },
    { label: 'Payment Methods', icon: CreditCard, color: 'text-purple-500 bg-purple-50', to: '/farmer/settings/payments' },
    { label: 'My Reviews', icon: Star, color: 'text-yellow-500 bg-yellow-50', to: '/farmer/settings/reviews' },
    { label: 'Notifications', icon: Bell, color: 'text-primary bg-green-50', to: '/farmer/settings/notifications' },
    { label: 'Help & Support', icon: HelpCircle, color: 'text-gray-500 bg-gray-50', to: '/farmer/help' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>

      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden p-8">
         <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-black/5">
                   <User className="w-12 h-12 text-gray-300" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
                   <Camera className="w-4 h-4" />
                </button>
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-black text-gray-900 leading-tight">{user?.firstName} {user?.lastName}</h2>
               <p className="text-gray-400 font-bold text-sm tracking-wide mt-1 uppercase">{user?.email}</p>
               <p className="text-gray-400 font-bold text-sm tracking-wide mt-0.5">+91 {user?.phone}</p>
            </div>
            <Button asChild variant="link" className="text-primary font-black uppercase text-xs tracking-widest mt-2">
               <Link to="/farmer/settings/personal">Edit Profile</Link>
            </Button>
         </div>
      </Card>

      <div className="space-y-3">
         {menuItems.map((item) => (
            <Link 
              key={item.label}
              to={item.to}
              className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
            >
               <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", item.color)}>
                     <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-black text-gray-700 tracking-tight">{item.label}</span>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
         ))}
         
         <button 
           onClick={handleLogout}
           className="w-full flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-red-50 hover:bg-red-50 transition-all group mt-6"
         >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center shadow-inner">
                  <LogOut className="w-6 h-6" />
               </div>
               <span className="font-black text-red-600 tracking-tight">Logout</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
         </button>
      </div>
    </div>
  );
}
