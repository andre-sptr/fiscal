import { useState, useRef } from 'react';
import { Paperclip, Send, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onUploadReceipt: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput = ({
  onSend,
  onUploadReceipt,
  disabled,
  isLoading,
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadReceipt(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-background border-t border-border p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-secondary/50 rounded-2xl p-2 border border-border/50">
          {/* Attachment button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 rounded-xl h-10 w-10"
                disabled={disabled || isLoading}
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Struk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                Ambil Foto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text input */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik transaksi atau tanya sesuatu..."
            className={cn(
              "flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2.5 text-sm",
              "placeholder:text-muted-foreground"
            )}
            disabled={disabled || isLoading}
            rows={1}
          />

          {/* Send button */}
          <Button 
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || disabled || isLoading}
            className="shrink-0 rounded-xl h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Contoh: "Habis beli kopi 25rb" atau "Gaji bulan ini 5 juta"
        </p>
      </div>
    </div>
  );
};
