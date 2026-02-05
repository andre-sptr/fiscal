import { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBudgetGoals, BudgetGoal } from '@/hooks/useBudgetGoals';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryIcon, EXPENSE_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BudgetGoalsSheetProps {
    trigger?: React.ReactNode;
}

export const BudgetGoalsSheet = ({ trigger }: BudgetGoalsSheetProps) => {
    const { goals, isLoading, totalBudget, totalSpent, overallProgress, addGoal, deleteGoal } = useBudgetGoals();
    const { formatCurrency, t } = useLanguage();
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newAmount, setNewAmount] = useState('');

    const handleAddGoal = async () => {
        if (!newCategory || !newAmount) {
            toast.error('Pilih kategori dan masukkan nominal');
            return;
        }

        const amount = parseFloat(newAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Nominal tidak valid');
            return;
        }

        const result = await addGoal(newCategory, amount);
        if (result) {
            toast.success('Budget goal berhasil ditambahkan!');
            setNewCategory('');
            setNewAmount('');
            setIsAdding(false);
        } else {
            toast.error('Gagal menambahkan budget goal');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        const result = await deleteGoal(id);
        if (result) {
            toast.success('Budget goal dihapus');
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return 'bg-expense';
        if (progress >= 80) return 'bg-amber-500';
        return 'bg-income';
    };

    const getProgressStatus = (goal: BudgetGoal) => {
        const progress = (goal.spent / goal.amount) * 100;
        if (progress >= 100) {
            return { icon: AlertTriangle, text: t('goals.status.over'), color: 'text-expense' };
        }
        if (progress >= 80) {
            return { icon: TrendingUp, text: t('goals.status.near'), color: 'text-amber-500' };
        }
        return { icon: CheckCircle2, text: t('goals.status.onTrack'), color: 'text-income' };
    };

    const usedCategories = goals.map(g => g.category);
    const availableCategories = EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c));

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                        <Target className="w-4 h-4" />
                        {t('goals.title')}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/30 glass-panel">
                <SheetHeader className="p-6 pb-4 border-b border-border/30">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary" />
                        </div>
                        {t('goals.title')}
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    {/* Overall Progress */}
                    {goals.length > 0 && (
                        <div className="glass-card mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">{t('goals.totalBudget')}</span>
                                <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
                                <span className="text-sm text-muted-foreground mb-1">/ {formatCurrency(totalBudget)}</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        getProgressColor(overallProgress)
                                    )}
                                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {overallProgress >= 100
                                    ? t('goals.overBudget')
                                    : `${(100 - overallProgress).toFixed(0)}% ${t('goals.remaining')}`}
                            </p>
                        </div>
                    )}

                    {/* Goals List */}
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">{t('goals.loading')}</p>
                            </div>
                        ) : goals.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground mb-2">{t('goals.empty')}</p>
                                <p className="text-xs text-muted-foreground">{t('goals.emptyDesc')}</p>
                            </div>
                        ) : (
                            goals.map((goal) => {
                                const IconComponent = getCategoryIcon(goal.category);
                                const progress = Math.min((goal.spent / goal.amount) * 100, 100);
                                const status = getProgressStatus(goal);
                                const StatusIcon = status.icon;

                                return (
                                    <div key={goal.id} className="glass-card group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{goal.category}</p>
                                                <div className="flex items-center gap-1">
                                                    <StatusIcon className={cn("w-3 h-3", status.color)} />
                                                    <span className={cn("text-xs", status.color)}>{status.text}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteGoal(goal.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-lg font-bold">{formatCurrency(goal.spent)}</span>
                                            <span className="text-xs text-muted-foreground mb-0.5">/ {formatCurrency(goal.amount)}</span>
                                        </div>

                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    getProgressColor(progress)
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Add New Goal Form */}
                    {isAdding ? (
                        <div className="glass-card mt-4 space-y-3">
                            <h4 className="font-medium">{t('goals.add')}</h4>
                            <Select value={newCategory} onValueChange={setNewCategory}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder={t('goals.selectCategory')} />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                    {availableCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder={t('goals.amountPlaceholder')}
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                className="rounded-xl"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleAddGoal} className="flex-1 rounded-xl">
                                    {t('common.save')}
                                </Button>
                                <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl">
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full mt-4 rounded-xl gap-2 border-dashed"
                            onClick={() => setIsAdding(true)}
                            disabled={availableCategories.length === 0}
                        >
                            <Plus className="w-4 h-4" />
                            {t('goals.add')}
                        </Button>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
