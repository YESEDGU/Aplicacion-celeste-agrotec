// ============================================================
//  CELESTE AGROTEC — Distribuidor: Mis Envíos
//  Archivo: src/pages/distribuidor/DistribuidorEnvios.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, Truck, MapPin, Phone, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type EstadoEnvio = 'preparando' | 'en_camino' | 'entregado' | 'fallido'

const ESTADOS: { value: EstadoEnvio; label: string; color: string }[] = [
  { value: 'preparando', label: 'Preparando',  color: 'bg-gray-100 text-gray-600' },
  { value: 'en_camino',  label: 'En camino',   color: 'bg-blue-100 text-blue-700' },
  { value: 'entregado',  label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  { value: 'fallido',    label: 'Fallido',     color: 'bg-red-100 text-red-600' },
]

interface ItemEnvio {
  id: number
  cantidad: number
  precio_unit: number
  subtotal: number
  productos: { nombre: string }
}

interface Envio {
  id: number
  estado: EstadoEnvio
  direccion: string | null
  telefono: string | null
  notas: string | null
  fecha_envio: string | null
  fecha_entrega: string | null
  fecha_crea: string
  pedidos: {
    id: number
    valor_total: number
    metodo_pago: string | null
    notas: string | null
    pedido_items: ItemEnvio[]
    perfiles: { usuario: string; correo: string }
  }
}

function formatPrecio(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function BadgeEstado({ estado }: { estado: EstadoEnvio }) {
  const e = ESTADOS.find(s => s.value === estado) ?? ESTADOS[0]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${e.color}`}>{e.label}</span>
}

function TarjetaEnvio({ envio, onCambiarEstado }: {
  envio: Envio
  onCambiarEstado: (id: number, estado: EstadoEnvio) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [cambiando, setCambiando] = useState(false)

  const handleCambio = async (nuevoEstado: EstadoEnvio) => {
    setCambiando(true)
    await onCambiarEstado(envio.id, nuevoEstado)
    setCambiando(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">Envío #{envio.id}</span>
            <span className="font-mono text-xs text-gray-400">· Pedido #{envio.pedidos?.id}</span>
            <BadgeEstado estado={envio.estado} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatFecha(envio.fecha_crea)}</p>

          {envio.direccion && (
            <p className="text-sm text-gray-700 mt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {envio.direccion}
            </p>
          )}
          {envio.telefono && (
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {envio.telefono}
            </p>
          )}

          <p className="text-base font-bold text-gray-900 mt-2">
            {formatPrecio(envio.pedidos?.valor_total ?? 0)}
            {envio.pedidos?.metodo_pago && (
              <span className="text-xs font-normal text-gray-400 ml-2 capitalize">· {envio.pedidos.metodo_pago}</span>
            )}
          </p>
        </div>

        <button onClick={() => setAbierto(!abierto)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          {abierto ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      {/* Cambiar estado */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
        <div className="flex gap-2 flex-wrap">
          {ESTADOS.map(e => (
            <button
              key={e.value}
              onClick={() => handleCambio(e.value)}
              disabled={cambiando || envio.estado === e.value}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                envio.estado === e.value
                  ? e.color + ' ring-2 ring-offset-1 ring-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cambiando && envio.estado !== e.value ? '...' : e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detalle expandible */}
      {abierto && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Cliente */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
            <p className="text-sm font-medium text-gray-800">{envio.pedidos?.perfiles?.usuario}</p>
            <p className="text-xs text-gray-400">{envio.pedidos?.perfiles?.correo}</p>
          </div>

          {/* Productos */}
          {envio.pedidos?.pedido_items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos</p>
              <div className="space-y-1.5">
                {envio.pedidos.pedido_items.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{item.productos?.nombre}</span>
                    <span className="text-xs text-gray-500">×{item.cantidad}</span>
                    <span className="text-sm font-medium text-gray-800">{formatPrecio(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas del pedido */}
          {envio.pedidos?.notas && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas del cliente</p>
              <p className="text-sm text-gray-600">{envio.pedidos.notas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DistribuidorEnvios() {
  const { perfil } = useAuth()
  const [envios, setEnvios] = useState<Envio[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoEnvio | 'todos'>('todos')

  const cargar = async () => {
    if (!perfil) return
    setLoading(true)

    // Buscar el distribuidor asociado a este usuario
    const { data: dist } = await supabase
      .from('distribuidores')
      .select('id')
      .eq('id_usuario', perfil.id)
      .single()

    if (!dist) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('envios')
      .select(`
        id, estado, direccion, telefono, notas, fecha_envio, fecha_entrega, fecha_crea,
        pedidos (
          id, valor_total, metodo_pago, notas,
          pedido_items (id, cantidad, precio_unit, subtotal, productos(nombre)),
          perfiles (usuario, correo)
        )
      `)
      .eq('id_distribuidor', dist.id)
      .order('fecha_crea', { ascending: false })

    setEnvios((data as unknown as Envio[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [perfil])

  const cambiarEstado = async (id: number, estado: EstadoEnvio) => {
  const updates: Record<string, unknown> = { estado }
  if (estado === 'en_camino') updates.fecha_envio = new Date().toISOString()
  if (estado === 'entregado') updates.fecha_entrega = new Date().toISOString()

  const envio = envios.find(e => e.id === id)

  await supabase.from('envios').update(updates).eq('id', id)

  // Sincronizar estado del pedido
  await supabase.rpc('sincronizar_estado_pedido', {
    p_envio_id: id,
    p_estado_envio: estado,
  })

  // Si se entrega, aprobar el pago
  if (estado === 'entregado') {
    if (envio?.pedidos?.id) {
      await supabase.rpc('aprobar_pago_pedido', { p_pedido_id: envio.pedidos.id })
    }
  }

  // Registrar en auditoría
  await supabase.rpc('registrar_auditoria', {
    p_responsable: perfil?.usuario ?? 'Distribuidor',
    p_id_usuario: perfil?.id ?? null,
    p_accion: 'cambiar_estado',
    p_tabla: 'envios',
    p_id_registro: id,
    p_valor_anterior: { estado: envio?.estado },
    p_valor_nuevo: { estado },
  })

  await cargar()
}

  const filtrados = filtro === 'todos' ? envios : envios.filter(e => e.estado === filtro)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-600" /> Mis Envíos
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{envios.length} envíos asignados</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filtro === 'todos' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {ESTADOS.map(e => (
          <button
            key={e.value}
            onClick={() => setFiltro(e.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === e.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : envios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Truck className="w-10 h-10 opacity-30" />
          <p className="text-sm">No tienes envíos asignados todavía</p>
          <p className="text-xs text-gray-300">El administrador te asignará envíos desde el panel admin</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Truck className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay envíos con ese estado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map(envio => (
            <TarjetaEnvio key={envio.id} envio={envio} onCambiarEstado={cambiarEstado} />
          ))}
        </div>
      )}
    </div>
  )
}
