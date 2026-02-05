import { Wallet, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TransactionCard, TransactionData } from './TransactionCard';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  userInitial?: string;
  transactionData?: TransactionData;
  transactionStatus?: 'pending' | 'confirmed' | 'cancelled';
  onConfirmTransaction?: () => void;
  onEditTransaction?: () => void;
  onCancelTransaction?: () => void;
  isProcessing?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  userInitial = 'U',
  transactionData,
  transactionStatus,
  onConfirmTransaction,
  onEditTransaction,
  onCancelTransaction,
  isProcessing,
}: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex gap-3 animate-slide-up",
      isUser ? "flex-row-reverse" : ""
    )}>
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-fiscal-sm">
            {userInitial}
          </div>
        ) : (
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {isProcessing && (
              <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm animate-pulse-soft -z-10" />
            )}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "max-w-[85%] space-y-3",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Text bubble */}
        {content && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm transition-all duration-300",
              isUser
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-lg shadow-fiscal-sm"
                : "glass-card border-border/30 rounded-tl-lg"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                {/* Typing indicator dots */}
                <div className="flex gap-1.5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <span className="text-muted-foreground text-xs">{content}</span>
              </div>
            ) : (
              <div className={cn(
                "prose prose-sm max-w-none break-words",
                isUser ? "prose-invert dark:prose-invert" : "dark:prose-invert"
              )}>
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Transaction card */}
        {transactionData && transactionStatus && (
          <div className="animate-scale-in">
            <TransactionCard
              data={transactionData}
              status={transactionStatus}
              onConfirm={onConfirmTransaction}
              onEdit={onEditTransaction}
              onCancel={onCancelTransaction}
            />
          </div>
        )}
      </div>
    </div>
  );
};
