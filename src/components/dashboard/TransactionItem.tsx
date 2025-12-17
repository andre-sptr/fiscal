import { formatIDR } from '@/lib/currency';
import { getCategoryById } from '@/lib/categories';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  const category = getCategoryById(transaction.category);
  const Icon = category?.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        isIncome ? 'bg-income-light' : 'bg-expense-light'
      }`}>
        {Icon && <Icon className={`w-5 h-5 ${isIncome ? 'text-income' : 'text-expense'}`} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {category?.name || transaction.category}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {transaction.description || format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}
        </p>
      </div>
      
      <div className="text-right">
        <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'} {formatIDR(Math.abs(transaction.amount))}
        </p>
      </div>
    </div>
  );
};
