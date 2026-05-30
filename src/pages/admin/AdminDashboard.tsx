// ============================================================
//  CELESTE AGROTEC — Dashboard Admin
//  Archivo: src/pages/admin/AdminDashboard.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  LogOut, Menu, X, ChevronRight, Egg, Truck, Mail, UserPlus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import AdminProductos from './AdminProductos'
import AdminUsuarios from './AdminUsuarios'
import AdminPedidos from './AdminPedidos'
import AdminDistribuidores from './AdminDistribuidores'
import AdminContactos from './AdminContactos'
import AdminSolicitudes from './AdminSolicitudes'

// ── Tarjeta de resumen ────────────────────────────────────────
function TarjetaResumen({
  titulo, valor, icono, color
}: {
  titulo: string
  valor: number | string
  icono: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icono}
      </div>
      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  )
}

// ── Página de inicio del dashboard ────────────────────────────
function AdminInicio() {
  const [stats, setStats] = useState({ productos: 0, usuarios: 0, pedidos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarStats() {
      const [{ count: productos }, { count: usuarios }, { count: pedidos }] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
        supabase.from('perfiles').select('*', { count: 'exact', head: true }),
        supabase.from('pedidos').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        productos: productos ?? 0,
        usuarios: usuarios ?? 0,
        pedidos: pedidos ?? 0,
      })
      setLoading(false)
    }
    cargarStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Resumen general</h2>
        <p className="text-sm text-gray-500 mt-1">Estado actual de Celeste Agrotec</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-24 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TarjetaResumen
            titulo="Productos activos"
            valor={stats.productos}
            icono={<Package className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <TarjetaResumen
            titulo="Usuarios registrados"
            valor={stats.usuarios}
            icono={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <TarjetaResumen
            titulo="Pedidos totales"
            valor={stats.pedidos}
            icono={<ShoppingBag className="w-6 h-6 text-amber-600" />}
            color="bg-amber-50"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Accesos rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Gestionar productos', href: '/admin/productos', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
            { label: 'Ver usuarios', href: '/admin/usuarios', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { label: 'Ver pedidos', href: '/admin/pedidos', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
          ].map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${item.color}`}
            >
              {item.label}
              <ChevronRight className="w-4 h-4" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Layout principal del Admin ────────────────────────────────
export default function AdminDashboard() {
  const { perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const navItems = [
    { to: '/admin', label: 'Inicio', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/admin/productos', label: 'Productos', icon: <Package className="w-4 h-4" /> },
    { to: '/admin/usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/pedidos', label: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/admin/distribuidores', label: 'Distribuidores', icon: <Truck className="w-4 h-4" /> },
    { to: '/admin/contactos', label: 'Mensajes', icon: <Mail className="w-4 h-4" /> },
    { to: '/admin/solicitudes', label: 'Solicitudes', icon: <UserPlus className="w-4 h-4" /> },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-60">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Egg className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Celeste Agrotec</p>
            <p className="text-xs text-green-600">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarAbierto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{perfil?.usuario}</p>
          <p className="text-xs text-gray-400 truncate">{perfil?.correo}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar móvil */}
      {sidebarAbierto && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarAbierto(false)} />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar móvil */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarAbierto(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Panel Admin</span>
        </div>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<AdminInicio />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="distribuidores" element={<AdminDistribuidores />} />
            <Route path="contactos" element={<AdminContactos />} />
            <Route path="solicitudes" element={<AdminSolicitudes />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
