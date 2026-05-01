import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, PieChart as PieChartIcon, List, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/hooks/useData';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionList } from '@/components/TransactionList';
import { ExpenseChart } from '@/components/ExpenseChart';
import { SummaryCards } from '@/components/SummaryCards';
import { ImportExport } from '@/components/ImportExport';
import { CalendarGrid } from '@/components/CalendarGrid';
import { Transaction } from '@/types';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type ModalType = 'income' | 'expense' | null;
type ViewTab = 'list' | 'chart' | 'calendar';

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');

  const {
    allTags,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTag,
    getFilteredTransactions,
    getTransactionsByDay,
    getMonthDayData,
    getTotals,
    getExpensesByTag,
    exportData,
    importData,
  } = useData();

  const totals = useMemo(() => getTotals(year, month), [getTotals, year, month]);
  const expensesByTag = useMemo(() => getExpensesByTag(year, month), [getExpensesByTag, year, month]);
  const monthDayData = useMemo(() => getMonthDayData(year, month), [getMonthDayData, year, month]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'calendar' && selectedDay !== null) {
      return getTransactionsByDay(year, month, selectedDay);
    }
    return getFilteredTransactions(year, month, selectedTag ?? undefined);
  }, [
    activeTab,
    selectedDay,
    selectedTag,
    getFilteredTransactions,
    getTransactionsByDay,
    year,
    month,
  ]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedTag(null);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedTag(null);
    setSelectedDay(null);
  };

  const openModal = (type: 'income' | 'expense') => {
    setEditTx(null);
    setModalType(type);
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setModalType(tx.type);
  };

  const handleSave = (txData: Omit<Transaction, 'id'>) => {
    if (editTx) {
      updateTransaction(editTx.id, txData);
    } else {
      addTransaction(txData);
    }
    setEditTx(null);
    setModalType(null);
  };

  const handleSelectTag = (tagId: string | null) => {
    setSelectedTag(tagId);
    if (tagId) setActiveTab('list');
  };

  const handleSelectDay = (day: number | null) => {
    setSelectedDay(day);
  };

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
    if (tab !== 'calendar') setSelectedDay(null);
    if (tab !== 'list') setSelectedTag(null);
  };

  const listCount = activeTab === 'calendar' && selectedDay !== null
    ? filteredTransactions.length
    : getFilteredTransactions(year, month).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xl">💰</span>
            <span className="font-semibold text-foreground text-sm hidden sm:block">MisFinanzas</span>
          </div>

          <div className="flex items-center gap-1.5" data-testid="month-selector">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-prev-month"
              onClick={prevMonth}
              className="h-8 w-8 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center" data-testid="text-current-month">
              {MONTHS[month]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-next-month"
              onClick={nextMonth}
              className="h-8 w-8 text-muted-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <ImportExport onExport={exportData} onImport={importData} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <SummaryCards
          income={totals.income}
          expenses={totals.expenses}
          balance={totals.balance}
        />

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            data-testid="button-add-income"
            onClick={() => openModal('income')}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Ingreso
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            data-testid="button-add-expense"
            onClick={() => openModal('expense')}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Gasto
          </motion.button>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            <button
              data-testid="tab-list"
              onClick={() => handleTabChange('list')}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 ${
                activeTab === 'list'
                  ? 'text-foreground border-b-2 border-primary bg-muted/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4 shrink-0" />
              Transacciones
              {listCount > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {listCount}
                </span>
              )}
            </button>
            <button
              data-testid="tab-calendar"
              onClick={() => handleTabChange('calendar')}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 ${
                activeTab === 'calendar'
                  ? 'text-foreground border-b-2 border-primary bg-muted/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              Calendario
            </button>
            <button
              data-testid="tab-chart"
              onClick={() => handleTabChange('chart')}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 ${
                activeTab === 'chart'
                  ? 'text-foreground border-b-2 border-primary bg-muted/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PieChartIcon className="h-4 w-4 shrink-0" />
              Categorías
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'list' && (
              <>
                {selectedTag && (
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-muted-foreground">
                      Filtrando por:{' '}
                      <span className="text-foreground font-medium">
                        {allTags.find((t) => t.id === selectedTag)?.emoji}{' '}
                        {allTags.find((t) => t.id === selectedTag)?.label}
                      </span>
                    </span>
                    <button
                      data-testid="button-clear-tag-filter"
                      onClick={() => setSelectedTag(null)}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Limpiar
                    </button>
                  </div>
                )}
                <TransactionList
                  transactions={filteredTransactions}
                  tags={allTags}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                />
              </>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-4">
                <CalendarGrid
                  year={year}
                  month={month}
                  dayData={monthDayData}
                  selectedDay={selectedDay}
                  onSelectDay={handleSelectDay}
                />
                {selectedDay !== null && (
                  <div>
                    <div className="border-t border-border pt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3 px-1 uppercase tracking-wide">
                        Movimientos del día
                      </p>
                      <TransactionList
                        transactions={filteredTransactions}
                        tags={allTags}
                        onEdit={handleEdit}
                        onDelete={deleteTransaction}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chart' && (
              <ExpenseChart
                data={expensesByTag}
                totalExpenses={totals.expenses}
                selectedTag={selectedTag}
                onSelectTag={handleSelectTag}
              />
            )}
          </div>
        </div>
      </main>

      <TransactionModal
        open={modalType !== null}
        onClose={() => { setModalType(null); setEditTx(null); }}
        onSave={handleSave}
        onAddTag={addTag}
        initialType={modalType ?? 'expense'}
        editTransaction={editTx}
        tags={allTags}
      />
    </div>
  );
}
