import { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, RefreshCw, Download, FileText, FileSpreadsheet, Wallet as WalletIcon, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/useLanguage';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { RecurringSheet } from './RecurringSheet';
import { BudgetGoalsSheet } from '@/components/dashboard/BudgetGoalsSheet';
import { InsightsSheet } from '@/components/dashboard/InsightsSheet';
import { MonthlyReportsSheet } from '@/components/dashboard/MonthlyReportsSheet';
import { toast } from 'sonner';
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
  CartesianGrid,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const { formatCurrency, t } = useLanguage();

  const displayBalance = formatCurrency(totalBalance);

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
        fullIncome: income,
        fullExpense: expense,
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
    exportToCSV(transactions, formatCurrency);
    toast.success("File CSV berhasil diexport");
  };

  const handleExportPDF = () => {
    exportToPDF(transactions, monthlyIncome, monthlyExpense, totalBalance, formatCurrency);
    toast.success("File PDF berhasil diexport");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[735px] p-0 flex flex-col border-l border-border/30 glass-panel">
        <SheetHeader className="p-6 pb-4 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <WalletIcon className="w-4 h-4 text-primary" />
            </div>
            {t('wallet.title')}
          </SheetTitle>
        </SheetHeader>

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b border-border/30 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2 min-w-max p-1">
            <MonthlyReportsSheet />
            <InsightsSheet />
            <BudgetGoalsSheet />
            <RecurringSheet />
            <div className="w-px h-6 bg-border/50 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 border-dashed">
                  <Download className="w-4 h-4" />
                  {t('wallet.export')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/30">
                <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('wallet.exportCsv')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  {t('wallet.exportPdf')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 shadow-fiscal-lg group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <WalletIcon className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <p className="text-primary-foreground/80 text-sm font-medium mb-1 flex items-center gap-2">
                  {t('balance.total')}
                  <span className="inline-flex w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </p>
                <h2 className="text-4xl font-bold mb-6 tracking-tight">{displayBalance}</h2>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-2 text-white/90 mb-1">
                      <div className="p-1 rounded-full bg-white/20">
                        <ArrowDownLeft className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium">{t('balance.income')}</span>
                    </div>
                    <p className="text-lg font-bold">+{formatCurrency(monthlyIncome)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-2 text-white/90 mb-1">
                      <div className="p-1 rounded-full bg-white/20">
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium">{t('balance.expense')}</span>
                    </div>
                    <p className="text-lg font-bold">-{formatCurrency(monthlyExpense)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Spending Chart */}
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    {t('wallet.trend')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{t('reports.trend')}</p>
                </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={4} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--income))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--expense))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `${v}M`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card border-border/50 p-3 shadow-xl !bg-background/95 backdrop-blur-xl rounded-xl">
                              <p className="text-xs font-semibold mb-2 text-muted-foreground">{label}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-income" />
                                  <span className="text-muted-foreground">{t('balance.income')}:</span>
                                  <span className="font-mono font-medium text-foreground">
                                    {formatCurrency(payload[0].payload.fullIncome)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-expense" />
                                  <span className="text-muted-foreground">{t('balance.expense')}:</span>
                                  <span className="font-mono font-medium text-foreground">
                                    {formatCurrency(payload[0].payload.fullExpense)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="url(#incomeGradient)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      name={t('balance.income')}
                    />
                    <Bar
                      dataKey="expense"
                      fill="url(#expenseGradient)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      name={t('balance.expense')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="grid grid-cols-1 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {categoryData.length > 0 ? (
                <div className="glass-card p-5">
                  <h3 className="font-semibold flex items-center gap-2 text-lg mb-6">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    {t('wallet.categoryBreakdown')}
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-40 h-40 shrink-0 relative">
                      {/* Center text for Donut feeling */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-[10px] text-muted-foreground">{t('balance.total')}</span>
                        <span className="text-xs font-bold text-foreground">{formatCurrency(totalCategoryExpense).split(',')[0]}</span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl border border-border">
                                    <p className="font-medium mb-1">{data.name}</p>
                                    <p className="font-mono">{formatCurrency(data.value)}</p>
                                  </div>
                                )
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      {categoryData.map((cat, index) => (
                        <div key={index} className="group">
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full ring-2 ring-transparent group-hover:ring-border/50 transition-all"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-xs font-medium text-foreground/90 truncate max-w-[120px]">{cat.name}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              {((cat.value / totalCategoryExpense) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(cat.value / totalCategoryExpense) * 100}%`, backgroundColor: cat.color, opacity: 0.8 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <PieChartIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t('wallet.noTransactions')}
                  </p>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{t('wallet.recentTransactions')}</h3>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction as any} />
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-10 glass-card rounded-2xl border-dashed">
                    <p className="text-sm text-muted-foreground">
                      {t('wallet.noTransactions')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
