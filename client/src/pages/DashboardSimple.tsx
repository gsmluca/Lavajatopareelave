import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc';

export default function DashboardSimple() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'car',
    clientName: '',
    description: '',
    value: '',
    paymentMethod: 'pix',
    createdAt: todayStr,
  });
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  React.useEffect(() => {
    fetchServices();
    fetchExpenses();
  }, [selectedDate]);

  const fetchServices = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const inputParam = encodeURIComponent(JSON.stringify({
        json: { startDate: selectedDate, endDate: selectedDate }
      }));
      const res = await fetch(`${API}/services.getByPeriod?input=${inputParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.result?.data?.json) {
        setServices(data.result.data.json);
      } else {
        console.error('[Dashboard] Unexpected response:', data);
        setServices([]);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setServices([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchExpenses = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const inputParam = encodeURIComponent(JSON.stringify({
        json: { startDate: selectedDate, endDate: selectedDate }
      }));
      const res = await fetch(`${API}/expenses.getByPeriod?input=${inputParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.result?.data?.json) {
        setExpenses(data.result.data.json);
      } else {
        console.error('[Dashboard] Unexpected expenses response:', data);
        setExpenses([]);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch expenses error:', err);
      setExpenses([]);
    }
  };

  const createService = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Nao autenticado'); return; }
    if (!formData.value) { toast.error('Preencha o valor'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/services.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            vehicleType: formData.vehicleType,
            clientName: formData.clientName || null,
            description: formData.description || null,
            value: formData.value,
            paymentMethod: formData.paymentMethod,
            createdAt: formData.createdAt ? new Date(formData.createdAt + 'T12:00:00').toISOString() : undefined,
          }
        }),
      });
      const data = await res.json();
      if (res.ok && data.result?.data?.json?.success) {
        toast.success('Servico registrado com sucesso!');
        setFormData({ vehicleType: 'car', clientName: '', description: '', value: '', paymentMethod: 'pix', createdAt: selectedDate });
        setIsOpen(false);
        fetchServices();
        fetchExpenses();
      } else {
        toast.error(data.error?.json?.message || 'Erro ao registrar servico');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    } finally {
      setLoading(false);
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
        fetchServices();
      } else {
        toast.error('Erro ao eliminar servico');
      }
    } catch (err) {
      toast.error('Erro de conexao');
    }
  };

  const totalValue = services.reduce((sum, s) => sum + parseFloat(s.value as any), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);
  const netProfit = totalValue - totalExpenses;
  const carCount = services.filter(s => s.vehicleType === 'car').length;
  const motorcycleCount = services.filter(s => s.vehicleType === 'motorcycle').length;
  const suvCount = services.filter(s => s.vehicleType === 'suv').length;
  const truckCount = services.filter(s => s.vehicleType === 'truck').length;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const getVehicleIcon = (t: string) => ({ car: '🚗', motorcycle: '🏍️', suv: '🚙', truck: '🚚' }[t] || '🚗');
  const getPaymentIcon = (m: string) => ({ pix: '📱', cash: '💵', card: '💳' }[m] || '💰');

  const isToday = selectedDate === todayStr;
  const displayDate = isToday
    ? new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-24">
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white px-4 py-8 shadow-lg overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <svg width="220" height="160" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 70C50 70 35 55 35 45C35 32 42 25 55 25C68 25 75 32 75 45L100 25C107 20 120 20 127 25L152 45C152 32 159 25 172 25C185 25 192 32 192 45C192 55 177 70 177 70M20 85H200M40 100C40 108 33 115 25 115C17 115 10 108 10 100M190 100C190 108 183 115 175 115C167 115 160 108 160 100" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold font-poppins">Pare e Lave</h1>
          </div>
          <p className="text-emerald-50 text-base font-semibold mb-1">Bem-vindo, Senhor e Senhora Matos</p>
          <p className="text-emerald-100 text-xs">{displayDate}</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Date selector */}
        <div>
          <Label className="text-sm font-semibold">Ver dia</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-2"><span className="text-3xl">🚗</span><span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Carros</span></div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veiculos lavados</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-2"><span className="text-3xl">🏍️</span><span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Motos</span></div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{motorcycleCount}</p>
            <p className="text-xs text-gray-500 mt-1">Motos lavadas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2"><span className="text-3xl">📊</span><span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Total</span></div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount + motorcycleCount + suvCount + truckCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veiculos totais</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-md text-white">
            <div className="flex items-center justify-between mb-2"><span className="text-3xl">💰</span><span className="text-xs font-semibold text-emerald-100 bg-emerald-700 bg-opacity-50 px-2 py-1 rounded-full">Faturamento</span></div>
            <p className="text-2xl font-bold font-poppins">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-emerald-100 mt-1">Receita {isToday ? 'do dia' : 'do dia'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-md text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-3xl">💸</span><span className="text-xs font-semibold text-red-100 bg-red-700 bg-opacity-50 px-2 py-1 rounded-full">Despesas</span></div>
          <p className="text-2xl font-bold font-poppins">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-red-100 mt-1">Gastos {isToday ? 'do dia' : 'do dia'}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-4 shadow-md text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-3xl">📈</span><span className="text-xs font-semibold text-emerald-100 bg-emerald-700 bg-opacity-50 px-2 py-1 rounded-full">Lucro Líquido</span></div>
          <p className="text-2xl font-bold font-poppins">{formatCurrency(netProfit)}</p>
          <p className="text-xs text-emerald-100 mt-1">Receita - Despesas</p>
        </div>

        <Button onClick={() => { setFormData(prev => ({ ...prev, createdAt: selectedDate })); setIsOpen(true); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base">
          <Plus className="w-5 h-5 mr-2" /> Registar Novo Servico
        </Button>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Servicos {isToday ? 'de Hoje' : 'do Dia'}</h2>
          {initialLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200"><p className="text-gray-500 text-sm">Nenhum servico registado neste dia</p></div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getVehicleIcon(service.vehicleType)}</span>
                        <p className="font-semibold text-gray-900">{service.clientName || "Cliente"}</p>
                      </div>
                      {service.description && <p className="text-sm text-gray-600 ml-8">{service.description}</p>}
                      <div className="flex items-center gap-2 mt-2 ml-8">
                        <span className="text-lg">{getPaymentIcon(service.paymentMethod)}</span>
                        <span className="text-xs text-gray-500 capitalize">{service.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-lg">{formatCurrency(parseFloat(service.value as any))}</p>
                      <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Gastos {isToday ? 'de Hoje' : 'do Dia'}</h2>
          {initialLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
          ) : expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200"><p className="text-gray-500 text-sm">Nenhum gasto registado neste dia</p></div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{expense.category}</p>
                          {expense.description && <p className="text-xs text-gray-500">{expense.description}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">{formatCurrency(parseFloat(expense.amount as any))}</p>
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
          <DialogHeader><DialogTitle className="font-poppins">Registar Novo Servico</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createService(); }} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Data do Servico</Label>
              <Input
                type="date"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo de Veiculo</Label>
              <Select value={formData.vehicleType} onValueChange={(v) => setFormData({ ...formData, vehicleType: v })}>
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
            <div><Label className="text-sm font-semibold">Nome do Cliente</Label><Input type="text" placeholder="Ex: Joao Silva" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Descricao do Servico</Label><Input type="text" placeholder="Ex: Lavagem completa" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-lg" /></div>
            <div><Label className="text-sm font-semibold">Valor (R$)</Label><Input type="number" step="0.01" placeholder="0.00" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="rounded-lg" /></div>
            <div>
              <Label className="text-sm font-semibold">Metodo de Pagamento</Label>
              <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">📱 PIX</SelectItem>
                  <SelectItem value="cash">💵 Dinheiro</SelectItem>
                  <SelectItem value="card">💳 Cartao</SelectItem>
                  <SelectItem value="other">💰 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</> : "Registar Servico"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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