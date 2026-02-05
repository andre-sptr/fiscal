import { useState } from 'react';
import { Plus, Repeat, Trash2, ToggleLeft, ToggleRight, Calendar, CheckCircle2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecurringTransactions, RecurringTransaction } from '@/hooks/useRecurringTransactions';
import { categories } from '@/lib/categories';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const RecurringSheet = () => {
  const {
    recurringTransactions,
    isLoading,
    addRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
  } = useRecurringTransactions();
  const { formatCurrency, t } = useLanguage();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    next_due_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category) {
      toast.error(t('recurring.error.missingFields') || "Lengkapi semua field");
      return;
    }

    const { error } = await addRecurringTransaction({
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description || null,
      frequency: formData.frequency,
      next_due_date: formData.next_due_date,
      is_active: true,
    });

    if (error) {
      toast.error(t('recurring.error.failed') || "Gagal menambahkan");
    } else {
      toast.success(t('recurring.saved'));
      setIsAdding(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        frequency: 'monthly',
        next_due_date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteRecurringTransaction(id);
    if (!error) {
      toast.success(t('recurring.deleted'));
    }
  };

  const handleToggle = async (item: RecurringTransaction) => {
    await toggleActive(item.id, !item.is_active);
    toast.success(item.is_active ? t('recurring.inactive') : t('recurring.active'));
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  // Helper to get translated frequency
  const getFrequencyLabel = (freq: string) => {
    return t(`recurring.frequency.${freq}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <Repeat className="w-4 h-4" />
          {t('recurring.title')}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/30 glass-panel">
        <SheetHeader className="p-6 pb-4 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Repeat className="w-4 h-4 text-primary" />
            </div>
            {t('recurring.title')}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('goals.loading')}</p>
              </div>
            ) : recurringTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Repeat className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">{t('recurring.empty')}</p>
                <p className="text-xs text-muted-foreground">{t('recurring.emptyDesc')}</p>
              </div>
            ) : (
              recurringTransactions.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "glass-card group",
                    !item.is_active && "opacity-60 grayscale"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {item.description || item.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                          {getFrequencyLabel(item.frequency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {t('recurring.next').replace('{date}', format(new Date(item.next_due_date), 'dd MMM yyyy'))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-lg hover:bg-muted transition-colors",
                          item.is_active ? "text-primary hover:text-primary/80" : "text-muted-foreground"
                        )}
                        onClick={() => handleToggle(item)}
                      >
                        {item.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-border/10 pt-2 mt-2">
                    <p className={cn(
                      "font-bold text-lg",
                      item.type === 'income' ? "text-income" : "text-expense"
                    )}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {t('recurring.type.' + item.type)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Form */}
          {isAdding ? (
            <div className="glass-card mt-4 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t('recurring.add')}</h4>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, type: 'expense', category: '' }))}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded-lg transition-all",
                    formData.type === 'expense'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('recurring.type.expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, type: 'income', category: '' }))}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded-lg transition-all",
                    formData.type === 'income'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('recurring.type.income')}
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('recurring.amount')}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t('recurring.category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={t('goals.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t('recurring.description')}</Label>
                  <Input
                    placeholder="..."
                    value={formData.description}
                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('recurring.frequency')}</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(v: any) => setFormData(f => ({ ...f, frequency: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="daily">{t('recurring.frequency.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('recurring.frequency.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('recurring.frequency.monthly')}</SelectItem>
                        <SelectItem value="yearly">{t('recurring.frequency.yearly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('recurring.startDate')}</Label>
                    <Input
                      type="date"
                      className="rounded-xl block [&::-webkit-calendar-picker-indicator]:ml-auto"
                      value={formData.next_due_date}
                      onChange={(e) => setFormData(f => ({ ...f, next_due_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSubmit} className="flex-1 rounded-xl">
                    {t('common.save')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl">
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-4 rounded-xl gap-2 border-dashed h-12"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4" />
              {t('recurring.add')}
            </Button>
          )}

        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
