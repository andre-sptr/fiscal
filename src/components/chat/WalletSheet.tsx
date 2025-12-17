import { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, RefreshCw, Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatIDR, convertFromIDR, currencies } from '@/lib/currency';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { RecurringSheet } from './RecurringSheet';
import { toast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  description?: string | null;
}

interface WalletSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: Transaction[];
}

// Category colors for pie chart
const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman': '#f97316',
  'Transportasi': '#3b82f6',
  'Belanja': '#ec4899',
  'Rumah & Sewa': '#8b5cf6',
  'Utilitas & Tagihan': '#06b6d4',
  'Kesehatan': '#10b981',
  'Pendidikan': '#f59e0b',
  'Liburan': '#6366f1',
  'Hadiah & Donasi': '#ef4444',
  'Hiburan': '#a855f7',
  'Lainnya': '#64748b',
};

const DEFAULT_COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

export const WalletSheet = ({
  open,
  onOpenChange,
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  transactions,
}: WalletSheetProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');

  const currencyData = currencies.find(c => c.code === selectedCurrency);
  const displayBalance = selectedCurrency === 'IDR' 
    ? formatIDR(totalBalance)
    : `${currencyData?.symbol || ''}${convertFromIDR(totalBalance, selectedCurrency).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate monthly data for bar chart (last 6 months)
  const monthlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        month: format(monthDate, 'MMM', { locale: id }),
        income: income / 1000000, // Convert to millions for display
        expense: expense / 1000000,
      });
    }
    
    return data;
  }, [transactions]);

  // Calculate category breakdown for pie chart
  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const monthlyExpenses = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
    });

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || DEFAULT_COLORS[Object.keys(categoryTotals).indexOf(name) % DEFAULT_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  }, [transactions]);

  const totalCategoryExpense = categoryData.reduce((sum, c) => sum + c.value, 0);

  const handleExportCSV = () => {
    exportToCSV(transactions);
    toast({
      title: "Export Berhasil",
      description: "File CSV telah diunduh",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(transactions, monthlyIncome, monthlyExpense, totalBalance);
    toast({
      title: "Export Berhasil",
      description: "File PDF telah diunduh",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0 flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Wallet</SheetTitle>
          <div className="flex items-center gap-2">
            <RecurringSheet />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Balance Card */}
            <div className="fiscal-balance-card">
              <p className="text-primary-foreground/80 text-sm mb-1">Total Saldo</p>
              <h2 className="text-3xl font-bold mb-4">{displayBalance}</h2>
              
              {/* Currency converter */}
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary-foreground/60" />
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-28 h-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Monthly stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="fiscal-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-income-light flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-income" />
                  </div>
                  <span className="text-xs text-muted-foreground">Pemasukan</span>
                </div>
                <p className="text-lg font-bold text-income">
                  +{formatIDR(monthlyIncome)}
                </p>
              </div>
              <div className="fiscal-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-expense-light flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-expense" />
                  </div>
                  <span className="text-xs text-muted-foreground">Pengeluaran</span>
                </div>
                <p className="text-lg font-bold text-expense">
                  -{formatIDR(monthlyExpense)}
                </p>
              </div>
            </div>

            {/* Monthly Spending Chart */}
            <div className="fiscal-card">
              <h3 className="font-medium mb-4">Tren 6 Bulan Terakhir</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={2}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `${v}jt`}
                      width={35}
                    />
                    <Tooltip
                      formatter={(value: number) => formatIDR(value * 1000000)}
                      labelFormatter={(label) => `Bulan ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar 
                      dataKey="income" 
                      fill="hsl(var(--income))" 
                      radius={[4, 4, 0, 0]}
                      name="Pemasukan"
                    />
                    <Bar 
                      dataKey="expense" 
                      fill="hsl(var(--expense))" 
                      radius={[4, 4, 0, 0]}
                      name="Pengeluaran"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-income" />
                  <span className="text-xs text-muted-foreground">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-expense" />
                  <span className="text-xs text-muted-foreground">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            {categoryData.length > 0 && (
              <div className="fiscal-card">
                <h3 className="font-medium mb-4">Pengeluaran per Kategori</h3>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={2}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatIDR(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs truncate max-w-[100px]">{cat.name}</span>
                        </div>
                        <span className="text-xs font-medium">
                          {((cat.value / totalCategoryExpense) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Spending insight */}
            <div className="fiscal-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Insight Bulan Ini</p>
                <p className="text-xs text-muted-foreground">
                  {monthlyIncome > monthlyExpense 
                    ? `Kamu berhasil menabung ${formatIDR(monthlyIncome - monthlyExpense)}!`
                    : `Pengeluaran melebihi pemasukan ${formatIDR(monthlyExpense - monthlyIncome)}`
                  }
                </p>
              </div>
            </div>

            {/* Recent transactions */}
            <div>
              <h3 className="font-medium mb-3">Transaksi Terakhir</h3>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction as any} />
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Belum ada transaksi
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
