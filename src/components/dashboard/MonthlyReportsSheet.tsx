import { useMemo } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryIcon } from '@/lib/categories';
import { cn } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Cell,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface MonthData {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

interface MonthlyReportsSheetProps {
    trigger?: React.ReactNode;
}

export const MonthlyReportsSheet = ({ trigger }: MonthlyReportsSheetProps) => {
    const { transactions } = useTransactions();
    const { formatCurrency, t } = useLanguage();

    // Calculate last 6 months data
    const monthlyData: MonthData[] = useMemo(() => {
        const data: MonthData[] = [];
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
                income: income / 1000000, // in millions
                expense: expense / 1000000,
                balance: (income - expense) / 1000000,
            });
        }

        return data;
    }, [transactions]);

    // Current month details
    const currentMonthData = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

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

        // Category breakdown
        const categoryTotals: Record<string, number> = {};
        monthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
            });

        const topCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        return {
            monthName: format(now, 'MMMM yyyy', { locale: id }),
            income,
            expense,
            balance: income - expense,
            transactionCount: monthTransactions.length,
            topCategories,
        };
    }, [transactions]);

    const handleDownloadReport = () => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });

        exportToPDF(
            monthTransactions,
            currentMonthData.income,
            currentMonthData.expense,
            currentMonthData.balance,
            formatCurrency
        );
        toast.success('Laporan PDF berhasil diunduh!');
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <Calendar className="w-4 h-4" />
                        {t('reports.title')}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/30 glass-panel">
                <SheetHeader className="p-6 pb-4 border-b border-border/30">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary-foreground" />
                        </div>
                        {t('reports.monthly')}
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {/* Current Month Summary */}
                    <div className="glass-card mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">{currentMonthData.monthName}</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 rounded-lg text-xs"
                                onClick={handleDownloadReport}
                            >
                                <Download className="w-3 h-3" />
                                PDF
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-income/5 border border-income/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-3 h-3 text-income" />
                                    <span className="text-[10px] text-muted-foreground uppercase">{t('balance.income')}</span>
                                </div>
                                <p className="text-lg font-bold text-income">{formatCurrency(currentMonthData.income)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-expense/5 border border-expense/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="w-3 h-3 text-expense" />
                                    <span className="text-[10px] text-muted-foreground uppercase">{t('balance.expense')}</span>
                                </div>
                                <p className="text-lg font-bold text-expense">{formatCurrency(currentMonthData.expense)}</p>
                            </div>
                        </div>

                        <div className={cn(
                            "p-3 rounded-xl",
                            currentMonthData.balance >= 0
                                ? "bg-income/5 border border-income/20"
                                : "bg-expense/5 border border-expense/20"
                        )}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{t('reports.balanceMonth')}</span>
                                <span className={cn(
                                    "font-bold",
                                    currentMonthData.balance >= 0 ? "text-income" : "text-expense"
                                )}>
                                    {currentMonthData.balance >= 0 ? '+' : ''}{formatCurrency(currentMonthData.balance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 6 Month Trend */}
                    <div className="glass-card mb-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            {t('reports.trend')}
                        </h3>
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
                                        formatter={(value: number) => formatCurrency(value * 1000000)}
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

                    {/* Top Categories */}
                    {currentMonthData.topCategories.length > 0 && (
                        <div className="glass-card">
                            <h3 className="font-semibold mb-3">{t('reports.topExpenses')}</h3>
                            <div className="space-y-2">
                                {currentMonthData.topCategories.map((cat, index) => {
                                    const IconComponent = getCategoryIcon(cat.name);
                                    const percentage = currentMonthData.expense > 0
                                        ? (cat.value / currentMonthData.expense) * 100
                                        : 0;

                                    return (
                                        <div key={cat.name} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                                <IconComponent className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs truncate">{cat.name}</span>
                                                    <span className="text-xs font-medium">{formatCurrency(cat.value)}</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
