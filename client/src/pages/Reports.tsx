import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Reports() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month");
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
  const { data: services = [], isLoading: servicesLoading } = trpc.services.getByPeriod.useQuery({
    startDate,
    endDate,
  });

  const { data: expenses = [], isLoading: expensesLoading } = trpc.expenses.getByPeriod.useQuery({
    startDate,
    endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "car":
        return "🚗";
      case "motorcycle":
        return "🏍️";
      case "suv":
        return "🚙";
      case "truck":
        return "🚚";
      default:
        return "🚗";
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "pix":
        return "📱";
      case "cash":
        return "💵";
      case "card":
        return "💳";
      default:
        return "💰";
    }
  };

  const totalRevenue = services.reduce((sum, s) => sum + parseFloat(s.value as any), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);
  const netProfit = totalRevenue - totalExpenses;

  const carCount = services.filter((s) => s.vehicleType === "car").length;
  const motorcycleCount = services.filter((s) => s.vehicleType === "motorcycle").length;
  const suvCount = services.filter((s) => s.vehicleType === "suv").length;
  const truckCount = services.filter((s) => s.vehicleType === "truck").length;

  const periodLabel = {
    day: "Dia",
    week: "Semana",
    month: "Mês",
    year: "Ano",
  }[period];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Relatórios</h1>
        </div>
        <p className="text-purple-100 text-sm">Análise detalhada de receitas e despesas</p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Period Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">Período</label>
          <div className="grid grid-cols-2 gap-2">
            {(["day", "week", "month", "year"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                onClick={() => setPeriod(p)}
                className={`rounded-lg text-sm font-semibold capitalize ${
                  period === p
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-purple-200 text-purple-600 hover:bg-purple-50"
                }`}
              >
                {p === "day" ? "Dia" : p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
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

        {/* Cash Flow Summary */}
        {servicesLoading || expensesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              {/* Revenue */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                <p className="text-green-100 text-sm font-medium mb-1">Receita Total</p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(totalRevenue)}</p>
                <p className="text-green-100 text-xs mt-2">{services.length} serviços</p>
              </div>

              {/* Expenses */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                <p className="text-red-100 text-sm font-medium mb-1">Despesas Totais</p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(totalExpenses)}</p>
                <p className="text-red-100 text-xs mt-2">{expenses.length} gastos</p>
              </div>

              {/* Net Profit */}
              <div className={`bg-gradient-to-br ${netProfit >= 0 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600"} rounded-2xl p-6 shadow-lg text-white`}>
                <p className={`${netProfit >= 0 ? "text-emerald-100" : "text-orange-100"} text-sm font-medium mb-1`}>Lucro Líquido</p>
                <p className="text-3xl font-bold font-poppins">{formatCurrency(netProfit)}</p>
                <p className={`${netProfit >= 0 ? "text-emerald-100" : "text-orange-100"} text-xs mt-2`}>
                  {netProfit >= 0 ? "✓ Resultado positivo" : "⚠ Resultado negativo"}
                </p>
              </div>
            </div>

            {/* Vehicle Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Veículos Lavados</h2>
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
                  <p className="text-xs text-gray-500">Caminhões</p>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Serviços do Período</h2>
              {services.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-purple-100">
                  <p className="text-gray-500 text-sm">Nenhum serviço neste período</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all"
                    >
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
                        <p className="font-bold text-purple-600 text-lg">{formatCurrency(parseFloat(service.value as any))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
