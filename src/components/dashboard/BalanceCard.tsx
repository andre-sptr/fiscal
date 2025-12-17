import { useState } from 'react';
import { ChevronDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatIDR, convertFromIDR, currencySymbols } from '@/lib/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

const currencies = ['IDR', 'USD', 'SGD', 'EUR', 'MYR', 'JPY', 'AUD'];

export const BalanceCard = ({ totalBalance, monthlyIncome, monthlyExpense }: BalanceCardProps) => {
  const [displayCurrency, setDisplayCurrency] = useState('IDR');

  const displayBalance = displayCurrency === 'IDR' 
    ? formatIDR(totalBalance)
    : convertFromIDR(totalBalance, displayCurrency);

  return (
    <div className="fiscal-balance-card animate-slide-up">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-primary-foreground/80 text-sm font-medium">Total Saldo</p>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors">
              {currencySymbols[displayCurrency]} {displayCurrency}
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              {currencies.map((currency) => (
                <DropdownMenuItem
                  key={currency}
                  onClick={() => setDisplayCurrency(currency)}
                  className={displayCurrency === currency ? 'bg-accent' : ''}
                >
                  {currencySymbols[currency]} {currency}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mb-6">{displayBalance}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Pemasukan</p>
              <p className="font-semibold">{formatIDR(monthlyIncome)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Pengeluaran</p>
              <p className="font-semibold">{formatIDR(monthlyExpense)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
