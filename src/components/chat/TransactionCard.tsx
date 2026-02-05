import { Check, Pencil, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryIcon } from '@/lib/categories';
import { cn } from '@/lib/utils';

export interface TransactionData {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date?: string;
}

interface TransactionCardProps {
  data: TransactionData;
  status: 'pending' | 'confirmed' | 'cancelled';
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export const TransactionCard = ({
  data,
  status,
  onConfirm,
  onEdit,
  onCancel,
}: TransactionCardProps) => {
  const { formatCurrency, t } = useLanguage();
  const IconComponent = getCategoryIcon(data.category);
  const isExpense = data.type === 'expense';

  return (
    <div className={cn(
      "rounded-2xl border p-4 space-y-3 transition-all duration-300",
      status === 'confirmed' && "bg-gradient-to-br from-income/10 to-income/5 border-income/30 shadow-fiscal-sm",
      status === 'cancelled' && "bg-muted/50 border-muted opacity-60",
      status === 'pending' && "glass-card hover:shadow-fiscal-md"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "relative w-11 h-11 rounded-xl flex items-center justify-center transition-all",
            isExpense
              ? "bg-gradient-to-br from-expense/20 to-expense/10"
              : "bg-gradient-to-br from-income/20 to-income/10"
          )}>
            <IconComponent className={cn(
              "w-5 h-5",
              isExpense ? "text-expense" : "text-income"
            )} />
            {status === 'pending' && (
              <div className={cn(
                "absolute -inset-0.5 rounded-xl blur-sm -z-10 animate-pulse-soft",
                isExpense ? "bg-expense/20" : "bg-income/20"
              )} />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{data.category}</p>
            {data.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{data.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-bold text-lg",
            isExpense ? "text-expense" : "text-income"
          )}>
            {isExpense ? '-' : '+'}{formatCurrency(data.amount)}
          </p>
          {data.date && (
            <p className="text-[10px] text-muted-foreground">{data.date}</p>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {status === 'confirmed' && (
        <div className="flex items-center gap-2 text-income text-sm bg-income/10 rounded-lg px-3 py-2">
          <div className="w-5 h-5 rounded-full bg-income/20 flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span className="font-medium">{t('transaction.saved')}</span>
          <Sparkles className="w-3 h-3 ml-auto opacity-60" />
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <X className="w-4 h-4" />
          <span>{t('transaction.cancelled')}</span>
        </div>
      )}

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={onConfirm}
            className="flex-1 gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-fiscal-sm hover:shadow-fiscal-md transition-all"
          >
            <Check className="w-4 h-4" />
            {t('transaction.confirm')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="gap-2 h-10 rounded-xl hover:bg-muted"
          >
            <Pencil className="w-4 h-4" />
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
