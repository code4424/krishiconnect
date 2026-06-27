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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
