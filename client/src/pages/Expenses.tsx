import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Plus, Trash2, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Expenses() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "Produtos",
    description: "",
    amount: "",
  });

  const utils = trpc.useUtils();
  const today = new Date().toISOString().split("T")[0];
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const { data: expenses = [], isLoading } = trpc.expenses.getByPeriod.useQuery({
    startDate: startDateStr,
    endDate: endDateStr,
  });

  const createMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.getByPeriod.invalidate();
      setIsOpen(false);
      setFormData({
        category: "Produtos",
        description: "",
        amount: "",
      });
      toast.success("Gasto registado com sucesso!");
    },
    onError: (error) => {
      console.error("[Expenses] Create error:", error);
      const errorMessage = error?.message || "Erro ao registar gasto";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      utils.expenses.getByPeriod.invalidate();
      toast.success("Gasto eliminado");
    },
    onError: (error) => {
      console.error("[Expenses] Delete error:", error);
      const errorMessage = error?.message || "Erro ao eliminar gasto";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error("Por favor, preencha o valor");
      return;
    }
    createMutation.mutate({
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
    });
  };

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
    }).format(new Date(date));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "produtos":
        return "🧴";
      case "aluguel":
        return "🏢";
      case "funcionário":
        return "👨‍💼";
      case "utensílios":
        return "🧹";
      case "energia":
        return "⚡";
      case "água":
        return "💧";
      case "manutenção":
        return "🔧";
      default:
        return "💸";
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);

  const expensesByCategory = expenses.reduce(
    (acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] || 0) + parseFloat(e.amount as any);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-6 h-6" />
          <h1 className="text-2xl font-bold font-poppins">Gastos</h1>
        </div>
        <p className="text-red-100 text-sm">Controle suas despesas mensais</p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
          <p className="text-red-100 text-sm font-medium mb-1">Total de Gastos (Últimos 30 dias)</p>
          <p className="text-3xl font-bold font-poppins">{formatCurrency(totalExpenses)}</p>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registar Novo Gasto
        </Button>

        {/* Category Summary */}
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
                    <p className="font-bold text-red-600 text-lg">{formatCurrency(amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 font-poppins">Histórico de Gastos</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-red-100">
              <p className="text-gray-500 text-sm">Nenhum gasto registado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white rounded-xl p-4 border border-red-100 hover:border-red-300 hover:shadow-md transition-all"
                >
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate({ id: expense.id })}
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
            <DialogTitle className="font-poppins">Registar Novo Gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Categoria</Label>
              <Input
                type="text"
                placeholder="Ex: Produtos, Aluguel, Funcionário"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Descrição</Label>
              <Input
                type="text"
                placeholder="Ex: Xampu e sabão"
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
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registando...
                </>
              ) : (
                "Registar Gasto"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
