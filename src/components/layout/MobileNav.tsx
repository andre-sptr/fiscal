import { MessageSquare, Wallet, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavProps {
    onOpenWallet: () => void;
    onToggleSidebar: () => void;
}

export const MobileNav = ({ onOpenWallet, onToggleSidebar }: MobileNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            label: 'Chat',
            icon: MessageSquare,
            onClick: () => {
                if (location.pathname !== '/dashboard') {
                    navigate('/dashboard');
                } else {
                    // Scroll to bottom functionality could be triggered here if needed
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
            },
            isActive: location.pathname === '/dashboard',
        },
        {
            label: 'Wallet',
            icon: Wallet,
            onClick: onOpenWallet,
            isActive: false, // Wallet is a sheet, not a page usually, but we can style it if open
        },
        {
            label: 'Riwayat',
            icon: History,
            onClick: onToggleSidebar,
            isActive: false, // Sidebar toggle
        },
        {
            label: 'Pengaturan',
            icon: Settings,
            onClick: () => navigate('/settings'),
            isActive: location.pathname === '/settings',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Glassmorphism Container */}
            <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                    {navItems.map((item, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-none hover:bg-transparent transition-colors relative",
                                item.isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={item.onClick}
                        >
                            {/* Active Indicator */}
                            {item.isActive && (
                                <div className="absolute top-0 w-8 h-1 rounded-b-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
                            )}

                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-200",
                                item.isActive && "scale-110"
                            )} />
                            <span className="text-[10px] font-medium">{item.label}</span>

                            {/* Subtle click ripple effect could be added here */}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};
