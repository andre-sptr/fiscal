import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  transaction_data?: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
  } | null;
  status: 'sent' | 'pending_confirmation' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export const useChatSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
  }, [user]);

  // Fetch messages for active session
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant',
        status: msg.status as 'sent' | 'pending_confirmation' | 'confirmed' | 'cancelled',
        transaction_data: msg.transaction_data as Message['transaction_data'],
      })));
    }
  }, [user]);

  // Create new session
  const createSession = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'Chat Baru' })
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => [data, ...prev]);
      setActiveSessionId(data.id);
      setMessages([]);
      return data.id;
    }
    return null;
  }, [user]);

  // Add message
  const addMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant',
    transactionData?: Message['transaction_data'],
    status: Message['status'] = 'sent'
  ) => {
    if (!user || !activeSessionId) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        role,
        content,
        transaction_data: transactionData,
        status,
      })
      .select()
      .single();

    if (!error && data) {
      const newMessage: Message = {
        ...data,
        role: data.role as 'user' | 'assistant',
        status: data.status as Message['status'],
        transaction_data: data.transaction_data as Message['transaction_data'],
      };
      setMessages(prev => [...prev, newMessage]);

      // Update session title if it's the first user message
      if (role === 'user' && messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('chat_sessions')
          .update({ title })
          .eq('id', activeSessionId);
        
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId ? { ...s, title } : s
        ));
      }

      return newMessage;
    }
    return null;
  }, [user, activeSessionId, messages.length]);

  // Update message status
  const updateMessageStatus = useCallback(async (
    messageId: string,
    status: Message['status']
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', messageId);

    if (!error) {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ));
    }
  }, [user]);

  // Select session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    fetchMessages(sessionId);
  }, [fetchMessages]);

  // Delete session (messages cascade via FK, transactions stay intact)
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return false;

    // Delete messages first
    await supabase
      .from('messages')
      .delete()
      .eq('session_id', sessionId);

    // Then delete session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      return true;
    }
    return false;
  }, [user, activeSessionId]);

  // Start new chat
  const startNewChat = useCallback(async () => {
    const sessionId = await createSession();
    if (sessionId) {
      setMessages([]);
    }
    return sessionId;
  }, [createSession]);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  // Load first session or create new one
  useEffect(() => {
    if (user && sessions.length === 0 && !activeSessionId) {
      createSession();
    } else if (sessions.length > 0 && !activeSessionId) {
      selectSession(sessions[0].id);
    }
  }, [user, sessions, activeSessionId, createSession, selectSession]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    setIsLoading,
    addMessage,
    updateMessageStatus,
    selectSession,
    startNewChat,
    deleteSession,
    setMessages,
  };
};
