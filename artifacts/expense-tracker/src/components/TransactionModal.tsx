import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, Tag } from '../types';
import { PlusCircle } from 'lucide-react';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'El monto es requerido').refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    'El monto debe ser mayor a 0'
  ),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  tag: z.string().min(1, 'La categoría es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onAddTag: (tag: Omit<Tag, 'id'>) => void;
  initialType?: 'income' | 'expense';
  editTransaction?: Transaction | null;
  tags: Tag[];
}

export function TransactionModal({
  open,
  onClose,
  onSave,
  onAddTag,
  initialType = 'expense',
  editTransaction,
  tags,
}: TransactionModalProps) {
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagEmoji, setNewTagEmoji] = useState('🏷️');

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialType,
      amount: '',
      name: '',
      tag: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        form.reset({
          type: editTransaction.type,
          amount: String(editTransaction.amount),
          name: editTransaction.name,
          tag: editTransaction.tag,
          date: editTransaction.date.split('T')[0],
        });
      } else {
        form.reset({
          type: initialType,
          amount: '',
          name: '',
          tag: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
      setShowNewTag(false);
      setNewTagLabel('');
      setNewTagEmoji('🏷️');
    }
  }, [open, editTransaction, initialType, form]);

  const onSubmit = (values: TransactionFormValues) => {
    onSave({
      type: values.type,
      amount: parseFloat(values.amount),
      name: values.name,
      tag: values.tag,
      date: new Date(values.date + 'T12:00:00').toISOString(),
    });
    onClose();
  };

  const handleAddTag = () => {
    if (!newTagLabel.trim()) return;
    const newTag = onAddTag({ label: newTagLabel.trim(), emoji: newTagEmoji });
    if (newTag) {
      form.setValue('tag', (newTag as Tag).id);
    }
    setShowNewTag(false);
    setNewTagLabel('');
    setNewTagEmoji('🏷️');
  };

  const txType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editTransaction ? 'Editar transacción' : txType === 'income' ? '💰 Nuevo Ingreso' : '💸 Nuevo Gasto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-testid="type-income"
                      onClick={() => field.onChange('income')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        field.value === 'income'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'border-border text-muted-foreground hover:border-emerald-500/30'
                      }`}
                    >
                      💰 Ingreso
                    </button>
                    <button
                      type="button"
                      data-testid="type-expense"
                      onClick={() => field.onChange('expense')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        field.value === 'expense'
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'border-border text-muted-foreground hover:border-red-500/30'
                      }`}
                    >
                      💸 Gasto
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-name"
                      placeholder="Ej: Supermercado, Salario..."
                      {...field}
                      className="bg-background border-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        data-testid="input-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        className="bg-background border-input pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <div className="flex gap-2">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tag" className="bg-background border-input flex-1">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-popover-border">
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.emoji} {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      data-testid="button-add-tag"
                      onClick={() => setShowNewTag((v) => !v)}
                      className="shrink-0 border-border"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNewTag && (
              <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                <Input
                  data-testid="input-new-tag-emoji"
                  value={newTagEmoji}
                  onChange={(e) => setNewTagEmoji(e.target.value)}
                  className="w-16 bg-background border-input text-center"
                  maxLength={2}
                />
                <Input
                  data-testid="input-new-tag-label"
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  placeholder="Nueva categoría"
                  className="flex-1 bg-background border-input"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  size="sm"
                  data-testid="button-confirm-tag"
                  onClick={handleAddTag}
                  className="bg-primary text-primary-foreground"
                >
                  Agregar
                </Button>
              </div>
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-date"
                      type="date"
                      {...field}
                      className="bg-background border-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border"
                data-testid="button-cancel"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-testid="button-submit"
                className={`flex-1 ${txType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'} text-white`}
              >
                {editTransaction ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
