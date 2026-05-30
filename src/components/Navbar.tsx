import { Link, useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'
import { NavLink } from '@/components/NavLink'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Settings, Package, Truck } from 'lucide-react'

const navLinkClass = "px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-accent transition-colors"
const navLinkActive = "text-primary bg-accent font-semibold"

const Navbar = () => {
  const { perfil, rolNombre, isAdmin, isDistribuidor, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const iniciales = perfil?.usuario
    ? perfil.usuario.slice(0, 2).toUpperCase()
    : 'US'

  const rolColor =
    isAdmin ? 'bg-red-100 text-red-700' :
    isDistribuidor ? 'bg-amber-100 text-amber-700' :
    'bg-blue-100 text-blue-700'

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/inicio">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/inicio" className={navLinkClass} activeClassName={navLinkActive}>
            Inicio
          </NavLink>
          <NavLink to="/productos" className={navLinkClass} activeClassName={navLinkActive}>
            Productos
          </NavLink>
          {isDistribuidor && (
            <NavLink to="/distribuidor/envios" className={navLinkClass} activeClassName={navLinkActive}>
            Mis Envíos
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass} activeClassName={navLinkActive}>
              Panel Admin
            </NavLink>
          )}
          <NavLink to="/trabaja-con-nosotros" className={navLinkClass} activeClassName={navLinkActive}>
            Trabaja con Nosotros
          </NavLink>
          <NavLink to="/contactos" className={navLinkClass} activeClassName={navLinkActive}>
            Contactos
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {perfil ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="celeste-gradient text-primary-foreground text-xs font-bold">
                      {iniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground leading-tight">{perfil.usuario}</span>
                    <span className={`text-xs px-1.5 rounded-full font-medium ${rolColor}`}>{rolNombre}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{perfil.usuario}</p>
                  <p className="text-xs text-muted-foreground truncate">{perfil.correo}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="mr-2 h-4 w-4" /> Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/mis-pedidos')}>
                  <Package className="mr-2 h-4 w-4" /> Mis pedidos
                </DropdownMenuItem>
                {isDistribuidor && (
                  <DropdownMenuItem onClick={() => navigate('/distribuidor/envios')}>
                    <Truck className="mr-2 h-4 w-4" /> Mis envíos
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" /> Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/">
              <Button size="sm" className="celeste-gradient">Ingresar</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
