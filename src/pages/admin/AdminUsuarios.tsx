// ============================================================
//  CELESTE AGROTEC — Admin: Gestión de Usuarios
//  Archivo: src/pages/admin/AdminUsuarios.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, Shield, User, Truck, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Perfil } from '@/types/database'
import { useAuth } from '@/context/AuthContext'

const ROLES = [
  { id: 1, label: 'Administrador', color: 'bg-purple-100 text-purple-700', icon: <Shield className="w-3 h-3" /> },
  { id: 2, label: 'Cliente', color: 'bg-blue-100 text-blue-700', icon: <User className="w-3 h-3" /> },
  { id: 3, label: 'Distribuidor', color: 'bg-amber-100 text-amber-700', icon: <Truck className="w-3 h-3" /> },
]

function BadgeRol({ id_rol }: { id_rol: number }) {
  const rol = ROLES.find(r => r.id === id_rol) ?? ROLES[1]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${rol.color}`}>
      {rol.icon} {rol.label}
    </span>
  )
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [cambiando, setCambiando] = useState<string | null>(null)
  const { perfil: perfilAdmin } = useAuth()

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('perfiles').select('*').order('fecha_crea', { ascending: false })
    setUsuarios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

const cambiarRol = async (id: string, nuevoRol: number) => {
  setCambiando(id)
  const usuario = usuarios.find(u => u.id === id)

  await supabase.from('perfiles').update({ id_rol: nuevoRol }).eq('id', id)

  await supabase.rpc('registrar_auditoria', {
    p_responsable: perfilAdmin?.usuario ?? 'Admin',
    p_id_usuario: perfilAdmin?.id ?? null,
    p_accion: 'modificar',
    p_tabla: 'perfiles',
    p_id_registro: null,
    p_valor_anterior: { id_rol: usuario?.id_rol },
    p_valor_nuevo: { id_rol: nuevoRol },
  })

  await cargar()
  setCambiando(null)
}

const toggleActivo = async (perfil: Perfil) => {
  setCambiando(perfil.id)

  await supabase.from('perfiles').update({ activo: !perfil.activo }).eq('id', perfil.id)

  await supabase.rpc('registrar_auditoria', {
    p_responsable: perfilAdmin?.usuario ?? 'Admin',
    p_id_usuario: perfilAdmin?.id ?? null,
    p_accion: 'modificar',
    p_tabla: 'perfiles',
    p_id_registro: null,
    p_valor_anterior: { activo: perfil.activo, usuario: perfil.usuario },
    p_valor_nuevo: { activo: !perfil.activo, usuario: perfil.usuario },
  })

  await cargar()
  setCambiando(null)
}

  const filtrados = usuarios.filter(u =>
    busqueda === '' ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuarios registrados</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cambiar rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs uppercase">
                          {u.usuario[0]}
                        </div>
                        <span className="font-medium text-gray-800">{u.usuario}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.correo}</td>
                    <td className="px-4 py-3 text-center">
                      <BadgeRol id_rol={u.id_rol} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActivo(u)}
                        disabled={cambiando === u.id}
                        className="inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {u.activo ? (
                          <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Activo</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactivo</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={u.id_rol}
                        onChange={e => cambiarRol(u.id, parseInt(e.target.value))}
                        disabled={cambiando === u.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                      >
                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No se encontraron usuarios
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
