import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: "car",
    clientName: "",
    description: "",
    value: "",
    paymentMethod: "pix",
  });

  const utils = trpc.useUtils();
  const { data: services = [], isLoading } = trpc.services.getTodayServices.useQuery();
  const { data: ownerProfile } = trpc.ownerProfile.get.useQuery();
  
  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.getTodayServices.invalidate();
      setIsOpen(false);
      setFormData({
        vehicleType: "car",
        clientName: "",
        description: "",
        value: "",
        paymentMethod: "pix",
      });
      toast.success("Serviço registado com sucesso!");
    },
    onError: (error) => {
      console.error("[Dashboard] Create service error:", error);
      const errorMessage = error?.message || "Erro ao registar serviço";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      utils.services.getTodayServices.invalidate();
      toast.success("Serviço eliminado");
    },
    onError: (error) => {
      console.error("[Dashboard] Delete service error:", error);
      const errorMessage = error?.message || "Erro ao eliminar serviço";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value) {
      toast.error("Por favor, preencha o valor");
      return;
    }
    createMutation.mutate({
      vehicleType: formData.vehicleType as "car" | "motorcycle" | "suv" | "truck" | "other",
      clientName: formData.clientName,
      description: formData.description,
      value: formData.value,
      paymentMethod: formData.paymentMethod as "pix" | "cash" | "card" | "other",
    })
  };

  const totalValue = services.reduce((sum, s) => sum + parseFloat(s.value as any), 0);
  const carCount = services.filter((s) => s.vehicleType === "car").length;
  const motorcycleCount = services.filter((s) => s.vehicleType === "motorcycle").length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-PT", {
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

  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-24">
      {/* Header with greeting and car background */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white px-4 py-8 shadow-lg overflow-hidden">
        {/* Car SVG Background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <svg width="220" height="160" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 70C50 70 35 55 35 45C35 32 42 25 55 25C68 25 75 32 75 45L100 25C107 20 120 20 127 25L152 45C152 32 159 25 172 25C185 25 192 32 192 45C192 55 177 70 177 70M20 85H200M40 100C40 108 33 115 25 115C17 115 10 108 10 100M190 100C190 108 183 115 175 115C167 115 160 108 160 100" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold font-poppins">Pare e Lave</h1>
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-emerald-50 text-base font-semibold mb-1">
            Bem-vindo, Senhor e Senhora Matos
          </p>
          <p className="text-emerald-100 text-xs">{today}</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Carros */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🚗</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Carros</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veículos lavados</p>
          </div>

          {/* Motos */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏍️</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Motos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{motorcycleCount}</p>
            <p className="text-xs text-gray-500 mt-1">Motos lavadas</p>
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-poppins">{carCount + motorcycleCount}</p>
            <p className="text-xs text-gray-500 mt-1">Veículos totais</p>
          </div>

          {/* Faturamento */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-md text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-xs font-semibold text-emerald-100 bg-emerald-700 bg-opacity-50 px-2 py-1 rounded-full">Faturamento</span>
            </div>
            <p className="text-2xl font-bold font-poppins">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-emerald-100 mt-1">Receita do dia</p>
          </div>
        </div>

        {/* Register Button */}
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registar Novo Serviço
        </Button>

        {/* Services List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Serviços de Hoje</h2>
          {isLoading ? (
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
                        <span className="text-xs text-gray-500">{formatDate(service.createdAt)}</span>
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

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">Registar Novo Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={createMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              {createMutation.isPending ? (
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
