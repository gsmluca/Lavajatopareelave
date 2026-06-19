import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc';

export default function Reports() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Service dialog
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    vehicleType: 'car',
    clientName: '',
    description: '',
    value: '',
    paymentMethod: 'pix',
    createdAt: todayStr,
  });

  // Expense dialog
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'Produtos',
    description: '',
    amount: '',
    createdAt: todayStr,
  });

  const getDateRange = () => {
    const now = new Date(selectedDate);
    let startDate = selectedDate;
    let endDate = selectedDate;

    if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      endDate = selectedDate;
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = selectedDate;
    } else if (period === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      startDate = yearStart.toISOString().split('T')[0];
      endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  const fetchReports = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const servicesUrl = new URL(`${API}/services.getByPeriod`);
      servicesUrl.searchParams.set('input', JSON.stringify({
        json: { startDate, endDate }
      }));
      const servicesRes = await fetch(servicesUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const servicesData = await servicesRes.json();
      if (servicesData.result?.data?.json) {
        setServices(servicesData.result.data.json);
      } else {
        setServices([]);
      }

      const expensesUrl = new URL(`${API}/expenses.getByPeriod`);
      expensesUrl.searchParams.set('input', JSON.stringify({
        json: { startDate, endDate }
      }));
      const expensesRes = await fetch(expensesUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const expensesData = await expensesRes.json();
      if (expensesData.result?.data?.json) {
        setExpenses(expensesData.result.data.json);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('[Reports] Fetch error:', err);
      toast.error('Erro ao carregar relatorio');
      setServices([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, [period, selectedDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return '🚗';
      case 'motorcycle': return '🏍️';
      case 'suv': return '🚙';
      case 'truck': return '🚚';
      default: return '🚗';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'pix': return '📱';
      case 'cash': return '💵';
      case 'card': return '💳';
      default: return '💰';
    }
  };

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

  const createService = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Nao autenticado'); return; }
    if (!serviceFormData.value) { toast.error('Preencha o valor'); return; }

    try {
      const res = await fetch(`${API}/services.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            vehicleType: serviceFormData.vehicleType,
            clientName: serviceFormData.clientName || null,
            description: serviceFormData.description || null,
            value: serviceFormData.value,
            paymentMethod: serviceFormData.paymentMethod,
            createdAt: serviceFormData.createdAt ? new Date(serviceFormData.createdAt + 'T12:00:00').toISOString() : undefined,
          }
        }),
      });
      const data = await res.json();
      if (res.ok && data.result?.data?.json?.success) {
        toast.success('Servico registrado com sucesso!');
        setServiceFormData({ vehicleType: 'car', clientName: '', description: '', value: '', paymentMethod: 'pix', createdAt: selectedDate });
        setIsServiceDialogOpen(false);
        fetchReports();
      } else {
        toast.error(data.error?.json?.message || 'Erro ao registrar servico');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    }
  };

  const createExpense = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Nao autenticado'); return; }
    if (!expenseFormData.amount) { toast.error('Preencha o valor'); return; }

    try {
      const res = await fetch(`${API}/expenses.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            category: expenseFormData.category,
            description: expenseFormData.description || null,
            amount: expenseFormData.amount,
            createdAt: expenseFormData.createdAt ? new Date(expenseFormData.createdAt + 'T12:00:00').toISOString() : undefined,
          }
        }),
      });
      const data = await res.json();

      if (res.ok && data.result?.data?.json?.success) {
        toast.success('Gasto registrado com sucesso!');
        setExpenseFormData({ category: 'Produtos', description: '', amount: '', createdAt: selectedDate });
        setIsExpenseDialogOpen(false);
        fetchReports();
      } else {
        toast.error(data.error?.json?.message || 'Erro ao registrar gasto');
      }
    } catch (err) {
      toast.error('Erro de conexao');
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
        fetchReports();
      } else {
        toast.error('Erro ao eliminar gasto');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    }
  };

  const deleteService = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/services.delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ json: { id } }),
      });
      if (res.ok) {
        toast.success('Servico eliminado');
        fetchReports();
      } else {
        toast.error('Erro ao eliminar servico');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    }
  };

  const totalRevenue = services.reduce((sum, s) => sum + parseFloat(s.value as any), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);
  const netProfit = totalRevenue - totalExpenses;

  const carCount = services.filter((s) => s.vehicleType === 'car').length;
  const motorcycleCount = services.filter((s) => s.vehicleType === 'motorcycle').length;
  const suvCount = services.filter((s) => s.vehicleType === 'suv').length;
  const truckCount = services.filter((s) => s.vehicleType === 'truck').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Relatorios</h1>
        </div>
        <p className="text-purple-100 text-sm">Analise detalhada de receitas e despesas</p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Period Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Periodo</label>
          <div className="grid grid-cols-2 gap-2">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
                className={`rounded-lg text-sm font-semibold capitalize ${
                  period === p
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}
              >
                {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Ano'}
              </Button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-gray-900 mt-4">Data Final</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => { setServiceFormData(prev => ({ ...prev, createdAt: selectedDate })); setIsServiceDialogOpen(true); }}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" /> Servico
          </Button>
          <Button
            onClick={() => { setExpenseFormData(prev => ({ ...prev, createdAt: selectedDate })); setIsExpenseDialogOpen(true); }}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" /> Gasto
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                <p className="text-green-100 text-sm font-medium mb-1">Receita Total</p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(totalRevenue)}</p>
                <p className="text-green-100 text-xs mt-2">{services.length} servicos</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                <p className="text-red-100 text-sm font-medium mb-1">Despesas Totais</p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(totalExpenses)}</p>
                <p className="text-red-100 text-xs mt-2">{expenses.length} gastos</p>
              </div>

              <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} rounded-2xl p-6 shadow-lg text-white`}>
                <p className={`${netProfit >= 0 ? 'text-emerald-100' : 'text-orange-100'} text-sm font-medium mb-1`}>
                  Lucro Liquido
                </p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(netProfit)}</p>
                <p className={`${netProfit >= 0 ? 'text-emerald-100' : 'text-orange-100'} text-xs mt-2`}>
                  {netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                </p>
              </div>
            </div>

            {/* Vehicle Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Veiculos Lavados</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl mb-1">🚗</p>
                  <p className="text-2xl font-bold text-gray-900">{carCount}</p>
                  <p className="text-xs text-gray-500">Carros</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl mb-1">🏍️</p>
                  <p className="text-2xl font-bold text-gray-900">{motorcycleCount}</p>
                  <p className="text-xs text-gray-500">Motos</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl mb-1">🚙</p>
                  <p className="text-2xl font-bold text-gray-900">{suvCount}</p>
                  <p className="text-xs text-gray-500">SUVs</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl mb-1">🚚</p>
                  <p className="text-2xl font-bold text-gray-900">{truckCount}</p>
                  <p className="text-xs text-gray-500">Caminhoes</p>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Servicos do Periodo</h2>
              {services.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-purple-100">
                  <p className="text-gray-500 text-sm">Nenhum servico neste periodo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getVehicleIcon(service.vehicleType)}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{service.clientName || "Cliente"}</p>
                              <p className="text-xs text-gray-500">{formatDate(service.createdAt)}</p>
                            </div>
                          </div>
                          {service.description && (
                            <p className="text-sm text-gray-600 ml-8">{service.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 ml-8">
                            <span className="text-lg">{getPaymentIcon(service.paymentMethod)}</span>
                            <span className="text-xs text-gray-500 capitalize">{service.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600 text-lg">{formatCurrency(parseFloat(service.value as any))}</p>
                          <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses List */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Gastos do Periodo</h2>
              {expenses.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-purple-100">
                  <p className="text-gray-500 text-sm">Nenhum gasto neste periodo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{expense.category}</p>
                              <p className="text-xs text-gray-500">{formatDate(expense.createdAt)}</p>
                            </div>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-gray-600 ml-10">{expense.description}</p>
                          )}
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
          </>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-poppins">Adicionar Servico</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createService(); }} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Data do Servico</Label>
              <Input type="date" value={serviceFormData.createdAt} onChange={(e) => setServiceFormData({ ...serviceFormData, createdAt: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo de Veiculo</Label>
              <Select value={serviceFormData.vehicleType} onValueChange={(v) => setServiceFormData({ ...serviceFormData, vehicleType: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚗 Carro</SelectItem>
                  <SelectItem value="motorcycle">🏍️ Moto</SelectItem>
                  <SelectItem value="suv">🚙 SUV</SelectItem>
                  <SelectItem value="truck">🚚 Caminhao</SelectItem>
                  <SelectItem value="other">🚗 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-semibold">Nome do Cliente</Label><Input type="text" placeholder="Ex: Joao Silva" value={serviceFormData.clientName} onChange={(e) => setServiceFormData({ ...serviceFormData, clientName: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Descricao</Label><Input type="text" placeholder="Ex: Lavagem completa" value={serviceFormData.description} onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Valor (R$)</Label><Input type="number" step="0.01" placeholder="0.00" value={serviceFormData.value} onChange={(e) => setServiceFormData({ ...serviceFormData, value: e.target.value })} className="rounded-lg" /></div>
            <div>
              <Label className="text-sm font-semibold">Metodo de Pagamento</Label>
              <Select value={serviceFormData.paymentMethod} onValueChange={(v) => setServiceFormData({ ...serviceFormData, paymentMethod: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">📱 PIX</SelectItem>
                  <SelectItem value="cash">💵 Dinheiro</SelectItem>
                  <SelectItem value="card">💳 Cartao</SelectItem>
                  <SelectItem value="other">💰 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">
              Adicionar Servico
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-poppins">Adicionar Gasto</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createExpense(); }} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Data do Gasto</Label>
              <Input type="date" value={expenseFormData.createdAt} onChange={(e) => setExpenseFormData({ ...expenseFormData, createdAt: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Categoria</Label>
              <Select value={expenseFormData.category} onValueChange={(v) => setExpenseFormData({ ...expenseFormData, category: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produtos">🧴 Produtos</SelectItem>
                  <SelectItem value="Aluguel">🏢 Aluguel</SelectItem>
                  <SelectItem value="Funcionário">👨‍💼 Funcionario</SelectItem>
                  <SelectItem value="Utensílios">🧹 Utensilios</SelectItem>
                  <SelectItem value="Energia">⚡ Energia</SelectItem>
                  <SelectItem value="Água">💧 Agua</SelectItem>
                  <SelectItem value="Manutenção">🔧 Manutencao</SelectItem>
                  <SelectItem value="Outro">💸 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-semibold">Descricao</Label><Input type="text" placeholder="Ex: Xampu e sabao" value={expenseFormData.description} onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Valor (R$)</Label><Input type="number" step="0.01" placeholder="0.00" value={expenseFormData.amount} onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} className="rounded-lg" /></div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
              Adicionar Gasto
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}