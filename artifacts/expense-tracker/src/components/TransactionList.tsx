import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, Tag } from '../types';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  tags: Tag[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getIntensityClass(amount: number, maxAmount: number, type: 'income' | 'expense'): string {
  const ratio = maxAmount > 0 ? amount / maxAmount : 0;
  if (type === 'income') {
    if (ratio > 0.75) return 'border-l-4 border-emerald-400 bg-emerald-500/8';
    if (ratio > 0.5) return 'border-l-4 border-emerald-500/70 bg-emerald-500/5';
    if (ratio > 0.25) return 'border-l-4 border-emerald-600/50 bg-emerald-500/3';
    return 'border-l-4 border-emerald-700/40 bg-emerald-500/2';
  } else {
    if (ratio > 0.75) return 'border-l-4 border-red-400 bg-red-500/8';
    if (ratio > 0.5) return 'border-l-4 border-red-500/70 bg-red-500/5';
    if (ratio > 0.25) return 'border-l-4 border-red-600/50 bg-red-500/3';
    return 'border-l-4 border-red-700/40 bg-red-500/2';
  }
}

export function TransactionList({ transactions, tags, onEdit, onDelete }: TransactionListProps) {
  const maxAmount = Math.max(...transactions.map((t) => t.amount), 0);

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-muted-foreground text-sm">No hay transacciones para este periodo.</p>
        <p className="text-muted-foreground text-xs mt-1">Agrega tu primer ingreso o gasto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {sorted.map((tx) => {
          const tag = tags.find((t) => t.id === tx.tag);
          const intensityClass = getIntensityClass(tx.amount, maxAmount, tx.type);

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              data-testid={`transaction-item-${tx.id}`}
              className={`flex items-center gap-3 p-3 rounded-lg bg-card border border-card-border group hover:border-border transition-all ${intensityClass}`}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-muted text-lg">
                {tag?.emoji ?? '📦'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                  {tx.type === 'income'
                    ? <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
                    : <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
                  }
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                  {tag && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                      {tag.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-edit-${tx.id}`}
                    onClick={() => onEdit(tx)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-delete-${tx.id}`}
                    onClick={() => onDelete(tx.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
