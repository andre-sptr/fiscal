import { useState } from 'react';
import { Plus, MessageSquare, Settings, LogOut, Menu, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession?: (id: string) => Promise<boolean>;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  const { signOut } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!onDeleteSession) return;
    
    setDeletingId(sessionId);
    const success = await onDeleteSession(sessionId);
    setDeletingId(null);
    
    if (success) {
      toast.success('Chat berhasil dihapus');
    } else {
      toast.error('Gagal menghapus chat');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Fiscal</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <Button 
            onClick={onNewChat} 
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Chat Baru
          </Button>
        </div>

        {/* Sessions */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                Belum ada riwayat chat
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer",
                    activeSessionId === session.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="truncate flex-1">{session.title}</span>
                  {onDeleteSession && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => handleDelete(e, session.id)}
                      disabled={deletingId === session.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground">
            <Settings className="w-4 h-4" />
            Pengaturan
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-sidebar-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden bg-background/80 backdrop-blur-sm"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
};
