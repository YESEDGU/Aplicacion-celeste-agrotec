// ============================================================
//  CELESTE AGROTEC — Mis Pedidos (Cliente)
//  Archivo: src/pages/MisPedidos.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { ShoppingBag, ChevronDown, ChevronUp, Loader2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type EstadoPedido = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado'
type EstadoEnvio = 'preparando' | 'en_camino' | 'entregado' | 'fallido'

interface ItemPedido {
  id: number
  cantidad: number
  precio_unit: number
  subtotal: number
  productos: { nombre: string; imagen_url: string | null }
}

interface EnvioPedido {
  estado: EstadoEnvio
  direccion: string | null
  fecha_envio: string | null
  fecha_entrega: string | null
}

interface PedidoCompleto {
  id: number
  estado: EstadoPedido
  valor_total: number
  metodo_pago: string | null
  notas: string | null
  fecha_crea: string
  pedido_items: ItemPedido[]
  envios: EnvioPedido[]
}

const ESTADO_PEDIDO: Record<EstadoPedido, { label: string; color: string; paso: number }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700', paso: 1 },
  en_proceso:  { label: 'En proceso',  color: 'bg-blue-100 text-blue-700',     paso: 2 },
  entregado:   { label: 'Entregado',   color: 'bg-green-100 text-green-700',   paso: 4 },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-600',       paso: 0 },
}

const ESTADO_ENVIO: Record<EstadoEnvio, { label: string; color: string }> = {
  preparando:  { label: 'Preparando',  color: 'bg-gray-100 text-gray-600' },
  en_camino:   { label: 'En camino',   color: 'bg-blue-100 text-blue-700' },
  entregado:   { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  fallido:     { label: 'Fallido',     color: 'bg-red-100 text-red-600' },
}

function formatPrecio(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ── Barra de progreso del pedido ──────────────────────────────
function BarraProgreso({ estado, estadoEnvio }: { estado: EstadoPedido; estadoEnvio?: string }) {
  if (estado === 'cancelado') return (
    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-red-400" /> Pedido cancelado
    </div>
  )

  const pasos = [
    { paso: 1, label: 'Pendiente' },
    { paso: 2, label: 'En proceso' },
    { paso: 3, label: 'En camino' },
    { paso: 4, label: 'Entregado' },
  ]
  const actual =
  estado === 'entregado' || estadoEnvio === 'entregado' ? 4 :
  estadoEnvio === 'en_camino' ? 3 :
  estadoEnvio === 'preparando' || estado === 'en_proceso' ? 2 :
  ESTADO_PEDIDO[estado].paso

  return (
    <div className="flex items-center gap-1">
      {pasos.map((p, i) => (
        <div key={p.paso} className="flex items-center gap-1 flex-1">
          <div className={`flex flex-col items-center flex-1 ${i > 0 ? '' : ''}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              actual >= p.paso ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {actual > p.paso ? '✓' : p.paso}
            </div>
            <span className={`text-xs mt-1 text-center leading-tight ${actual >= p.paso ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
              {p.label}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 ${actual > p.paso ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tarjeta de pedido ─────────────────────────────────────────
function TarjetaPedido({ pedido }: { pedido: PedidoCompleto }) {
  const [abierto, setAbierto] = useState(false)
  const envio = pedido.envios?.[0]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header del pedido */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">#{pedido.id}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_PEDIDO[pedido.estado].color}`}>
              {ESTADO_PEDIDO[pedido.estado].label}
            </span>
            {envio && (
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_ENVIO[envio.estado].color}`}>
                Envío: {ESTADO_ENVIO[envio.estado].label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatFecha(pedido.fecha_crea)}</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{formatPrecio(pedido.valor_total)}</p>
          {pedido.metodo_pago && (
            <p className="text-xs text-gray-500 capitalize mt-0.5">Pago: {pedido.metodo_pago}</p>
          )}
        </div>
        <button
          onClick={() => setAbierto(!abierto)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {abierto ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="px-4 pb-4">
        <BarraProgreso 
              estado={pedido.estado} 
              estadoEnvio={pedido.envios?.find(e => e.estado !== 'fallido')?.estado} 
/>
      </div>

      {/* Detalle expandible */}
      {abierto && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos</p>
            <div className="space-y-2">
              {pedido.pedido_items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.productos?.imagen_url ? (
                    <img src={item.productos.imagen_url} alt={item.productos.nombre} className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-green-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{item.productos?.nombre}</p>
                    <p className="text-xs text-gray-400">{item.cantidad} × {formatPrecio(item.precio_unit)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{formatPrecio(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Envío */}
          {envio?.direccion && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección de entrega</p>
              <p className="text-sm text-gray-600">{envio.direccion}</p>
            </div>
          )}

          {/* Notas */}
          {pedido.notas && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm text-gray-600">{pedido.notas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function MisPedidos() {
  const { perfil } = useAuth()
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    async function cargar() {
      const { data } = await supabase
        .from('pedidos')
        .select(`
          id, estado, valor_total, metodo_pago, notas, fecha_crea,
          pedido_items (id, cantidad, precio_unit, subtotal, productos(nombre, imagen_url)),
          envios (estado, direccion, fecha_envio, fecha_entrega)
        `)
        .eq('id_usuario', perfil!.id)
        .order('fecha_crea', { ascending: false })

        console.log('Pedidos:', JSON.stringify(data, null, 2)) // ← agrega esta línea
        setPedidos((data as unknown as PedidoCompleto[]) ?? [])
        setLoading(false)

      setPedidos((data as unknown as PedidoCompleto[]) ?? [])
      setLoading(false)
    }
    cargar()
  }, [perfil])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-green-600" /> Mis Pedidos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Historial y estado de tus pedidos</p>
          <button onClick={() => window.location.reload()} className="text-xs text-green-600 hover:underline mt-1">
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-green-500" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
            <ShoppingBag className="w-12 h-12 opacity-30" />
            <p className="text-sm">Aún no tienes pedidos</p>
            <a href="/productos" className="text-sm text-green-600 hover:underline font-medium">
              Ver productos →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => <TarjetaPedido key={p.id} pedido={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
