import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Package, Users, Phone, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";

// CAC-02: Menú superior con 4 opciones + Cerrar sesión
const navItems = [
  { label: "Inicio", path: "/inicio", icon: Home, id: "CAC-02.1" },
  { label: "Productos", path: "/productos", icon: Package, id: "CAC-02.2" },
  { label: "Trabaja con Nosotros", path: "/trabaja-con-nosotros", icon: Users, id: "CAC-02.3" },
  { label: "Contactos", path: "/contactos", icon: Phone, id: "CAC-02.4" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // CAC-02 Escenario 5: Cerrar sesión
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Logo size="sm" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={active ? "celeste-gradient" : ""}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <Button variant={location.pathname === item.path ? "default" : "ghost"} className="w-full justify-start">
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
