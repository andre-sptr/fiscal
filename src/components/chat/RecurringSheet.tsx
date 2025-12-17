import { useState } from 'react';
import { Plus, Repeat, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { formatIDR } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const frequencyLabels: Record<string, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

export const RecurringSheet = () => {
  const {
    recurringTransactions,
    isLoading,
    addRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
  } = useRecurringTransactions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Gagal menambahkan transaksi berulang",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Transaksi berulang ditambahkan",
      });
      setIsDialogOpen(false);
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
      toast({ title: "Dihapus", description: "Transaksi berulang dihapus" });
    }
  };

  const handleToggle = async (item: RecurringTransaction) => {
    await toggleActive(item.id, !item.is_active);
    toast({
      title: item.is_active ? "Dinonaktifkan" : "Diaktifkan",
      description: `Transaksi berulang ${item.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
    });
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Repeat className="w-4 h-4" />
          Berulang
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Transaksi Berulang</SheetTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Transaksi Berulang</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Type */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData(f => ({ ...f, type: 'expense', category: '' }))}
                    className="w-full"
                  >
                    Pengeluaran
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData(f => ({ ...f, type: 'income', category: '' }))}
                    className="w-full"
                  >
                    Pemasukan
                  </Button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Jumlah (IDR)</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={formData.amount}
                    onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Deskripsi (opsional)</Label>
                  <Input
                    placeholder="Contoh: Gaji bulanan"
                    value={formData.description}
                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label>Frekuensi</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v: any) => setFormData(f => ({ ...f, frequency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="yearly">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Next Due Date */}
                <div className="space-y-2">
                  <Label>Tanggal Pertama</Label>
                  <Input
                    type="date"
                    className="w-full block [&::-webkit-calendar-picker-indicator]:ml-auto"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData(f => ({ ...f, next_due_date: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 pt-0 space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Memuat...</p>
            ) : recurringTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Repeat className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Belum ada transaksi berulang
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tambahkan tagihan bulanan atau gaji rutin
                </p>
              </div>
            ) : (
              recurringTransactions.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "fiscal-card p-4 transition-opacity",
                    !item.is_active && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {item.description || item.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {frequencyLabels[item.frequency]}
                        </span>
                      </div>
                      <p className={cn(
                        "font-bold",
                        item.type === 'income' ? "text-income" : "text-expense"
                      )}>
                        {item.type === 'income' ? '+' : '-'}{formatIDR(item.amount)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Selanjutnya: {format(new Date(item.next_due_date), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggle(item)}
                      >
                        {item.is_active ? (
                          <ToggleRight className="w-5 h-5 text-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
