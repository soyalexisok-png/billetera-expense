import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Transaction, Tag, DEFAULT_TAGS } from '../types';

const TRANSACTIONS_KEY = 'expense_tracker_transactions';
const TAGS_KEY = 'expense_tracker_tags';

export function useData() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(TRANSACTIONS_KEY, []);
  const [customTags, setCustomTags] = useLocalStorage<Tag[]>(TAGS_KEY, []);

  const allTags = useMemo(() => [...DEFAULT_TAGS, ...customTags], [customTags]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: crypto.randomUUID() };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, [setTransactions]);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, [setTransactions]);

  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: crypto.randomUUID() };
    setCustomTags((prev) => [...prev, newTag]);
    return newTag;
  }, [setCustomTags]);

  const getFilteredTransactions = useCallback(
    (year: number, month: number, tagFilter?: string) => {
      return transactions.filter((tx) => {
        const d = new Date(tx.date);
        const matchesMonth = d.getFullYear() === year && d.getMonth() === month;
        const matchesTag = tagFilter ? tx.tag === tagFilter : true;
        return matchesMonth && matchesTag;
      });
    },
    [transactions]
  );

  const getTotals = useCallback(
    (year: number, month: number) => {
      const filtered = getFilteredTransactions(year, month);
      const income = filtered
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = filtered
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { income, expenses, balance: income - expenses };
    },
    [getFilteredTransactions]
  );

  const getTransactionsByDay = useCallback(
    (year: number, month: number, day: number) => {
      return transactions.filter((tx) => {
        const d = new Date(tx.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day
        );
      });
    },
    [transactions]
  );

  const getMonthDayData = useCallback(
    (year: number, month: number) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const result: Array<{
        day: number;
        balance: number;
        income: number;
        expenses: number;
        txCount: number;
      }> = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayTxs = transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            txDate.getFullYear() === year &&
            txDate.getMonth() === month &&
            txDate.getDate() === d
          );
        });
        const income = dayTxs
          .filter((tx) => tx.type === 'income')
          .reduce((s, tx) => s + tx.amount, 0);
        const expenses = dayTxs
          .filter((tx) => tx.type === 'expense')
          .reduce((s, tx) => s + tx.amount, 0);
        result.push({
          day: d,
          balance: income - expenses,
          income,
          expenses,
          txCount: dayTxs.length,
        });
      }
      return result;
    },
    [transactions]
  );

  const getExpensesByTag = useCallback(
    (year: number, month: number) => {
      const filtered = getFilteredTransactions(year, month).filter(
        (tx) => tx.type === 'expense'
      );
      const byTag: Record<string, number> = {};
      filtered.forEach((tx) => {
        byTag[tx.tag] = (byTag[tx.tag] ?? 0) + tx.amount;
      });
      return Object.entries(byTag).map(([tagId, amount]) => {
        const tag = allTags.find((t) => t.id === tagId);
        return {
          tagId,
          label: tag ? `${tag.emoji} ${tag.label}` : tagId,
          amount,
        };
      });
    },
    [getFilteredTransactions, allTags]
  );

  const exportData = useCallback(() => {
    const data = { transactions, customTags, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, customTags]);

  const importData = useCallback(
    (file: File, merge: boolean): Promise<{ success: boolean; message: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content) as {
              transactions?: Transaction[];
              customTags?: Tag[];
            };

            if (!Array.isArray(parsed.transactions)) {
              resolve({ success: false, message: 'Formato inválido: falta el campo "transactions".' });
              return;
            }

            const isValidTx = (tx: unknown): tx is Transaction => {
              if (typeof tx !== 'object' || tx === null) return false;
              const t = tx as Record<string, unknown>;
              return (
                typeof t.id === 'string' &&
                (t.type === 'income' || t.type === 'expense') &&
                typeof t.amount === 'number' &&
                typeof t.name === 'string' &&
                typeof t.tag === 'string' &&
                typeof t.date === 'string'
              );
            };

            if (!parsed.transactions.every(isValidTx)) {
              resolve({ success: false, message: 'Algunas transacciones tienen formato inválido.' });
              return;
            }

            if (merge) {
              setTransactions((prev) => {
                const existingIds = new Set(prev.map((t) => t.id));
                const newOnes = parsed.transactions!.filter((t) => !existingIds.has(t.id));
                return [...prev, ...newOnes];
              });
            } else {
              setTransactions(parsed.transactions);
            }

            if (Array.isArray(parsed.customTags)) {
              if (merge) {
                setCustomTags((prev) => {
                  const existingIds = new Set(prev.map((t) => t.id));
                  const newTags = (parsed.customTags as Tag[]).filter((t) => !existingIds.has(t.id));
                  return [...prev, ...newTags];
                });
              } else {
                setCustomTags(parsed.customTags as Tag[]);
              }
            }

            resolve({ success: true, message: `Importación exitosa: ${parsed.transactions.length} transacciones.` });
          } catch {
            resolve({ success: false, message: 'Error al leer el archivo JSON.' });
          }
        };
        reader.readAsText(file);
      });
    },
    [setTransactions, setCustomTags]
  );

  return {
    transactions,
    allTags,
    customTags,
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
  };
}
