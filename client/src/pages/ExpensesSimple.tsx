import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, TrendingDown, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc';

export default function ExpensesSimple() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Produtos',
    description: '',
    amount: '',
    createdAt: todayStr,
  });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    fetchExpenses();
  }, [selectedDate]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setInitialLoading(true);
    try {
      const startDate = selectedDate;
      const endDate = selectedDate;

      const inputParam = encodeURIComponent(JSON.stringify({
        json: { startDate, endDate }
      }));
      const res = await fetch(`${API}/expenses.getByPeriod?input=${inputParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.result?.data?.json) {
        setExpenses(data.result.data.json);
      } else {
        console.error('[Expenses] Unexpected response:', data);
        setExpenses([]);
      }
    } catch (err) {
      console.error('[Expenses] Fetch error:', err);
      setExpenses([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const createExpense = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Nao autenticado'); return; }
    if (!formData.amount) { toast.error('Preencha o valor'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/expenses.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            category: formData.category,
            description: formData.description || null,
            amount: formData.amount,
            createdAt: formData.createdAt ? new Date(formData.createdAt + 'T12:00:00').toISOString() : undefined,
          }
        }),
      });
      const data = await res.json();

      if (res.ok && data.result?.data?.json?.success) {
        toast.success('Gasto registrado com sucesso!');
        setFormData({ category: 'Produtos', description: '', amount: '', createdAt: selectedDate });
        setIsOpen(false);
        fetchExpenses();
      } else {
        toast.error(data.error?.json?.message || 'Erro ao registrar gasto');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/expenses.delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ json: { id } }),
      });
      if (res.ok) {
        toast.success('Gasto eliminado');
        fetchExpenses();
      } else {
        toast.error('Erro ao eliminar gasto');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const getCategoryIcon = (c: string) => {
    switch (c.toLowerCase()) {
      case 'produtos': return '🧴';
      case 'aluguel': return '🏢';
      case 'funcionario': case 'funcionário': return '👨‍💼';
      case 'utensilios': case 'utensílios': return '🧹';
      case 'energia': return '⚡';
      case 'agua': case 'água': return '💧';
      case 'manutencao': case 'manutenção': return '🔧';
      default: return '💸';
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);
  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount as any);
    return acc;
  }, {} as Record<string, number>);

  const isToday = selectedDate === todayStr;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 pb-24">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Gastos</h1>
        </div>
        <p className="text-red-100 text-sm">
          {isToday ? 'Gastos de hoje' : `Gastos do dia ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}`}
        </p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Date Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Ver gastos do dia</label>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-red-600" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border-red-200 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
          <p className="text-red-100 text-sm font-medium mb-1">
            Total de Gastos {isToday ? '(Hoje)' : `(${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })})`}
          </p>
          <p className="text-3xl font-bold font-poppins">{formatCurrency(totalExpenses)}</p>
        </div>

        <Button onClick={() => { setFormData(prev => ({ ...prev, createdAt: selectedDate })); setIsOpen(true); }} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base">
          <Plus className="w-5 h-5 mr-2" /> Registar Novo Gasto
        </Button>

        {Object.keys(expensesByCategory).length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Gastos por Categoria</h2>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="bg-white rounded-xl p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{category}</p>
                        <p className="text-xs text-gray-500">Categoria</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600 text-lg">{formatCurrency(amount as number)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">
            Historico de Gastos {isToday ? 'de Hoje' : 'do Dia'}
          </h2>
          {initialLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
          ) : expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-red-100"><p className="text-gray-500 text-sm">Nenhum gasto registado neste dia</p></div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-xl p-4 border border-red-100 hover:border-red-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{expense.category}</p>
                          {expense.description && <p className="text-xs text-gray-500">{expense.description}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">{formatCurrency(parseFloat(expense.amount as any))}</p>
                      <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-poppins">Registar Novo Gasto</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createExpense(); }} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Data do Gasto</Label>
              <Input
                type="date"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Categoria</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produtos">🧴 Produtos</SelectItem>
                  <SelectItem value="Aluguel">🏢 Aluguel</SelectItem>
                  <SelectItem value="Funcionário">👨‍💼 Funcionário</SelectItem>
                  <SelectItem value="Utensílios">🧹 Utensílios</SelectItem>
                  <SelectItem value="Energia">⚡ Energia</SelectItem>
                  <SelectItem value="Água">💧 Água</SelectItem>
                  <SelectItem value="Manutenção">🔧 Manutenção</SelectItem>
                  <SelectItem value="Outro">💸 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-semibold">Descricao</Label><Input type="text" placeholder="Ex: Xampu e sabao" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Valor (R$)</Label><Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="rounded-lg" /></div>
            <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</> : "Registar Gasto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}