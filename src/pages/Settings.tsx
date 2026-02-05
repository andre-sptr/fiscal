import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage, currencyConfig } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PrivacyPolicySheet } from '@/components/settings/PrivacyPolicySheet';
import { ArrowLeft, LogOut, Moon, Sun, Shield, Smartphone, Globe, Sparkles, ChevronRight, Wallet, Bell, Palette, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { currencies } from '@/lib/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const { themeMode, toggleThemeMode, colorTheme, setColorTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themes = [
    { id: 'default', name: 'Emerald', color: 'bg-[#0F766E]' },
    { id: 'ocean', name: 'Ocean', color: 'bg-[#3B82F6]' },
    { id: 'royal', name: 'Royal', color: 'bg-[#8B5CF6]' },
    { id: 'sunset', name: 'Sunset', color: 'bg-[#F59E0B]' },
    { id: 'rose', name: 'Rose', color: 'bg-[#F43F5E]' },
  ] as const;

  const languages = [
    { id: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ] as const;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t('settings.logoutSuccess'));
      navigate('/auth');
    } catch (error) {
      toast.error(t('settings.logoutError'));
    }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-orb floating-orb-1 opacity-30" />
        <div className="floating-orb floating-orb-2 opacity-20" />
      </div>

      <PrivacyPolicySheet open={privacyOpen} onOpenChange={setPrivacyOpen} />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-border/30">
        <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{t('settings.title')}</h1>
            <p className="text-[10px] text-muted-foreground">{t('settings.subtitle')}</p>
          </div>

        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">

        {/* Section: Profile Card */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">{t('settings.account')}</h2>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-fiscal-sm">
                {userInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-income rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-[8px] text-income-foreground">✓</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{user?.email?.split('@')[0] || 'Pengguna Fiscal'}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Section: Appearance */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">{t('settings.appearance')}</h2>
          <div className="glass-card divide-y divide-border/30">

            {/* Dark Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                  themeMode === 'dark' ? "bg-indigo-500/10" : "bg-amber-500/10"
                )}>
                  {themeMode === 'dark' ? (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{t('settings.darkMode')}</p>
                  <p className="text-xs text-muted-foreground">
                    {themeMode === 'dark' ? t('settings.darkModeActive') : t('settings.lightModeActive')}
                  </p>
                </div>
              </div>
              <Switch
                checked={themeMode === 'dark'}
                onCheckedChange={toggleThemeMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Theme Color */}
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('settings.themeColor')}</p>
                  <p className="text-xs text-muted-foreground">{themes.find(t => t.id === colorTheme)?.name || 'Emerald'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-[3.75rem]">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110",
                      theme.color,
                      colorTheme === theme.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "opacity-70 hover:opacity-100"
                    )}
                    title={theme.name}
                  >
                    {colorTheme === theme.id && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Section: Preferences */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">{t('settings.preferences')}</h2>
          <div className="glass-card divide-y divide-border/30">

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">{t('settings.language')}</p>
                      <p className="text-xs text-muted-foreground">{languages.find(l => l.id === language)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{languages.find(l => l.id === language)?.flag}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/30">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as any)}
                    className="gap-3 cursor-pointer"
                  >
                    <span className="text-lg w-6 text-center">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {language === lang.id && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('settings.currency')}</p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const code = currencyConfig[language].code;
                      const currency = currencies.find(c => c.code === code);
                      return currency ? `${currency.name} (${code})` : code;
                    })()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Notifications */}
            <div className="p-4 flex items-center justify-between opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-medium">{t('settings.notifications')}</p>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                </div>
              </div>
              <span className="text-[10px] bg-muted px-2 py-1 rounded-full">{t('common.soon')}</span>
            </div>
          </div>
        </div>

        {/* Section: About */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">{t('settings.about')}</h2>
          <div className="glass-card divide-y divide-border/30">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl"
              onClick={() => setPrivacyOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium">{t('settings.privacyPolicy')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-b-2xl">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-violet-500" />
                </div>
                <span className="font-medium">{t('settings.aboutApp')}</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">v2.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full h-12 rounded-2xl gap-3 bg-destructive/10 hover:bg-destructive/20 text-destructive border-0"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {t('settings.logout')}
        </Button>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Fiscal AI • Roger Sumatera
          </p>
        </div>

      </main>
    </div>
  );
};

export default Settings;