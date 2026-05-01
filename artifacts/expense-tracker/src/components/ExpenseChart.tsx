import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../types';

interface ChartEntry {
  tagId: string;
  label: string;
  amount: number;
}

interface ExpenseChartProps {
  data: ChartEntry[];
  totalExpenses: number;
  selectedTag: string | null;
  onSelectTag: (tagId: string | null) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ChartEntry & { percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const entry = payload[0];
    return (
      <div className="bg-card border border-card-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">{entry.name}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(entry.value)}</p>
        <p className="text-xs text-muted-foreground">{(entry.payload.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export function ExpenseChart({ data, totalExpenses, selectedTag, onSelectTag }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-muted-foreground text-sm">Sin gastos este periodo</p>
      </div>
    );
  }

  const dataWithPercent = data.map((d) => ({
    ...d,
    percent: totalExpenses > 0 ? d.amount / totalExpenses : 0,
  }));

  const handleClick = (entry: ChartEntry) => {
    onSelectTag(selectedTag === entry.tagId ? null : entry.tagId);
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={dataWithPercent}
            dataKey="amount"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            onClick={(entry) => handleClick(entry as ChartEntry)}
            style={{ cursor: 'pointer' }}
          >
            {dataWithPercent.map((entry, index) => (
              <Cell
                key={entry.tagId}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                opacity={selectedTag && selectedTag !== entry.tagId ? 0.3 : 1}
                stroke={selectedTag === entry.tagId ? '#fff' : 'transparent'}
                strokeWidth={selectedTag === entry.tagId ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {selectedTag && (
        <div className="mt-2 flex justify-center">
          <button
            data-testid="button-clear-filter"
            onClick={() => onSelectTag(null)}
            className="text-xs text-primary hover:text-primary/80 transition-colors underline"
          >
            Limpiar filtro
          </button>
        </div>
      )}
    </div>
  );
}
