import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Shield, BarChart3, Package, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth';

interface LoginPageProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await AuthService.login(email, password);
      
      if (result.success) {
        onLogin?.();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: '#1E3A5F' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: '#2563EB' }}>
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Asset Manager</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Manage your assets<br />with confidence
            </h1>
            <p className="text-lg" style={{ color: '#93C5FD' }}>
              Track, analyze, and optimize your organization's assets in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Package, label: 'Inventory Tracking', desc: 'Real-time visibility of all assets' },
              { icon: BarChart3, label: 'Analytics & Reports', desc: 'Actionable insights and trends' },
              { icon: Shield, label: 'Role-Based Access', desc: 'Secure permissions per user' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#2563EB' }}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#93C5FD' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#60A5FA' }}>
          © {new Date().getFullYear()} Asset Manager. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#2563EB' }}>
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#111827' }}>Asset Manager</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#111827' }}>Welcome back</h2>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>Sign in to your account to continue</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 pb-8 px-8">
              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertCircle className="h-4 w-4" style={{ color: '#EF4444' }} />
                  <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#374151' }}>Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" style={{ color: '#374151' }}>Password</Label>
                    <button
                      type="button"
                      className="text-xs font-medium"
                      style={{ color: '#2563EB' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#9CA3AF' }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  style={{ backgroundColor: '#2563EB' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            Don't have an account?{' '}
            <span className="font-medium" style={{ color: '#2563EB' }}>Contact your administrator.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
