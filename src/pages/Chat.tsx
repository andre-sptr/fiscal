import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2, Wallet, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { formatIDR } from '@/lib/currency';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  "Berapa pengeluaran saya minggu ini?",
  "Kategori mana yang paling banyak?",
  "Bagaimana tren keuangan saya?",
  "Tips menghemat uang",
];

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, monthlyIncome, monthlyExpense, totalBalance } = useTransactions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Calculate this week's transactions
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weekExpense = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const weekIncome = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate category breakdown
    const categoryTotals: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    if (lowerMessage.includes('minggu') || lowerMessage.includes('week')) {
      return `📊 **Ringkasan Minggu Ini:**\n\n` +
        `💰 Total Pemasukan: ${formatIDR(weekIncome)}\n` +
        `💸 Total Pengeluaran: ${formatIDR(weekExpense)}\n` +
        `📈 Selisih: ${formatIDR(weekIncome - weekExpense)}\n\n` +
        `Kamu memiliki ${weekTransactions.length} transaksi minggu ini.`;
    }

    if (lowerMessage.includes('kategori') || lowerMessage.includes('category') || lowerMessage.includes('paling banyak')) {
      if (!topCategory) {
        return "Kamu belum memiliki transaksi pengeluaran. Mulai catat transaksimu untuk melihat analisis kategori!";
      }
      return `📊 **Analisis Kategori Pengeluaran:**\n\n` +
        `Kategori dengan pengeluaran terbesar adalah **${topCategory[0]}** dengan total ${formatIDR(topCategory[1])}.\n\n` +
        Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map((cat, i) => `${i + 1}. ${cat[0]}: ${formatIDR(cat[1])}`)
          .join('\n');
    }

    if (lowerMessage.includes('tren') || lowerMessage.includes('trend') || lowerMessage.includes('keuangan')) {
      const ratio = monthlyExpense > 0 ? (monthlyIncome / monthlyExpense).toFixed(2) : 'N/A';
      return `📈 **Tren Keuangan Bulan Ini:**\n\n` +
        `💰 Total Saldo: ${formatIDR(totalBalance)}\n` +
        `📥 Pemasukan Bulan Ini: ${formatIDR(monthlyIncome)}\n` +
        `📤 Pengeluaran Bulan Ini: ${formatIDR(monthlyExpense)}\n` +
        `📊 Rasio Income/Expense: ${ratio}x\n\n` +
        (monthlyIncome > monthlyExpense 
          ? "✅ Bagus! Pemasukanmu lebih besar dari pengeluaran."
          : "⚠️ Perhatian! Pengeluaranmu melebihi pemasukan bulan ini.");
    }

    if (lowerMessage.includes('tips') || lowerMessage.includes('hemat') || lowerMessage.includes('saran')) {
      return `💡 **Tips Menghemat Uang:**\n\n` +
        `1. **50/30/20 Rule**: Alokasikan 50% untuk kebutuhan, 30% keinginan, 20% tabungan.\n\n` +
        `2. **Catat Semua Transaksi**: Gunakan Fiscal untuk melacak setiap pengeluaran.\n\n` +
        `3. **Buat Budget Bulanan**: Tentukan batas pengeluaran per kategori.\n\n` +
        `4. **Review Mingguan**: Cek pengeluaran setiap minggu untuk tetap on track.\n\n` +
        `5. **Darurat Fund**: Simpan 3-6 bulan pengeluaran untuk dana darurat.`;
    }

    return `Halo! Saya Fiscal AI Assistant. Berikut ringkasan keuanganmu:\n\n` +
      `💰 Total Saldo: ${formatIDR(totalBalance)}\n` +
      `📥 Pemasukan Bulan Ini: ${formatIDR(monthlyIncome)}\n` +
      `📤 Pengeluaran Bulan Ini: ${formatIDR(monthlyExpense)}\n\n` +
      `Ada yang bisa saya bantu? Coba tanyakan:\n` +
      `• "Berapa pengeluaran saya minggu ini?"\n` +
      `• "Kategori mana yang paling banyak?"\n` +
      `• "Tips menghemat uang"`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = generateResponse(userMessage.content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center gap-3 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Fiscal AI</h1>
              <p className="text-xs text-muted-foreground">Asisten Keuangan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container px-4 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Halo! Saya Fiscal AI</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Tanyakan apa saja tentang keuanganmu. Saya siap membantu menganalisis transaksi dalam IDR.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(q)}
                  className="p-3 text-sm text-left bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {message.role === 'user' ? userInitial : <Wallet className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'fiscal-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-muted">
                    <Wallet className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="fiscal-card p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50 p-4">
        <div className="container flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya tentang keuanganmu..."
            className="fiscal-input"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
