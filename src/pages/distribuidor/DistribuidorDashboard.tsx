// ============================================================
//  CELESTE AGROTEC — Dashboard Distribuidor
//  Archivo: src/pages/distribuidor/DistribuidorDashboard.tsx
// ============================================================

import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Truck, LayoutDashboard, LogOut, Menu, Egg } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import DistribuidorEnvios from './DistribuidorEnvios'

function DistribuidorInicio() {
  const { perfil } = useAuth()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bienvenido, {perfil?.usuario}</h2>
        <p className="text-sm text-gray-500 mt-1">Panel de distribución — Celeste Agrotec</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-600 text-sm mb-4">Desde aquí puedes gestionar los envíos que tienes asignados y actualizar su estado.</p>
        <NavLink
          to="/distribuidor/envios"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Truck className="w-4 h-4" /> Ver mis envíos
        </NavLink>
      </div>
    </div>
  )
}

export default function DistribuidorDashboard() {
  const { perfil, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const navItems = [
    { to: '/distribuidor', label: 'Inicio', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/distribuidor/envios', label: 'Mis Envíos', icon: <Truck className="w-4 h-4" /> },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-60">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Egg className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Celeste Agrotec</p>
            <p className="text-xs text-green-600">Panel Distribuidor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarAbierto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}{item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{perfil?.usuario}</p>
          <p className="text-xs text-gray-400 truncate">{perfil?.correo}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>

      {sidebarAbierto && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarAbierto(false)} />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden"><Sidebar /></div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarAbierto(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Panel Distribuidor</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<DistribuidorInicio />} />
            <Route path="envios" element={<DistribuidorEnvios />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
