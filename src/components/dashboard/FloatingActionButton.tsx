import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fiscal-fab"
      aria-label="Tambah transaksi"
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
    </button>
  );
};
