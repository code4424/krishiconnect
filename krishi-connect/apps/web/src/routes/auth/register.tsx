import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const registerFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['FARMER', 'SERVICE_PROVIDER']),
  businessName: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
  serviceCategories: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [role, setRole] = useState<'FARMER' | 'SERVICE_PROVIDER'>('FARMER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerField, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: 'FARMER',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      experience: 0,
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const handleRoleChange = (newRole: 'FARMER' | 'SERVICE_PROVIDER') => {
    setRole(newRole);
    setValue('role', newRole);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await register({ ...data, role });
      if (role === 'FARMER') {
        navigate({ to: '/farmer/dashboard' });
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle>Application Received!</CardTitle>
          <CardDescription>
            Thank you for registering as a Service Provider. Your account is currently under review by our administrators.
            We will notify you via email once approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full"><Link to="/auth/login">Back to Login</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join Krishi Connect</CardTitle>
        <CardDescription>Choose your role and fill in your details to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}

          <input type="hidden" {...registerField('role')} />

          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleRoleChange('FARMER')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${role === 'FARMER' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                I'm a Farmer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('SERVICE_PROVIDER')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${role === 'SERVICE_PROVIDER' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                I'm a Service Provider
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...registerField('firstName')} required />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...registerField('lastName')} required />
              {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...registerField('email')} required />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="9876543210" {...registerField('phone')} required />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {role === 'SERVICE_PROVIDER' && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" {...registerField('businessName')} required />
                {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" {...registerField('experience')} required />
                  {errors.experience && <p className="text-sm text-red-500 mt-1">{errors.experience.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" {...registerField('pincode')} required />
                  {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <Input id="address" {...registerField('address')} required />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...registerField('city')} required />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...registerField('state')} required />
                  {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...registerField('password')} required />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...registerField('confirmPassword')} required />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full h-11 text-lg" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="text-primary font-medium hover:underline">Log in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
