import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Flame, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgetGoals } from '@/hooks/useBudgetGoals';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { differenceInDays, startOfMonth, endOfMonth } from 'date-fns';

interface Alert {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    icon: typeof AlertTriangle;
}

export const SpendingAlerts = () => {
    const { monthlyExpense, monthlyIncome, transactions } = useTransactions();
    const { goals, totalSpent, totalBudget } = useBudgetGoals();
    const { formatCurrency, t } = useLanguage();
    const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

    // Load dismissed alerts from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('fiscal_dismissed_alerts');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Only keep dismissals from current month
            const currentMonth = new Date().toISOString().slice(0, 7);
            if (parsed.month === currentMonth) {
                setDismissedAlerts(parsed.ids || []);
            }
        }
    }, []);

    const dismissAlert = (id: string) => {
        const newDismissed = [...dismissedAlerts, id];
        setDismissedAlerts(newDismissed);
        localStorage.setItem('fiscal_dismissed_alerts', JSON.stringify({
            month: new Date().toISOString().slice(0, 7),
            ids: newDismissed,
        }));
    };

    // Generate alerts based on spending patterns
    const alerts: Alert[] = [];

    // 1. Budget over limit alerts
    goals.forEach(goal => {
        const progress = (goal.spent / goal.amount) * 100;
        if (progress >= 100) {
            alerts.push({
                id: `budget-over-${goal.category}`,
                type: 'danger',
                title: t('alerts.budgetOver'),
                message: t('alerts.budgetOverDesc').replace('{category}', goal.category),
                icon: AlertTriangle,
            });
        } else if (progress >= 80) {
            alerts.push({
                id: `budget-warning-${goal.category}`,
                type: 'warning',
                title: t('alerts.budgetNear'),
                message: t('alerts.budgetNearDesc').replace('{category}', goal.category).replace('{percent}', progress.toFixed(0)),
                icon: TrendingUp,
            });
        }
    });

    // 2. High spending rate alert
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const daysPassed = differenceInDays(now, monthStart) + 1;
    const expectedSpendingRate = daysPassed / daysInMonth;

    if (totalBudget > 0) {
        const actualSpendingRate = totalSpent / totalBudget;
        if (actualSpendingRate > expectedSpendingRate * 1.3) {
            alerts.push({
                id: 'high-spending-rate',
                type: 'warning',
                title: t('alerts.spendingFast'),
                message: t('alerts.spendingFastDesc'),
                icon: Flame,
            });
        }
    }

    // 3. Expense vs Income ratio
    if (monthlyIncome > 0 && monthlyExpense > monthlyIncome * 0.8) {
        alerts.push({
            id: 'expense-ratio',
            type: monthlyExpense > monthlyIncome ? 'danger' : 'warning',
            title: monthlyExpense > monthlyIncome ? t('alerts.expenseIncomeHigh') : t('alerts.ratioHigh'),
            message: monthlyExpense > monthlyIncome
                ? t('alerts.expenseHighDesc')
                : t('alerts.ratioHighDesc').replace('{percent}', ((monthlyExpense / monthlyIncome) * 100).toFixed(0)),
            icon: AlertTriangle,
        });
    }

    // Filter dismissed alerts
    const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

    if (activeAlerts.length === 0) return null;

    return (
        <div className="space-y-2">
            {activeAlerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                    <div
                        key={alert.id}
                        className={cn(
                            "glass-card p-4 flex items-start gap-3 animate-slide-up",
                            alert.type === 'danger' && "border-expense/50 bg-expense/5",
                            alert.type === 'warning' && "border-amber-500/50 bg-amber-500/5",
                            alert.type === 'info' && "border-primary/50 bg-primary/5"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            alert.type === 'danger' && "bg-expense/10",
                            alert.type === 'warning' && "bg-amber-500/10",
                            alert.type === 'info' && "bg-primary/10"
                        )}>
                            <IconComponent className={cn(
                                "w-5 h-5",
                                alert.type === 'danger' && "text-expense",
                                alert.type === 'warning' && "text-amber-500",
                                alert.type === 'info' && "text-primary"
                            )} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-7 w-7 rounded-lg opacity-60 hover:opacity-100"
                            onClick={() => dismissAlert(alert.id)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};
