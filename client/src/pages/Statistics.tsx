import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Statistics() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const getDateRange = () => {
    const now = new Date(selectedDate);
    let startDate = selectedDate;
    let endDate = selectedDate;

    if (period === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      startDate = weekStart.toISOString().split("T")[0];
      endDate = selectedDate;
    } else if (period === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString().split("T")[0];
      endDate = selectedDate;
    } else if (period === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      startDate = yearStart.toISOString().split("T")[0];
      endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();
  const { data: stats, isLoading } = trpc.services.getStats.useQuery({
    startDate,
    endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const vehicleData = stats
    ? [
        { name: "Carros", value: stats.carCount, fill: "#10b981" },
        { name: "Motos", value: stats.motorcycleCount, fill: "#3b82f6" },
        { name: "SUVs", value: stats.suvCount, fill: "#f59e0b" },
        { name: "Caminhões", value: stats.truckCount, fill: "#ef4444" },
      ].filter((item) => item.value > 0)
    : [];

  const paymentData = stats
    ? [
        { name: "PIX", value: stats.pixCount, fill: "#06b6d4" },
        { name: "Dinheiro", value: stats.cashCount, fill: "#84cc16" },
        { name: "Cartão", value: stats.cardCount, fill: "#a855f7" },
      ].filter((item) => item.value > 0)
    : [];

  const paymentValueData = stats
    ? [
        { name: "PIX", value: stats.pixValue, fill: "#06b6d4" },
        { name: "Dinheiro", value: stats.cashValue, fill: "#84cc16" },
        { name: "Cartão", value: stats.cardValue, fill: "#a855f7" },
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
            {(["week", "month", "year"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                onClick={() => setPeriod(p)}
                className={`rounded-lg text-sm font-semibold capitalize ${
                  period === p
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
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

        {isLoading || !stats ? (
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
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={vehicleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Methods Count Chart */}
            {paymentData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Métodos de Pagamento (Quantidade)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={paymentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Methods Value Chart */}
            {paymentValueData.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 font-poppins">Faturamento por Método</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={paymentValueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
