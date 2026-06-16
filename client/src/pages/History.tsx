import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Search, Trash2, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "week" | "month">("all");

  const utils = trpc.useUtils();
  const { data: allServices = [], isLoading } = trpc.services.getAll.useQuery();
  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      utils.services.getAll.invalidate();
      toast.success("Serviço eliminado");
    },
    onError: () => {
      toast.error("Erro ao eliminar serviço");
    },
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

  const filterByPeriod = (services: any[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filterPeriod) {
      case "week":
        return services.filter((s) => new Date(s.createdAt) >= oneWeekAgo);
      case "month":
        return services.filter((s) => new Date(s.createdAt) >= oneMonthAgo);
      default:
        return services;
    }
  };

  const filteredServices = filterByPeriod(allServices).filter(
    (s) =>
      s.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <HistoryIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Histórico</h1>
        </div>
        <p className="text-blue-100 text-sm">Consulte todos os serviços realizados</p>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar por cliente ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filterPeriod === "all" ? "default" : "outline"}
            onClick={() => setFilterPeriod("all")}
            className={`rounded-lg text-sm font-semibold ${
              filterPeriod === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Todos
          </Button>
          <Button
            variant={filterPeriod === "week" ? "default" : "outline"}
            onClick={() => setFilterPeriod("week")}
            className={`rounded-lg text-sm font-semibold ${
              filterPeriod === "week"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Última Semana
          </Button>
          <Button
            variant={filterPeriod === "month" ? "default" : "outline"}
            onClick={() => setFilterPeriod("month")}
            className={`rounded-lg text-sm font-semibold ${
              filterPeriod === "month"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Último Mês
          </Button>
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-blue-100">
            <HistoryIcon className="w-12 h-12 text-blue-200 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhum serviço encontrado</p>
            <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros de pesquisa</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getVehicleIcon(service.vehicleType)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{service.clientName || "Cliente"}</p>
                        <p className="text-xs text-gray-500">{formatDate(service.createdAt)}</p>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 ml-10 mb-2">{service.description}</p>
                    )}
                    <div className="flex items-center gap-2 ml-10">
                      <span className="text-lg">{getPaymentIcon(service.paymentMethod)}</span>
                      <span className="text-xs text-gray-500 capitalize">{service.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 text-lg">{formatCurrency(parseFloat(service.value as any))}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: service.id })}
                      disabled={deleteMutation.isPending}
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
  );
}
