import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email tidak valid');
const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');

type AuthMode = 'login' | 'register' | 'forgot';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') setMode('register');
    else if (modeParam === 'forgot' || modeParam === 'reset') setMode('forgot');
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    if (mode !== 'forgot') {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }
    
    if (mode === 'register' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (!error) navigate('/');
      } else if (mode === 'register') {
        const { error } = await signUp(email, password);
        if (!error) navigate('/');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMode('login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Fiscal</h1>
          <p className="text-muted-foreground mt-1">AI Finance Tracker</p>
        </div>

        <Card className="fiscal-card-elevated border-0">
          <CardHeader className="space-y-1 pb-4">
            {mode === 'forgot' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 mb-2"
                onClick={() => setMode('login')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            )}
            <CardTitle className="text-xl font-semibold">
              {mode === 'login' && 'Masuk ke Akun'}
              {mode === 'register' && 'Buat Akun Baru'}
              {mode === 'forgot' && 'Lupa Password'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Masukkan email dan password kamu'}
              {mode === 'register' && 'Isi data untuk mendaftar'}
              {mode === 'forgot' && 'Masukkan email untuk reset password'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 fiscal-input"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 fiscal-input"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 fiscal-input"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Lupa password?
                </button>
              )}

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'login' && 'Masuk'}
                {mode === 'register' && 'Daftar'}
                {mode === 'forgot' && 'Kirim Link Reset'}
              </Button>
            </form>

            {mode !== 'forgot' && (
              <div className="mt-6 text-center text-sm">
                {mode === 'login' ? (
                  <p className="text-muted-foreground">
                    Belum punya akun?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-primary font-medium hover:underline"
                    >
                      Daftar sekarang
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Sudah punya akun?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary font-medium hover:underline"
                    >
                      Masuk
                    </button>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
