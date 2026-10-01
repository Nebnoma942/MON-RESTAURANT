import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Restaurants from '@/pages/restaurants';
import UsersPage from '@/pages/users';
import OrdersPage from '@/pages/orders';
import { AdminLayout } from '@/components/layout/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: { component: any; path: string }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <Route {...rest}>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </Route>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/restaurants" component={Restaurants} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      
      <Route>
        {isAuthenticated ? (
          <AdminLayout>
            <NotFound />
          </AdminLayout>
        ) : (
          <NotFound />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
