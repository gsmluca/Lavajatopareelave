import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Statistics from "./pages/Statistics";
import Expenses from "./pages/Expenses";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "./const";
import { LoginForm } from "./components/LoginForm";

function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Hoje", icon: "home" },
    { path: "/expenses", label: "Gastos", icon: "expenses" },
    { path: "/reports", label: "Relatórios", icon: "report" },
    { path: "/statistics", label: "Estatísticas", icon: "chart" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-emerald-50 border-t-2 border-emerald-200 flex justify-around items-center h-16 max-w-md mx-auto shadow-lg">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          href={tab.path}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-semibold transition-all duration-200 ${
            location === tab.path
              ? tab.path === "/expenses"
                ? "text-red-600 bg-red-100 border-t-2 border-red-600"
                : "text-emerald-600 bg-emerald-100 border-t-2 border-emerald-600"
              : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          <span className="text-xl">
            {tab.icon === "home" && "🏠"}
            {tab.icon === "expenses" && "💸"}
            {tab.icon === "report" && "📊"}
            {tab.icon === "chart" && "📈"}
          </span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/expenses"} component={Expenses} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthGuard() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 relative" />
          </div>
          <p className="text-gray-600 text-base font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => window.location.href = "/"} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      // Redirecionar para login após logout bem-sucedido
      window.location.href = getLoginUrl();
    } catch (error) {
      console.error("Logout failed:", error);
      // Mesmo em caso de erro, redirecionar para login
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 max-w-md mx-auto relative pb-20">
      {/* Header with User Info and Logout */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg max-w-md mx-auto z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🚗 Pare e Lave</h1>
            <p className="text-xs text-emerald-100">{user.name || user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-emerald-700 rounded-lg text-white hover:text-emerald-50 transition-colors disabled:opacity-50"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="pt-20">
        <Router />
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <AuthGuard />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
