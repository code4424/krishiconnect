import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';

export const Route = createFileRoute('/auth')({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') throw redirect({ to: '/admin/dashboard' });
      if (user.role === 'SERVICE_PROVIDER') throw redirect({ to: '/provider/dashboard' });
      if (user.role === 'FARMER') throw redirect({ to: '/farmer/dashboard' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop / Tablet Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Half - Image scales naturally */}
        <div className="w-1/2 bg-green-50 flex items-stretch">
          <img
            src="/loginpage.png"
            alt="Krishi Connect - Book. Order. Grow."
            className="w-full object-cover"
          />
        </div>
        {/* Right Half - Form */}
        <div className="w-1/2 flex items-center justify-center px-12 lg:px-20 py-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen flex flex-col">
        {/* Top Image - responsive height */}
        <div className="shrink-0">
          <img
            src="/loginpage.png"
            alt="Krishi Connect - Book. Order. Grow."
            className="w-full h-auto object-contain"
          />
        </div>
        {/* Form */}
        <div className="flex-1 flex items-start justify-center p-4 pt-4">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
