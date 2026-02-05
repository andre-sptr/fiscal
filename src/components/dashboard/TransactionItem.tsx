import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryIcon, getCategoryById } from '@/lib/categories';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string | null;
}

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export const TransactionItem = ({ transaction, onClick }: TransactionItemProps) => {
  const { formatCurrency } = useLanguage();
  const category = getCategoryById(transaction.category);
  const IconComponent = category?.icon || getCategoryIcon(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
        isIncome
          ? "bg-gradient-to-br from-income/20 to-income/10"
          : "bg-gradient-to-br from-expense/20 to-expense/10"
      )}>
        <IconComponent className={cn(
          "w-5 h-5",
          isIncome ? "text-income" : "text-expense"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {category?.name || transaction.category}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.description || format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}
        </p>
      </div>

      <div className="text-right">
        <p className={cn(
          "font-semibold",
          isIncome ? "text-income" : "text-expense"
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
        </p>
      </div>
    </div>
  );
};
