import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Wifi,
  Heart,
  GraduationCap,
  Plane,
  Gift,
  Sparkles,
  Briefcase,
  TrendingUp,
  Wallet,
  Building,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  type: 'income' | 'expense' | 'both';
}

export const categories: Category[] = [
  // Expense categories
  { id: 'food', name: 'Makanan & Minuman', icon: Utensils, type: 'expense' },
  { id: 'transport', name: 'Transportasi', icon: Car, type: 'expense' },
  { id: 'shopping', name: 'Belanja', icon: ShoppingBag, type: 'expense' },
  { id: 'housing', name: 'Rumah & Sewa', icon: Home, type: 'expense' },
  { id: 'utilities', name: 'Utilitas & Tagihan', icon: Wifi, type: 'expense' },
  { id: 'health', name: 'Kesehatan', icon: Heart, type: 'expense' },
  { id: 'education', name: 'Pendidikan', icon: GraduationCap, type: 'expense' },
  { id: 'travel', name: 'Liburan', icon: Plane, type: 'expense' },
  { id: 'gifts', name: 'Hadiah & Donasi', icon: Gift, type: 'expense' },
  { id: 'entertainment', name: 'Hiburan', icon: Sparkles, type: 'expense' },

  // Income categories
  { id: 'salary', name: 'Gaji', icon: Briefcase, type: 'income' },
  { id: 'investment', name: 'Investasi', icon: TrendingUp, type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: Wallet, type: 'income' },
  { id: 'business', name: 'Bisnis', icon: Building, type: 'income' },
  { id: 'other_income', name: 'Lainnya', icon: Users, type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return categories.filter(cat => cat.type === type || cat.type === 'both');
};

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.icon ?? Wallet;
};

// Export expense category names for budget goals
export const EXPENSE_CATEGORIES = categories
  .filter(cat => cat.type === 'expense')
  .map(cat => cat.name);

// Export income category names
export const INCOME_CATEGORIES = categories
  .filter(cat => cat.type === 'income')
  .map(cat => cat.name);
