import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import CreateAccount from "./pages/CreateAccount.tsx";
import HomePage from "./pages/HomePage.tsx";
import Products from "./pages/Products.tsx";
import Contact from "./pages/Contact.tsx";
import WorkWithUs from "./pages/WorkWithUs.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/olvide-contrasena" element={<ForgotPassword />} />
          <Route path="/crear-cuenta" element={<CreateAccount />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/contactos" element={<Contact />} />
          <Route path="/trabaja-con-nosotros" element={<WorkWithUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
