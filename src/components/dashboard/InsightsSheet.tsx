import { useMemo } from 'react';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Wallet, ArrowUpRight, ArrowDownLeft, Lightbulb, LineChart } from 'lucide-react';
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
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#0d9488', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

interface InsightsSheetProps {
    trigger?: React.ReactNode;
}

export const InsightsSheet = ({ trigger }: InsightsSheetProps) => {
    const { transactions, monthlyIncome, monthlyExpense, totalBalance } = useTransactions();
    const { formatCurrency, t } = useLanguage();

    // Calculate category breakdown
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
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length],
                percentage: monthlyExpense > 0 ? (value / monthlyExpense) * 100 : 0,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions, monthlyExpense]);

    // Daily spending trend for last 14 days
    const dailyTrend = useMemo(() => {
        const now = new Date();
        const twoWeeksAgo = subMonths(now, 0.5);
        const days = eachDayOfInterval({ start: twoWeeksAgo, end: now });

        return days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayExpense = transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(dayStr))
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return {
                date: format(day, 'd MMM', { locale: id }),
                amount: dayExpense / 1000, // in thousands
            };
        });
    }, [transactions]);

    // Calculate insights
    const insights = useMemo(() => {
        const avgDailySpending = monthlyExpense / new Date().getDate();
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
        const topCategory = categoryData[0];

        return {
            avgDailySpending,
            savingsRate,
            topCategory,
        };
    }, [monthlyExpense, monthlyIncome, categoryData]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <PieChartIcon className="w-4 h-4" />
                        {t('insights.title')}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/30 glass-panel">
                <SheetHeader className="p-6 pb-4 border-b border-border/30">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <LineChart className="w-4 h-4 text-primary-foreground" />
                        </div>
                        {t('insights.financial')}
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="glass-card">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-income/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-income" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{t('insights.savingsRate')}</p>
                            <p className={cn(
                                "text-xl font-bold",
                                insights.savingsRate >= 20 ? "text-income" : insights.savingsRate >= 0 ? "text-foreground" : "text-expense"
                            )}>
                                {insights.savingsRate.toFixed(0)}%
                            </p>
                        </div>
                        <div className="glass-card">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-expense" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{t('insights.avgDaily')}</p>
                            <p className="text-xl font-bold">{formatCurrency(insights.avgDailySpending)}</p>
                        </div>
                    </div>

                    {/* Spending Trend Chart */}
                    <div className="glass-card mb-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-primary" />
                            {t('insights.trend14')}
                        </h3>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrend}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value * 1000)}
                                        labelFormatter={(label) => label}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {categoryData.length > 0 && (
                        <div className="glass-card mb-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-primary" />
                                {t('insights.breakdown')}
                            </h3>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={20}
                                                outerRadius={40}
                                                paddingAngle={2}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {categoryData.slice(0, 4).map((cat) => {
                                        const IconComponent = getCategoryIcon(cat.name);
                                        return (
                                            <div key={cat.name} className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                <span className="text-xs truncate flex-1">{cat.name}</span>
                                                <span className="text-xs font-medium">{cat.percentage.toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Smart Tips */}
                    <div className="glass-card">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            {t('insights.tips')}
                        </h3>
                        <div className="space-y-3">
                            {insights.savingsRate < 20 && (
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs">💡</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Savings rate di bawah 20%. Coba kurangi pengeluaran di kategori {insights.topCategory?.name || 'teratas'}.
                                    </p>
                                </div>
                            )}
                            {insights.topCategory && insights.topCategory.percentage > 40 && (
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-xs">📊</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {insights.topCategory.percentage.toFixed(0)}% pengeluaran di {insights.topCategory.name}. Pertimbangkan budget untuk kategori ini.
                                    </p>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-income/5 border border-income/20">
                                <div className="w-6 h-6 rounded-lg bg-income/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs">🎯</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Buat budget goals untuk setiap kategori agar pengeluaran lebih terkontrol.
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
