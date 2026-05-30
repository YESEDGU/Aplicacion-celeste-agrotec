import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateAccount from "./pages/CreateAccount";
import MisPedidos from "./pages/MisPedidos";
import HomePage from "./pages/HomePage";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import WorkWithUs from "./pages/WorkWithUs";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DistribuidorDashboard from "./pages/distribuidor/DistribuidorDashboard";

const queryClient = new QueryClient();

function LayoutConNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
}

function DistribuidorRoute({ children }: { children: React.ReactNode }) {
  const { isDistribuidor, loading } = useAuth();
  if (loading) return null;
  if (!isDistribuidor) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/olvide-contrasena" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/crear-cuenta" element={<CreateAccount />} />

      {/* Autenticadas con Navbar */}
      <Route element={<LayoutConNavbar />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/contactos" element={<Contact />} />
        <Route path="/trabaja-con-nosotros" element={<WorkWithUs />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />

      {/* Distribuidor */}
      <Route path="/distribuidor/*" element={
        <DistribuidorRoute>
          <DistribuidorDashboard />
        </DistribuidorRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
