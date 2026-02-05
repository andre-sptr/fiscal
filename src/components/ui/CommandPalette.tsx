import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Wallet,
    Plus,
    Minus,
    Search,
    Settings,
    MessageSquare,
    TrendingUp,
    Sparkles,
    Calculator,
    Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
    onAddIncome?: () => void;
    onAddExpense?: () => void;
    onOpenWallet?: () => void;
}

export const CommandPalette = ({
    onAddIncome,
    onAddExpense,
    onOpenWallet,
}: CommandPaletteProps) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command className="rounded-lg border-none shadow-fiscal-xl">
                <div className="flex items-center border-b border-border/50 px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                        placeholder="Ketik perintah atau cari..."
                        className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
                    />
                </div>
                <CommandList className="max-h-[400px] overflow-y-auto p-2">
                    <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Tidak ditemukan</p>
                        </div>
                    </CommandEmpty>

                    <CommandGroup heading="Aksi Cepat">
                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => onAddExpense?.())}
                        >
                            <div className="w-9 h-9 rounded-lg bg-expense/10 flex items-center justify-center">
                                <Minus className="w-4 h-4 text-expense" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Tambah Pengeluaran</p>
                                <p className="text-xs text-muted-foreground">Catat pengeluaran baru</p>
                            </div>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                                E
                            </kbd>
                        </CommandItem>

                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => onAddIncome?.())}
                        >
                            <div className="w-9 h-9 rounded-lg bg-income/10 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-income" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Tambah Pemasukan</p>
                                <p className="text-xs text-muted-foreground">Catat pemasukan baru</p>
                            </div>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                                I
                            </kbd>
                        </CommandItem>

                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => onOpenWallet?.())}
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Buka Wallet</p>
                                <p className="text-xs text-muted-foreground">Lihat saldo & riwayat</p>
                            </div>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                                W
                            </kbd>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator className="my-2" />

                    <CommandGroup heading="Navigasi">
                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => navigate('/'))}
                        >
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <span>Dashboard</span>
                        </CommandItem>

                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => navigate('/chat'))}
                        >
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <span>AI Chat</span>
                        </CommandItem>

                        <CommandItem
                            className="gap-3 p-3 rounded-xl cursor-pointer"
                            onSelect={() => runCommand(() => navigate('/settings'))}
                        >
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span>Pengaturan</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator className="my-2" />

                    <CommandGroup heading="Tools">
                        <CommandItem className="gap-3 p-3 rounded-xl cursor-pointer opacity-50">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <span>Budget Goals</span>
                                <span className="ml-2 text-[10px] text-muted-foreground">(Coming Soon)</span>
                            </div>
                        </CommandItem>

                        <CommandItem className="gap-3 p-3 rounded-xl cursor-pointer opacity-50">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <span>Insights & Analytics</span>
                                <span className="ml-2 text-[10px] text-muted-foreground">(Coming Soon)</span>
                            </div>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>

                <div className="border-t border-border/50 p-2 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px]">
                            ↑↓
                        </kbd>
                        <span>navigasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px]">
                            Enter
                        </kbd>
                        <span>pilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px]">
                            Esc
                        </kbd>
                        <span>tutup</span>
                    </div>
                </div>
            </Command>
        </CommandDialog>
    );
};
