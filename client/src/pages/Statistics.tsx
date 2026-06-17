import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const API = 'https://pare-e-lave-backend-production-931d.up.railway.app/api/trpc';

export default function Statistics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchStats = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const statsUrl = new URL(`${API}/services.getStats`);
      statsUrl.searchParams.set('input', JSON.stringify({
        json: { startDate, endDate }
      }));
      const res = await fetch(statsUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.result?.data?.json) {
        setStats(data.result.data.json);
      } else {
        console.error('[Statistics] Stats error:', data);
        setStats(null);
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('[Statistics] Fetch error:', err);
      setStats(null);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [period, selectedDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const vehicleData = stats
    ? [
        { name: 'Carros', value: stats.carCount, fill: '#10b981' },
        { name: 'Motos', value: stats.motorcycleCount, fill: '#3b82f6' },
        { name: 'SUVs', value: stats.suvCount, fill: '#f59e0b' },
        { name: 'Caminhões', value: stats.truckCount, fill: '#ef4444' },
      ].filter((item) => item.value > 0)
    : [];

  const paymentData = stats
    ? [
        { name: 'PIX', value: stats.pixCount, fill: '#06b6d4' },
        { name: 'Dinheiro', value: stats.cashCount, fill: '#84cc16' },
        { name: 'Cartão', value: stats.cardCount, fill: '#a855f7' },
      ].filter((item) => item.value > 0)
    : [];

  const paymentValueData = stats
    ? [
        { name: 'PIX', value: stats.pixValue, fill: '#06b6d4' },
        { name: 'Dinheiro', value: stats.cashValue, fill: '#84cc16' },
        { name: 'Cartão', value: stats.cardValue, fill: '#a855f7' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Estatísticas</h1>
        </div>
        <p className="text-indigo-100 text-sm">Análise visual de desempenho</p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Period Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Período</label>
          <div className="grid grid-cols-3 gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
                className={`rounded-lg text-sm font-semibold capitalize ${
                  period === p
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
              </Button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-gray-900 mt-4">Data Final</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {loading || !stats ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">Total de Serviços</p>
                <p className="text-2xl font-bold text-gray-900 font-poppins">{stats.totalServices}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">Faturamento Total</p>
                <p className="text-lg font-bold text-indigo-600 font-poppins">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>

            {/* Vehicle Distribution Chart */}
            {vehicleData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Distribuição de Veículos</h2>
                <div className="h-64 flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    {vehicleData.map((item, index) => {
                      const angle = (index / vehicleData.length) * 360;
                      const startAngle = angle;
                      const endAngle = angle + (item.value / stats.totalServices) * 360;
                      const start = {
                        x: 100 + 80 * Math.cos((startAngle * Math.PI) / 180),
                        y: 100 + 80 * Math.sin((startAngle * Math.PI) / 180),
                      };
                      const end = {
                        x: 100 + 80 * Math.cos((endAngle * Math.PI) / 180),
                        y: 100 + 80 * Math.sin((endAngle * Math.PI) / 180),
                      };
                      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                      const path = [
                        `M 100 100`,
                        `L ${start.x} ${start.y}`,
                        `A 80 80 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
                        `Z`,
                      ].join(' ');
                      return (
                        <path
                          key={item.name}
                          d={path}
                          fill={item.fill}
                          stroke="#fff"
                          strokeWidth="1"
                        />
                      );
                    })}
                    <text x="100" y="100" textAnchor="middle" className="text-xs font-bold" fill="#6b7280">
                      {stats.totalServices}
                    </text>
                  </svg>
                </div>
                <div className="mt-4 space-y-1">
                  {vehicleData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Count Chart */}
            {paymentData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Métodos de Pagamento (Quantidade)</h2>
                <div className="h-64 flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <g>
                      {paymentData.map((item, index) => {
                        const barWidth = 40;
                        const barHeight = (item.value / Math.max(...paymentData.map(d => d.value))) * 120;
                        const x = 30 + index * (barWidth + 20);
                        const y = 180 - barHeight;
                        return (
                          <g key={item.name}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.fill} rx="4" />
                            <text x={x + barWidth / 2} y={195} textAnchor="middle" className="text-xs fill-gray-600" fontSize="10">
                              {item.name}
                            </text>
                            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs fill-gray-800" fontSize="10">
                              {item.value}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
                <div className="mt-4 space-y-1">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Value Chart */}
            {paymentValueData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Faturamento por Método</h2>
                <div className="h-64 flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <g>
                      {paymentValueData.map((item, index) => {
                        const barWidth = 40;
                        const barHeight = (item.value / Math.max(...paymentValueData.map(d => d.value))) * 120;
                        const x = 30 + index * (barWidth + 20);
                        const y = 180 - barHeight;
                        return (
                          <g key={item.name}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.fill} rx="4" />
                            <text x={x + barWidth / 2} y={195} textAnchor="middle" className="text-xs fill-gray-600" fontSize="10">
                              {item.name}
                            </text>
                            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs fill-gray-800" fontSize="10">
                              {formatCurrency(item.value)}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
                <div className="mt-4 space-y-1">
                  {paymentValueData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Summary */}
            <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Resumo Detalhado</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">🚗 Carros</span>
                  <span className="font-semibold text-gray-900">{stats.carCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">🏍️ Motos</span>
                  <span className="font-semibold text-gray-900">{stats.motorcycleCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">🚙 SUVs</span>
                  <span className="font-semibold text-gray-900">{stats.suvCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">🚚 Caminhões</span>
                  <span className="font-semibold text-gray-900">{stats.truckCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">📱 PIX</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.pixValue)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">💵 Dinheiro</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.cashValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💳 Cartão</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.cardValue)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
