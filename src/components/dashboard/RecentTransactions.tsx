import { TransactionItem } from './TransactionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const RecentTransactions = ({ transactions, isLoading }: RecentTransactionsProps) => {
  if (isLoading) {
    return (
      <div className="fiscal-card animate-slide-up stagger-3">
        <h3 className="font-semibold text-lg mb-4">Transaksi Terbaru</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fiscal-card animate-slide-up stagger-3">
      <h3 className="font-semibold text-lg mb-4">Transaksi Terbaru</h3>

      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Belum ada transaksi</p>
          <p className="text-sm text-muted-foreground mt-1">Tap + untuk menambah transaksi pertamamu</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};
