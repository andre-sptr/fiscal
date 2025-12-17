import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, FileText, Loader2, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { formatIDR, parseIDRInput } from '@/lib/currency';
import { categories, getCategoriesByType } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddTransactionDialog = ({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) => {
  const [mode, setMode] = useState<'manual' | 'receipt'>('manual');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setReceiptPreview(null);
    setMode('manual');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setReceiptPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate AI processing
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data
    setAmount('150000');
    setCategory('food');
    setDescription('Makan siang - Warung Padang');
    setType('expense');
    setIsProcessing(false);
    
    toast({
      title: "Struk Berhasil Diproses",
      description: "Data telah diekstrak. Silakan review dan konfirmasi.",
    });
  };

  const handleSubmit = async () => {
    if (!amount || !category || !user) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Mohon isi jumlah dan kategori.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: parseIDRInput(amount),
        type,
        category,
        description: description || null,
        date,
        currency: 'IDR',
      });

      if (error) throw error;

      toast({
        title: "Transaksi Berhasil Disimpan",
        description: `${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${formatIDR(parseIDRInput(amount))} telah ditambahkan.`,
      });
      
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = getCategoriesByType(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'receipt')} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="w-4 h-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-2">
              <Camera className="w-4 h-4" />
              Upload Struk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="mt-4">
            {!receiptPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Tap untuk upload foto struk</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleReceiptUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-40 object-cover rounded-2xl"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 rounded-2xl flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">AI Memproses...</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {(mode === 'manual' || receiptPreview) && !isProcessing && (
          <div className="space-y-4 mt-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                className={`flex-1 gap-2 ${type === 'expense' ? 'bg-expense hover:bg-expense/90' : ''}`}
                onClick={() => setType('expense')}
              >
                <ArrowUpRight className="w-4 h-4" />
                Pengeluaran
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={`flex-1 gap-2 ${type === 'income' ? 'bg-income hover:bg-income/90' : ''}`}
                onClick={() => setType('income')}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Pemasukan
              </Button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Jumlah (IDR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="pl-10 text-lg font-semibold fiscal-input"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Kategori</Label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.slice(0, 8).map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-transparent bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs text-center line-clamp-1">{cat.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="fiscal-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan catatan..."
                className="fiscal-input resize-none"
                rows={2}
              />
            </div>

            <Button 
              className="w-full h-12 text-base font-semibold gap-2" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Simpan Transaksi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
