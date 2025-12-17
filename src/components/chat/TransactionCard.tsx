import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/currency';
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
  const IconComponent = getCategoryIcon(data.category);
  const isExpense = data.type === 'expense';

  return (
    <div className={cn(
      "rounded-2xl border p-4 space-y-3 transition-all",
      status === 'confirmed' && "bg-income-light border-income/30",
      status === 'cancelled' && "bg-muted border-muted opacity-60",
      status === 'pending' && "bg-card border-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isExpense ? "bg-expense-light" : "bg-income-light"
          )}>
            <IconComponent className={cn(
              "w-5 h-5",
              isExpense ? "text-expense" : "text-income"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">{data.category}</p>
            {data.description && (
              <p className="text-xs text-muted-foreground">{data.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-bold",
            isExpense ? "text-expense" : "text-income"
          )}>
            {isExpense ? '-' : '+'}{formatIDR(data.amount)}
          </p>
          {data.date && (
            <p className="text-xs text-muted-foreground">{data.date}</p>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {status === 'confirmed' && (
        <div className="flex items-center gap-2 text-income text-sm">
          <Check className="w-4 h-4" />
          <span>Transaksi tersimpan</span>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <X className="w-4 h-4" />
          <span>Dibatalkan</span>
        </div>
      )}

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <Button 
            size="sm" 
            onClick={onConfirm}
            className="flex-1 gap-1"
          >
            <Check className="w-4 h-4" />
            Konfirmasi
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onEdit}
            className="gap-1"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
