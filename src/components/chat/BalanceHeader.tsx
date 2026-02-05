import { useState, useEffect } from 'react';
import { Wallet, ChevronDown, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface BalanceHeaderProps {
  balance: number;
  monthlyIncome?: number;
  monthlyExpense?: number;
  onClick: () => void;
}

export const BalanceHeader = ({
  balance,
  monthlyIncome = 0,
  monthlyExpense = 0,
  onClick
}: BalanceHeaderProps) => {
  const { formatCurrency } = useLanguage();
  const [displayBalance, setDisplayBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animated counter effect
  useEffect(() => {
    if (balance === displayBalance) return;

    setIsAnimating(true);
    const startValue = displayBalance;
    const endValue = balance;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

      setDisplayBalance(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [balance]);

  const trend = monthlyIncome - monthlyExpense;
  const isPositive = trend >= 0;

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-border/30">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 h-16 flex items-center justify-center">
        <Button
          variant="ghost"
          onClick={onClick}
          className="group flex items-center gap-3 hover:bg-muted/50 rounded-2xl px-5 py-3 h-auto transition-all duration-300 hover:shadow-fiscal-sm"
        >
          {/* Animated wallet icon */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-fiscal-sm group-hover:shadow-fiscal-md transition-shadow">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>

          {/* Balance display */}
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Total Saldo
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-bold text-lg transition-all duration-200",
                isAnimating && "text-primary"
              )}>
                {formatCurrency(displayBalance)}
              </span>

              {/* Trend indicator */}
              {(monthlyIncome > 0 || monthlyExpense > 0) && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  isPositive
                    ? "bg-income/10 text-income"
                    : "bg-expense/10 text-expense"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chevron with animation */}
          <div className="flex items-center gap-1 ml-1">
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:translate-y-0.5 transition-transform" />
          </div>
        </Button>
      </div>
    </header>
  );
};
