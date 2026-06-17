import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardSimple() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: 'car',
    clientName: '',
    description: '',
    value: '',
    paymentMethod: 'pix',
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch('https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc/services.getTodayServices', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const data = await res.json();
    setServices(data.result.data.json || []);
  };

  const createService = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Não autenticado');
      return;
    }

    const body = {
      json: {
        vehicleType: formData.vehicleType as 'car' | 'motorcycle' | 'suv' | 'truck' | 'other',
        clientName: formData.clientName || null,
        description: formData.description || null,
        value: formData.value,
        paymentMethod: formData.paymentMethod as 'pix' | 'cash' | 'card' | 'other',
      }
    };

    setLoading(true);
    const res = await fetch('https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc/services.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success('Serviço registrado com sucesso!');
      setFormData({
        vehicleType: 'car',
        clientName: '',
        description: '',
        value: '',
        paymentMethod: 'pix',
      });
      setIsOpen(false);
      fetchServices();
    } else {
      toast.error(data.error?.json?.message || 'Erro ao registrar serviço');
    }
  };

  const deleteService = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const body = { json: { id } };
    const res = await fetch('https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc/services.delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success('Serviço eliminado');
      fetchServices();
    } else {
      toast.error('Erro ao eliminar serviço');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const totalValue = services.reduce((sum, s) => sum + parseFloat(s.value as any), 0);
  const carCount = services.filter(s => s.vehicleType === 'car').length;
  const motorcycleCount = services.filter(s => s.vehicleType === 'motorcycle').length;

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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <p className="text-emerald-50 text-base font-semibold mb-1">
            Bem-vindo, Senhor e Senhora Matos
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🚗</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Carros</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veículos lavados</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏍️</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Motos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{motorcycleCount}</p>
            <p className="text-xs text-gray-500 mt-1">Motos lavadas</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount + motorcycleCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veículos totais</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-md text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-xs font-semibold text-emerald-100 bg-emerald-700 bg-opacity-50 px-2 py-1 rounded-full">Faturamento</span>
            </div>
            <p className="text-2xl font-bold font-poppins">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-emerald-100 mt-1">Receita do dia</p>
          </div>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registar Novo Serviço
        </Button>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Serviços de Hoje</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">Nenhum serviço registado hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getVehicleIcon(service.vehicleType)}</span>
                        <p className="font-semibold text-gray-900">{service.clientName || "Cliente"}</p>
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
                      <p className="font-bold text-emerald-600 text-lg">{formatCurrency(parseFloat(service.value as any))}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteService(service.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
          <DialogHeader>
            <DialogTitle className="font-poppins">Registar Novo Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createService(); }} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Tipo de Veículo</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">🚗 Carro</SelectItem>
                  <SelectItem value="motorcycle">🏍️ Moto</SelectItem>
                  <SelectItem value="suv">🚙 SUV</SelectItem>
                  <SelectItem value="truck">🚚 Caminhão</SelectItem>
                  <SelectItem value="other">🚗 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Nome do Cliente</Label>
              <Input
                type="text"
                placeholder="Ex: João Silva"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Descrição do Serviço</Label>
              <Input
                type="text"
                placeholder="Ex: Lavagem completa"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Método de Pagamento</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">📱 PIX</SelectItem>
                  <SelectItem value="cash">💵 Dinheiro</SelectItem>
                  <SelectItem value="card">💳 Cartão</SelectItem>
                  <SelectItem value="other">💰 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registando...
                </>
              ) : (
                "Registar Serviço"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}