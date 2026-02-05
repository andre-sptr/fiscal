import { useState } from 'react';
import { Plus, MessageSquare, Settings, LogOut, Menu, X, Trash2, Wallet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const { user, signOut } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 flex flex-col border-r border-sidebar-border transition-all duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
          "glass-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1 opacity-30" />
        </div>

        {/* Header */}
        <div className="relative p-4 border-b border-sidebar-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Animated logo */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-fiscal-glow">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md -z-10 animate-pulse-soft" />
              </div>
              <div>
                <span className="font-bold text-lg text-sidebar-foreground">Fiscal</span>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AI Finance</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden rounded-xl hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-fiscal-md hover:shadow-fiscal-lg transition-all duration-300 group"
          >
            <div className="w-6 h-6 rounded-lg bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium">Chat Baru</span>
          </Button>

          {/* Search */}
          {sessions.length > 3 && (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border/50 rounded-lg text-sm"
              />
            </div>
          )}
        </div>

        {/* Sessions */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Tidak ditemukan' : 'Belum ada riwayat'}
                </p>
              </div>
            ) : (
              filteredSessions.map((session, index) => (
                <div
                  key={session.id}
                  className={cn(
                    "group w-full text-left px-3 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer animate-slide-up",
                    activeSessionId === session.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-fiscal-sm"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    activeSessionId === session.id
                      ? "bg-primary/10"
                      : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    <MessageSquare className={cn(
                      "w-4 h-4 transition-colors",
                      activeSessionId === session.id ? "text-primary" : "opacity-60"
                    )} />
                  </div>
                  <span className="truncate flex-1 font-medium">{session.title}</span>
                  {onDeleteSession && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-lg"
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

        {/* Footer with User Profile */}
        <div className="relative p-4 border-t border-sidebar-border/50 space-y-2">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30 mb-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">
                {userInitial}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-income rounded-full border-2 border-sidebar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-xl h-10"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Pengaturan</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Keluar</span>
          </Button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden glass-panel shadow-fiscal-md h-10 w-10 rounded-xl"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
};
