// ============================================================
//  CELESTE AGROTEC — Admin: Gestión de Pedidos
//  Archivo: src/pages/admin/AdminPedidos.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, ShoppingBag, Search, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Pedido, Distribuidor } from '@/types/database'
import { useAuth } from '@/context/AuthContext'

type EstadoPedido = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado'

const ESTADOS: { value: EstadoPedido; label: string; color: string }[] = [
  { value: 'pendiente',  label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'en_proceso', label: 'En proceso', color: 'bg-blue-100 text-blue-700' },
  { value: 'entregado',  label: 'Entregado',  color: 'bg-green-100 text-green-700' },
  { value: 'cancelado',  label: 'Cancelado',  color: 'bg-red-100 text-red-600' },
]

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const e = ESTADOS.find(s => s.value === estado) ?? ESTADOS[0]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${e.color}`}>{e.label}</span>
}

function formatPrecio(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface PedidoConPerfil extends Pedido {
  perfiles?: { usuario: string; correo: string } | null
  envios?: { id: number; id_distribuidor: number | null }[]
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<PedidoConPerfil[]>([])
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([])
  const { perfil } = useAuth()
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [cambiando, setCambiando] = useState<number | null>(null)
  const [asignando, setAsignando] = useState<number | null>(null)

  const cargar = async () => {
    setLoading(true)
    const [{ data: pedidosData }, { data: distData }] = await Promise.all([
      supabase
        .from('pedidos')
        .select('*, perfiles(usuario, correo), envios(id, id_distribuidor)')
        .order('fecha_crea', { ascending: false }),
      supabase
        .from('distribuidores')
        .select('*')
        .eq('activo', true)
        .order('nombre'),
    ])
    setPedidos(pedidosData ?? [])
    setDistribuidores(distData ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: number, estado: EstadoPedido) => {
  setCambiando(id)
  const pedido = pedidos.find(p => p.id === id)

  await supabase.from('pedidos').update({ estado, fecha_actualiza: new Date().toISOString() }).eq('id', id)

  await supabase.rpc('registrar_auditoria', {
    p_responsable: perfil?.usuario ?? 'Admin',
    p_id_usuario: perfil?.id ?? null,
    p_accion: 'cambiar_estado',
    p_tabla: 'pedidos',
    p_id_registro: id,
    p_valor_anterior: { estado: pedido?.estado },
    p_valor_nuevo: { estado },
  })

  await cargar()
  setCambiando(null)
}

  const asignarDistribuidor = async (pedido: PedidoConPerfil, idDistribuidor: string) => {
    setAsignando(pedido.id)
    const envio = pedido.envios?.[0]

    if (envio) {
      // Actualizar envío existente
      await supabase
        .from('envios')
        .update({ id_distribuidor: idDistribuidor ? parseInt(idDistribuidor) : null })
        .eq('id', envio.id)
    } else {
      // Crear envío si no existe
      await supabase.from('envios').insert({
        id_pedido: pedido.id,
        id_distribuidor: idDistribuidor ? parseInt(idDistribuidor) : null,
        estado: 'preparando',
      })
    }

    // Si se asigna distribuidor, cambiar pedido a en_proceso automáticamente
    if (idDistribuidor && pedido.estado === 'pendiente') {
      await supabase.from('pedidos').update({
        estado: 'en_proceso',
        fecha_actualiza: new Date().toISOString(),
      }).eq('id', pedido.id)
    }

    await cargar()
    setAsignando(null)
  }

  const filtrados = pedidos.filter(p => {
    const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    const coincideBusqueda =
      busqueda === '' ||
      p.perfiles?.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.perfiles?.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id.toString().includes(busqueda)
    return coincideEstado && coincideBusqueda
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pedidos</h2>
        <p className="text-sm text-gray-500 mt-0.5">{pedidos.length} pedidos en total</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, correo o # pedido..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === 'todos' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map(e => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === e.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <ShoppingBag className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay pedidos{filtroEstado !== 'todos' ? ` con estado "${filtroEstado}"` : ''}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"># Pedido</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pago</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cambiar estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span className="flex items-center justify-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Distribuidor
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(p => {
                  const envio = p.envios?.[0]
                  const distAsignado = envio?.id_distribuidor?.toString() ?? ''

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{p.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.perfiles?.usuario ?? '—'}</p>
                        <p className="text-xs text-gray-400">{p.perfiles?.correo ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(p.fecha_crea)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatPrecio(p.valor_total)}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{p.metodo_pago ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <BadgeEstado estado={p.estado as EstadoPedido} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={p.estado}
                          onChange={e => cambiarEstado(p.id, e.target.value as EstadoPedido)}
                          disabled={cambiando === p.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                        >
                          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {distribuidores.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Sin distribuidores</span>
                        ) : (
                          <select
                            value={distAsignado}
                            onChange={e => asignarDistribuidor(p, e.target.value)}
                            disabled={asignando === p.id}
                            className={`text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 ${
                              distAsignado ? 'border-green-300 text-green-700' : 'border-gray-200 text-gray-500'
                            }`}
                          >
                            <option value="">— Sin asignar —</option>
                            {distribuidores.map(d => (
                              <option key={d.id} value={d.id}>{d.nombre}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
