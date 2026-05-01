import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        data-testid="card-income"
        className="bg-card border border-card-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xs text-muted-foreground">Ingresos</span>
        </div>
        <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(income)}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        data-testid="card-expenses"
        className="bg-card border border-card-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          </div>
          <span className="text-xs text-muted-foreground">Gastos</span>
        </div>
        <p className="text-lg font-bold text-red-400 tabular-nums">{formatCurrency(expenses)}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        data-testid="card-balance"
        className="bg-card border border-card-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${balance >= 0 ? 'bg-blue-500/15' : 'bg-orange-500/15'}`}>
            <Wallet className={`h-3.5 w-3.5 ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
          </div>
          <span className="text-xs text-muted-foreground">Saldo</span>
        </div>
        <p className={`text-lg font-bold tabular-nums ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
          {formatCurrency(balance)}
        </p>
      </motion.div>
    </div>
  );
}
