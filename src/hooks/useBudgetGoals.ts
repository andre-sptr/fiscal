import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface BudgetGoal {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    spent: number;
    month: string;
    created_at: string;
}

const STORAGE_KEY = 'fiscal_budget_goals';

// Helper to generate unique ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useBudgetGoals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState<BudgetGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const fetchGoals = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Load goals from localStorage
            const storedGoals = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
            let userGoals: BudgetGoal[] = storedGoals ? JSON.parse(storedGoals) : [];

            // Filter to current month
            userGoals = userGoals.filter(g => g.month === currentMonth);

            // Fetch transactions to calculate spent amount
            const monthStart = startOfMonth(new Date());
            const monthEnd = endOfMonth(new Date());

            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('category, amount')
                .eq('user_id', user.id)
                .eq('type', 'expense')
                .gte('date', monthStart.toISOString())
                .lte('date', monthEnd.toISOString());

            // Calculate spent per category
            const spentByCategory: Record<string, number> = {};
            transactionsData?.forEach((tx) => {
                spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + Number(tx.amount);
            });

            // Merge spent data into goals
            const goalsWithSpent = userGoals.map((goal) => ({
                ...goal,
                spent: spentByCategory[goal.category] || 0,
            }));

            setGoals(goalsWithSpent);
        } catch (error) {
            console.error('Error fetching budget goals:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentMonth]);

    const saveGoals = (newGoals: BudgetGoal[]) => {
        if (!user) return;
        // Save all goals including other months
        const storedGoals = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        let allGoals: BudgetGoal[] = storedGoals ? JSON.parse(storedGoals) : [];

        // Remove current month goals and add new ones
        allGoals = allGoals.filter(g => g.month !== currentMonth);
        allGoals = [...allGoals, ...newGoals];

        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(allGoals));
    };

    const addGoal = async (category: string, amount: number) => {
        if (!user) return null;

        const newGoal: BudgetGoal = {
            id: generateId(),
            user_id: user.id,
            category,
            amount,
            spent: 0,
            month: currentMonth,
            created_at: new Date().toISOString(),
        };

        const updatedGoals = [...goals, newGoal];
        saveGoals(updatedGoals);
        await fetchGoals();
        return newGoal;
    };

    const updateGoal = async (id: string, amount: number) => {
        const updatedGoals = goals.map(g =>
            g.id === id ? { ...g, amount } : g
        );
        saveGoals(updatedGoals);
        await fetchGoals();
        return true;
    };

    const deleteGoal = async (id: string) => {
        const updatedGoals = goals.filter(g => g.id !== id);
        saveGoals(updatedGoals);
        await fetchGoals();
        return true;
    };

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Calculate total budget and spent
    const totalBudget = goals.reduce((sum, g) => sum + g.amount, 0);
    const totalSpent = goals.reduce((sum, g) => sum + g.spent, 0);
    const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
        goals,
        isLoading,
        totalBudget,
        totalSpent,
        overallProgress,
        addGoal,
        updateGoal,
        deleteGoal,
        refetch: fetchGoals,
    };
};
