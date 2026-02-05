import { useState } from 'react';
import { ChevronDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export const BalanceCard = ({ totalBalance, monthlyIncome, monthlyExpense }: BalanceCardProps) => {
  const { formatCurrency, t } = useLanguage();

  const displayBalance = formatCurrency(totalBalance);

  return (
    <div className="fiscal-balance-card animate-slide-up">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-primary-foreground/80 text-sm font-medium">{t('balance.total')}</p>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full text-white/80">
            {t('balance.auto')}
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-6">{displayBalance}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">{t('balance.income')}</p>
              <p className="font-semibold">{formatCurrency(monthlyIncome)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">{t('balance.expense')}</p>
              <p className="font-semibold">{formatCurrency(monthlyExpense)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
