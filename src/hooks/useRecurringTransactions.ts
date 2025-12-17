import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
  created_at: string;
}

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecurringTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_due_date', { ascending: true });

    if (!error && data) {
      setRecurringTransactions(data as RecurringTransaction[]);
    }
    setIsLoading(false);
  };

  const addRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setRecurringTransactions(prev => [...prev, data as RecurringTransaction]);
    }

    return { data, error };
  };

  const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransaction>) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setRecurringTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    }

    return { error };
  };

  const deleteRecurringTransaction = async (id: string) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
    }

    return { error };
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateRecurringTransaction(id, { is_active: isActive });
  };

  useEffect(() => {
    if (user) {
      fetchRecurringTransactions();
    }
  }, [user]);

  return {
    recurringTransactions,
    isLoading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
    refetch: fetchRecurringTransactions,
  };
};
