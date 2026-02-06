import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Camera, Image as ImageIcon, Loader2, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- LOGIKA KAMERA ---
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode }
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera Error:", err);
          toast.error("Gagal mengakses kamera. Pastikan izin diberikan.");
          setIsCameraOpen(false);
        }
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, facingMode]);

  const capturePhoto = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onUploadReceipt(file);
            setIsCameraOpen(false);
            toast.success("Foto berhasil diambil!");
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const toggleCameraFlip = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

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
    <>
      {/* MODAL KAMERA */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-black border-none shadow-2xl ring-1 ring-white/10 [&>button]:hidden">

          {/* Efek Flash Layar */}
          <div className={cn(
            "absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-150",
            isFlashing ? "opacity-100" : "opacity-0"
          )} />

          {/* Header Modern dengan Gradient */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-white text-lg font-medium tracking-wide drop-shadow-md">
                  Ambil Foto
                </DialogTitle>
                <p className="text-white/70 text-xs mt-1 font-light tracking-wider uppercase">
                  {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 backdrop-blur-md transition-colors"
                onClick={() => setIsCameraOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Area Viewfinder */}
          <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                facingMode === 'user' && "scale-x-[-1]"
              )}
            />

            {/* Grid Lines (Rule of Thirds) - Memberikan kesan Pro */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div></div>
              </div>
            </div>

            {/* Control Bar Bawah */}
            <div className="absolute bottom-0 left-0 right-0 z-20 h-36 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end pb-8">
              <div className="flex items-center justify-evenly px-8">

                {/* Tombol Flip dengan Efek Blur */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/90 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 backdrop-blur-sm transition-all"
                  onClick={toggleCameraFlip}
                >
                  <RefreshCw className="w-6 h-6" />
                </Button>

                {/* Tombol Shutter Realistis */}
                <button
                  onClick={capturePhoto}
                  className="group/shutter relative flex items-center justify-center p-1 cursor-pointer"
                >
                  {/* Lingkaran Luar */}
                  <div className="w-20 h-20 rounded-full border-[3px] border-white/80 transition-all duration-300 group-active/shutter:scale-90 group-active/shutter:border-white/50" />

                  {/* Lingkaran Dalam (Tombol) */}
                  <div className="absolute w-16 h-16 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-150 group-hover/shutter:scale-95 group-active/shutter:scale-75" />
                </button>

                {/* Spacer Penyeimbang (Kosong agar tombol shutter tetap di tengah) */}
                <div className="w-12 h-12" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* INPUT BIASA (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* CHAT BAR */}
      <div className="glass-panel border-t border-border/30 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-secondary/30 rounded-2xl p-2 border border-border/30 shadow-fiscal-sm focus-within:shadow-fiscal-md focus-within:border-primary/30 transition-all duration-300">
            {/* Menu Lampiran */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl h-10 w-10 hover:bg-muted"
                  disabled={disabled || isLoading}
                >
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 glass-card border-border/30">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2 cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  Upload Struk
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCameraOpen(true)} className="gap-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  Ambil Foto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Input Teks */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik transaksi..."
              className={cn(
                "flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2.5 text-sm",
                "placeholder:text-muted-foreground"
              )}
              disabled={disabled || isLoading}
              rows={1}
            />

            {/* Tombol Kirim */}
            <div className="relative">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || disabled || isLoading}
                className="shrink-0 rounded-xl h-10 w-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-fiscal-sm hover:shadow-fiscal-md transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              {input.trim() && !isLoading && (
                <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md -z-10 animate-pulse-soft" />
              )}
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/60 mt-2">
            &copy; {new Date().getFullYear()} Fiscal AI • Roger Sumatera
          </p>
        </div>
      </div>
    </>
  );
};