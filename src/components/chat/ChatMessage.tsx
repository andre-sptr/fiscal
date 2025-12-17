import { Wallet } from 'lucide-react';
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
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-transparent"
        )}>
          {isUser ? userInitial : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className={cn(
        "max-w-[85%] space-y-3",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Text bubble */}
        {content && (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm",
              isUser
                ? "bg-secondary text-secondary-foreground rounded-tr-sm"
                : "bg-transparent"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-muted-foreground">{content}</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{content}</p>
            )}
          </div>
        )}

        {/* Transaction card */}
        {transactionData && transactionStatus && (
          <TransactionCard
            data={transactionData}
            status={transactionStatus}
            onConfirm={onConfirmTransaction}
            onEdit={onEditTransaction}
            onCancel={onCancelTransaction}
          />
        )}
      </div>
    </div>
  );
};
