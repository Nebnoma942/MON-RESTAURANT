import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import MenuPage from "@/pages/MenuPage";
import ProfilePage from "@/pages/ProfilePage";
import SetupRestaurantPage from "@/pages/SetupRestaurantPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background w-full max-w-3xl mx-auto relative md:border-x md:border-border/60">
      <div className={isAuthenticated ? "pb-20 md:pb-6" : ""}>
        {children}
      </div>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/orders">
        {() => <ProtectedRoute component={OrdersPage} />}
      </Route>
      <Route path="/orders/:id">
        {() => <ProtectedRoute component={OrderDetailPage} />}
      </Route>
      <Route path="/menu">
        {() => <ProtectedRoute component={MenuPage} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>
      <Route path="/restaurant/setup">
        {() => <ProtectedRoute component={SetupRestaurantPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <AppLayout>
        <Router />
      </AppLayout>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppWithAuth />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
