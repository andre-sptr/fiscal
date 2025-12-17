import { useState, useRef, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { BalanceHeader } from '@/components/chat/BalanceHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { WalletSheet } from '@/components/chat/WalletSheet';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useChatSessions, Message } from '@/hooks/useChatSessions';
import { isQuestion } from '@/lib/parseTransaction';
import { formatIDR } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, monthlyIncome, monthlyExpense, totalBalance, refetch } = useTransactions();
  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    setIsLoading,
    addMessage,
    updateMessageStatus,
    updateMessageData,
    selectSession,
    startNewChat,
    deleteSession,
  } = useChatSessions();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTransactionData, setEditTransactionData] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate local response for questions using transaction data
  const generateQuestionResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryTotals: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    if (lowerMessage.includes('minggu') || lowerMessage.includes('week')) {
      return `📊 Minggu ini:\n\n💰 Pemasukan: ${formatIDR(weekIncome)}\n💸 Pengeluaran: ${formatIDR(weekExpense)}\n📈 Selisih: ${formatIDR(weekIncome - weekExpense)}`;
    }

    if (lowerMessage.includes('kategori') || lowerMessage.includes('paling banyak')) {
      if (!topCategory) return "Belum ada data pengeluaran untuk dianalisis.";
      return `Pengeluaran terbesar: ${topCategory[0]} (${formatIDR(topCategory[1])})`;
    }

    if (lowerMessage.includes('tips') || lowerMessage.includes('hemat')) {
      return "💡 Tips: Coba aturan 50/30/20 — 50% kebutuhan, 30% keinginan, 20% tabungan!";
    }

    return `💰 Saldo: ${formatIDR(totalBalance)}\n📥 Pemasukan bulan ini: ${formatIDR(monthlyIncome)}\n📤 Pengeluaran bulan ini: ${formatIDR(monthlyExpense)}`;
  };

  // Call AI edge function to parse transaction
  const parseTransactionWithAI = async (content: string, type: 'text' | 'image') => {
    try {
      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { type, content }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Failed to parse transaction:', err);
      return { 
        success: false, 
        message: 'Gagal memproses. Coba lagi.' 
      };
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (content.trim().toLowerCase() === 'edit') {
      const lastPendingMsg = [...messages].reverse().find(
        m => m.role === 'assistant' && m.status === 'pending_confirmation'
      );

      if (lastPendingMsg) {
        handleEditTransaction(lastPendingMsg);
        return;
      }
    }

    setIsLoading(true);

    // Add user message
    await addMessage(content, 'user');

    try {
      // Check if it's a question or transaction
      if (isQuestion(content)) {
        // Handle as question locally (faster)
        const response = generateQuestionResponse(content);
        await addMessage(response, 'assistant');
      } else {
        // Use AI to parse transaction
        const result = await parseTransactionWithAI(content, 'text');
        
        if (result.success && result.transaction) {
          const { amount, type, category, description } = result.transaction;
          const transactionData = { amount, type, category, description };
          
          await addMessage(
            result.message || `Oke, saya catat ${formatIDR(amount)} untuk "${category}". Benar?`,
            'assistant',
            transactionData,
            'pending_confirmation'
          );
        } else {
          await addMessage(
            result.message || "Maaf, saya tidak mengerti. Coba ketik seperti: \"Beli kopi 25rb\"",
            'assistant'
          );
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
      await addMessage("Terjadi kesalahan. Silakan coba lagi.", 'assistant');
    }

    setIsLoading(false);
  };

  const handleConfirmTransaction = async (message: Message) => {
    if (!message.transaction_data || !user) return;

    const { amount, type, category, description } = message.transaction_data;

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount,
      type,
      category,
      description: description || null,
      date: new Date().toISOString().split('T')[0],
    });

    if (!error) {
      await updateMessageStatus(message.id, 'confirmed');
      await addMessage("✅ Transaksi berhasil disimpan!", 'assistant');
      refetch();
    } else {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive"
      });
    }
  };

  const handleEditTransaction = (message: Message) => {
    if (!message.transaction_data) return;
    setEditTransactionData({
      amount: message.transaction_data.amount.toString(),
      type: message.transaction_data.type,
      category: message.transaction_data.category,
      description: message.transaction_data.description || '',
    });
    setEditingMessageId(message.id);
    setIsAddDialogOpen(true);
  };

  const handleCancelTransaction = async (message: Message) => {
    await updateMessageStatus(message.id, 'cancelled');
    await addMessage("Dibatalkan. Ada yang lain?", 'assistant');
  };

  const handleUploadReceipt = async (file: File) => {
    setIsLoading(true);
    await addMessage("📷 Menganalisis struk...", 'user');

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call AI to parse receipt
      const result = await parseTransactionWithAI(base64, 'image');

      if (result.success && result.transaction) {
        const { amount, type, category, description } = result.transaction;
        const transactionData = { amount, type, category, description };
        
        await addMessage(
          result.message || `Saya menemukan transaksi ${formatIDR(amount)} untuk "${category}". Benar?`,
          'assistant',
          transactionData,
          'pending_confirmation'
        );
      } else {
        await addMessage(
          result.message || "Tidak dapat membaca struk. Coba foto yang lebih jelas.",
          'assistant'
        );
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      await addMessage("Gagal memproses struk. Silakan coba lagi.", 'assistant');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={startNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Balance header */}
        <BalanceHeader 
          balance={totalBalance} 
          onClick={() => setIsWalletOpen(true)} 
        />

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              // Welcome state
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-xl font-semibold mb-2 text-center">
                  Halo! Ada pengeluaran atau pemasukan apa hari ini?
                </h1>
                <p className="text-muted-foreground text-center text-sm max-w-md mb-8">
                  Ketik transaksi seperti "Habis beli kopi 25rb" atau upload struk dengan tombol klip di bawah.
                </p>

                {/* Quick suggestions */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {[
                    "Beli makan siang 20rb",
                    "Gaji bulan ini 5jt",
                    "Berapa pengeluaran minggu ini?",
                    "Tips menghemat uang",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-3 text-sm text-left bg-secondary/50 hover:bg-secondary rounded-xl transition-colors border border-border/50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat messages
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    userInitial={userInitial}
                    transactionData={message.transaction_data || undefined}
                    transactionStatus={
                      message.status === 'pending_confirmation' ? 'pending' :
                      message.status === 'confirmed' ? 'confirmed' :
                      message.status === 'cancelled' ? 'cancelled' : undefined
                    }
                    onConfirmTransaction={() => handleConfirmTransaction(message)}
                    onEditTransaction={() => handleEditTransaction(message)}
                    onCancelTransaction={() => handleCancelTransaction(message)}
                  />
                ))}

                {isLoading && (
                  <ChatMessage
                    role="assistant"
                    content="Sedang memproses..."
                    isProcessing
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input area */}
        <ChatInput
          onSend={handleSendMessage}
          onUploadReceipt={handleUploadReceipt}
          isLoading={isLoading}
        />
      </div>

      {/* Wallet Sheet */}
      <WalletSheet
        open={isWalletOpen}
        onOpenChange={setIsWalletOpen}
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        transactions={transactions}
      />

      {/* Add/Edit Transaction Dialog */}
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingMessageId(null);
        }}
        initialData={editTransactionData} 
        onSuccess={async (savedData) => {
          refetch();
          setEditTransactionData(null);
          
          if (editingMessageId && savedData) {
            await updateMessageData(editingMessageId, {
              amount: savedData.amount,
              type: savedData.type,
              category: savedData.category,
              description: savedData.description
            });

            await updateMessageStatus(editingMessageId, 'confirmed');
            
            await addMessage("✅ Data berhasil diperbarui dan disimpan!", 'assistant');
            
            setEditingMessageId(null);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
