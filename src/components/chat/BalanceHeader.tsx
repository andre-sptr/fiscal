import { Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface BalanceHeaderProps {
  balance: number;
  onClick: () => void;
}

export const BalanceHeader = ({ balance, onClick }: BalanceHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-center">
        <Button
          variant="ghost"
          onClick={onClick}
          className="flex items-center gap-2 hover:bg-muted/50 rounded-xl px-4 py-2 h-auto"
        >
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-semibold text-sm">{formatIDR(balance)}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};
