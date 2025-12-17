import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, Moon, Sun, User, Shield, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Cek tema saat ini dari class HTML
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Berhasil keluar");
      navigate('/auth');
    } catch (error) {
      toast.error("Gagal keluar");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Pengaturan</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Section: Akun */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Akun Saya</h2>
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate">Pengguna Fiscal</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Section: Tampilan */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tampilan & Aplikasi</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            
            {/* Dark Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  {isDarkMode ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                </div>
                <div>
                  <p className="font-medium">Mode Gelap</p>
                  <p className="text-xs text-muted-foreground">Sesuaikan kenyamanan mata</p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
            </div>

             {/* Bahasa (Placeholder) */}
             <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Globe className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Bahasa</p>
                  <p className="text-xs text-muted-foreground">Indonesia (ID)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Lainnya */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lainnya</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">Kebijakan Privasi</span>
            </div>
            <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">Tentang Aplikasi</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl gap-2 mt-4"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Keluar dari Akun
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          &copy; {new Date().getFullYear()} Andre Saputra
        </p>

      </main>
    </div>
  );
};

export default Settings;