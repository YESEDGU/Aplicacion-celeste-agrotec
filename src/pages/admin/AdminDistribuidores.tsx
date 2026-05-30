// ============================================================
//  CELESTE AGROTEC — Admin: Gestión de Distribuidores
//  Archivo: src/pages/admin/AdminDistribuidores.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, X, Loader2, AlertCircle, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Distribuidor, Perfil } from '@/types/database'

interface DistribuidorConPerfil extends Distribuidor {
  perfiles?: { usuario: string; correo: string } | null
}

// ── Modal crear / editar ──────────────────────────────────────
function ModalDistribuidor({
  distribuidor,
  onGuardar,
  onCerrar,
}: {
  distribuidor: Partial<DistribuidorConPerfil> | null
  onGuardar: () => void
  onCerrar: () => void
}) {
  const esNuevo = !distribuidor?.id
  const [form, setForm] = useState({
    cedula: distribuidor?.cedula ?? '',
    nombre: distribuidor?.nombre ?? '',
    placa_vehiculo: distribuidor?.placa_vehiculo ?? '',
    id_usuario: distribuidor?.id_usuario ?? '',
  })
  const [usuarios, setUsuarios] = useState<Perfil[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  // Cargar usuarios con rol Distribuidor (id_rol = 3)
  useEffect(() => {
    async function cargarUsuarios() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id_rol', 3)
        .eq('activo', true)
        .order('usuario')
      setUsuarios(data ?? [])
    }
    cargarUsuarios()
  }, [])

  const handleGuardar = async () => {
    if (!form.cedula.trim() || !form.nombre.trim()) {
      setError('Cédula y nombre son obligatorios.')
      return
    }

    setGuardando(true)
    setError(null)

    const payload = {
      cedula: form.cedula.trim(),
      nombre: form.nombre.trim(),
      placa_vehiculo: form.placa_vehiculo.trim() || null,
      id_usuario: form.id_usuario || null,
    }

    const { error: err } = esNuevo
      ? await supabase.from('distribuidores').insert(payload)
      : await supabase.from('distribuidores').update(payload).eq('id', distribuidor!.id!)

    if (err) {
      if (err.message.includes('unique') || err.code === '23505') {
        setError('Ya existe un distribuidor con esa cédula.')
      } else {
        setError('No se pudo guardar. Intenta de nuevo.')
      }
      console.error(err)
    } else {
      onGuardar()
    }
    setGuardando(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCerrar} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {esNuevo ? 'Nuevo distribuidor' : 'Editar distribuidor'}
            </h2>
            <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
              <input
                value={form.cedula}
                onChange={e => set('cedula', e.target.value)}
                placeholder="Ej: 1234567890"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Nombre del distribuidor"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa del vehículo</label>
              <input
                value={form.placa_vehiculo}
                onChange={e => set('placa_vehiculo', e.target.value)}
                placeholder="Ej: ABC123"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario asociado
                <span className="text-xs text-gray-400 font-normal ml-1">(usuarios con rol Distribuidor)</span>
              </label>
              {usuarios.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  No hay usuarios con rol Distribuidor. Ve a Usuarios y cambia el rol primero.
                </p>
              ) : (
                <select
                  value={form.id_usuario}
                  onChange={e => set('id_usuario', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="">— Sin asignar —</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.usuario} ({u.correo})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t">
            <button onClick={onCerrar} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              {esNuevo ? 'Crear distribuidor' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function AdminDistribuidores() {
  const [distribuidores, setDistribuidores] = useState<DistribuidorConPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Partial<DistribuidorConPerfil> | null | undefined>(undefined)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('distribuidores')
      .select('*, perfiles(usuario, correo)')
      .order('nombre')
    setDistribuidores(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const toggleActivo = async (d: DistribuidorConPerfil) => {
    await supabase.from('distribuidores').update({ activo: !d.activo }).eq('id', d.id)
    cargar()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Distribuidores</h2>
          <p className="text-sm text-gray-500 mt-0.5">{distribuidores.length} distribuidores registrados</p>
        </div>
        <button
          onClick={() => setModal(null)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo distribuidor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : distribuidores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Truck className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay distribuidores registrados</p>
          <button onClick={() => setModal(null)} className="text-sm text-green-600 hover:underline">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribuidor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cédula</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Placa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {distribuidores.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-medium text-gray-800">{d.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.cedula}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.placa_vehiculo ?? '—'}</td>
                    <td className="px-4 py-3">
                      {d.perfiles ? (
                        <div>
                          <p className="text-sm text-gray-700">{d.perfiles.usuario}</p>
                          <p className="text-xs text-gray-400">{d.perfiles.correo}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActivo(d)}
                        className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                      >
                        {d.activo ? (
                          <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Activo</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactivo</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setModal(d)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal !== undefined && (
        <ModalDistribuidor
          distribuidor={modal}
          onGuardar={() => { setModal(undefined); cargar() }}
          onCerrar={() => setModal(undefined)}
        />
      )}
    </div>
  )
}
