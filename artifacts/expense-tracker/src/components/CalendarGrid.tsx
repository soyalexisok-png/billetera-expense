import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DayData {
  day: number;
  balance: number;
  income: number;
  expenses: number;
  txCount: number;
}

interface CalendarGridProps {
  year: number;
  month: number;
  dayData: DayData[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getIntensityBg(balance: number, maxAbsBalance: number): string {
  if (balance === 0 || maxAbsBalance === 0) return '';

  const ratio = Math.abs(balance) / maxAbsBalance;

  if (balance > 0) {
    if (ratio > 0.75) return 'bg-emerald-600/60 border-emerald-500/50';
    if (ratio > 0.5) return 'bg-emerald-700/50 border-emerald-600/40';
    if (ratio > 0.25) return 'bg-emerald-800/45 border-emerald-700/35';
    return 'bg-emerald-900/40 border-emerald-800/30';
  } else {
    if (ratio > 0.75) return 'bg-rose-600/60 border-rose-500/50';
    if (ratio > 0.5) return 'bg-rose-700/50 border-rose-600/40';
    if (ratio > 0.25) return 'bg-rose-800/45 border-rose-700/35';
    return 'bg-rose-900/40 border-rose-800/30';
  }
}

function getDotColor(balance: number): string {
  if (balance > 0) return 'bg-emerald-400';
  if (balance < 0) return 'bg-rose-400';
  return '';
}

function formatCompact(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return String(Math.round(amount));
}

export function CalendarGrid({
  year,
  month,
  dayData,
  selectedDay,
  onSelectDay,
}: CalendarGridProps) {
  const { firstDayOffset, totalCells } = useMemo(() => {
    const firstDate = new Date(year, month, 1);
    const jsDay = firstDate.getDay();
    const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      firstDayOffset: mondayOffset,
      totalCells: mondayOffset + daysInMonth,
    };
  }, [year, month]);

  const maxAbsBalance = useMemo(() => {
    return Math.max(...dayData.map((d) => Math.abs(d.balance)), 0);
  }, [dayData]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (DayData | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (const d of dayData) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  void totalCells;

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const isToday = isCurrentMonth && cell.day === today.getDate();
          const isSelected = selectedDay === cell.day;
          const hasActivity = cell.txCount > 0;
          const intensityClass = getIntensityBg(cell.balance, maxAbsBalance);
          const dotColor = getDotColor(cell.balance);

          return (
            <motion.button
              key={cell.day}
              whileTap={{ scale: 0.92 }}
              data-testid={`calendar-day-${cell.day}`}
              onClick={() => onSelectDay(isSelected ? null : cell.day)}
              className={`
                relative aspect-square rounded-lg border p-1 flex flex-col items-start justify-between
                transition-all duration-150 cursor-pointer group
                ${hasActivity ? intensityClass : 'border-border bg-card'}
                ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                ${isToday && !isSelected ? 'border-primary/60' : ''}
                hover:brightness-110
              `}
            >
              <span className={`
                text-[10px] sm:text-xs font-semibold leading-none
                ${isToday ? 'text-primary' : 'text-foreground/70'}
                ${isSelected ? 'text-primary' : ''}
              `}>
                {cell.day}
              </span>

              {hasActivity && (
                <div className="w-full flex flex-col items-end gap-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor} opacity-90`} />
                  <span className={`
                    hidden sm:block text-[9px] leading-none font-medium
                    ${cell.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                  `}>
                    {cell.balance >= 0 ? '+' : '-'}{formatCompact(Math.abs(cell.balance))}
                  </span>
                </div>
              )}

              {isToday && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedDay !== null && (
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Mostrando:{' '}
            <span className="text-foreground font-medium">
              {selectedDay} de {new Date(year, month, selectedDay).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </span>
          </span>
          <button
            data-testid="button-clear-day-filter"
            onClick={() => onSelectDay(null)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-emerald-700/70" />
          Ingresos
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-rose-700/70" />
          Gastos
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded border border-border bg-card" />
          Sin actividad
        </div>
      </div>
    </div>
  );
}
