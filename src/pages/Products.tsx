// ============================================================
//  CELESTE AGROTEC — Catálogo + Checkout
//  Archivo: src/pages/Products.tsx
// ============================================================

import { useState, useMemo } from 'react'
import {
  ShoppingCart, Plus, Minus, Trash2, Package,
  AlertCircle, Loader2, X, Egg, Drumstick,
  MapPin, CreditCard, CheckCircle2
} from 'lucide-react'
import { useProductos } from '@/hooks/useProductos'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Producto, ItemCarrito } from '@/types/database'

type MetodoPago = 'efectivo' | 'pse' | 'nequi' | 'daviplata'

function formatPrecio(valor: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(valor)
}

function IconoCategoria({ categoria }: { categoria?: string }) {
  const cat = (categoria ?? '').toLowerCase()
  if (cat.includes('huevo')) return <Egg className="w-4 h-4" />
  if (cat.includes('pollo')) return <Drumstick className="w-4 h-4" />
  return <Package className="w-4 h-4" />
}

// ── Tarjeta de producto ───────────────────────────────────────
function TarjetaProducto({ producto, cantidad, onAgregar, onQuitar }: {
  producto: Producto; cantidad: number; onAgregar: () => void; onQuitar: () => void
}) {
  const sinStock = producto.stock === 0
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center relative">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-green-400">
            <IconoCategoria categoria={producto.categoria} />
            <span className="text-xs font-medium text-green-500">{producto.categoria}</span>
          </div>
        )}
        {producto.stock > 0 && producto.stock <= 10 && (
          <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Últimas {producto.stock}
          </span>
        )}
        {sinStock && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            Sin stock
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">{producto.categoria}</p>
          <h3 className="font-semibold text-gray-800 leading-tight mt-0.5">{producto.nombre}</h3>
          {producto.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</p>}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrecio(producto.precio)}</span>
          {sinStock ? (
            <span className="text-sm text-gray-400 italic">No disponible</span>
          ) : cantidad === 0 ? (
            <button onClick={onAgregar} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onQuitar} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Minus className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="w-6 text-center font-semibold text-gray-800 text-sm">{cantidad}</span>
              <button onClick={onAgregar} className="w-7 h-7 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors">
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal de Checkout ─────────────────────────────────────────
function ModalCheckout({ items, onCerrar, onPedidoCreado }: {
  items: ItemCarrito[]
  onCerrar: () => void
  onPedidoCreado: () => void
}) {
  const { perfil } = useAuth()
  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)

  const [direccion, setDireccion] = useState(perfil?.direccion ?? '')
  const [telefono, setTelefono] = useState(perfil?.telefono ?? '')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exitoso, setExitoso] = useState(false)

  const metodos: { value: MetodoPago; label: string; emoji: string }[] = [
    { value: 'efectivo', label: 'Efectivo', emoji: '💵' },
    { value: 'nequi', label: 'Nequi', emoji: '📱' },
    { value: 'daviplata', label: 'Daviplata', emoji: '💳' },
    { value: 'pse', label: 'PSE', emoji: '🏦' },
  ]

  const handleConfirmar = async () => {
    if (!direccion.trim()) { setError('Ingresa la dirección de entrega.'); return }
    if (!perfil) { setError('Debes iniciar sesión.'); return }

    setGuardando(true)
    setError(null)

    // 1. Crear el pedido
    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        id_usuario: perfil.id,
        estado: 'pendiente',
        valor_total: total,
        metodo_pago: metodoPago,
        notas: notas.trim() || null,
      })
      .select()
      .single()

    if (errPedido || !pedido) {
      setError('No se pudo crear el pedido. Intenta de nuevo.')
      setGuardando(false)
      return
    }

    // 2. Insertar los items del pedido
    const itemsPayload = items.map(i => ({
      id_pedido: pedido.id,
      id_producto: i.producto.id,
      cantidad: i.cantidad,
      precio_unit: i.producto.precio,
    }))

    const { error: errItems } = await supabase.from('pedido_items').insert(itemsPayload)

    if (errItems) {
      setError('Error al guardar los productos del pedido.')
      setGuardando(false)
      return
    }

    // 3. Crear el envío
    await supabase.from('envios').insert({
      id_pedido: pedido.id,
      direccion: direccion.trim(),
      telefono: telefono.trim() || null,
      estado: 'preparando',
    })

    // 4. Descontar stock
    for (const item of items) {
      const { data, error: errStock } = await supabase.rpc('descontar_stock', { p_producto_id: item.producto.id, p_cantidad: item.cantidad, }) 
    }

    setGuardando(false)
    setExitoso(true)
    setTimeout(() => {
      onPedidoCreado()
    }, 2500)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={!guardando && !exitoso ? onCerrar : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

          {exitoso ? (
            <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">¡Pedido realizado!</h3>
              <p className="text-sm text-gray-500">Tu pedido fue registrado correctamente. Pronto nos pondremos en contacto contigo.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Confirmar pedido
                </h2>
                <button onClick={onCerrar} disabled={guardando} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {/* Resumen */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Resumen del pedido</p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    {items.map(i => (
                      <div key={i.producto.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{i.producto.nombre} × {i.cantidad}</span>
                        <span className="font-medium text-gray-800">{formatPrecio(i.producto.precio * i.cantidad)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrecio(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Dirección de entrega *
                  </label>
                  <input
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    placeholder="Ej: Calle 45 # 12-34, Bucaramanga"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono de contacto</label>
                  <input
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="Ej: 300 123 4567"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                {/* Método de pago */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Método de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {metodos.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMetodoPago(m.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          metodoPago === m.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notas adicionales</label>
                  <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Indicaciones especiales para la entrega..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t flex gap-3">
                <button onClick={onCerrar} disabled={guardando} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmar}
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                >
                  {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {guardando ? 'Procesando...' : 'Hacer pedido'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Panel lateral del carrito ─────────────────────────────────
function PanelCarrito({ items, onCerrar, onQuitar, onAgregar, onEliminar, onCheckout }: {
  items: ItemCarrito[]
  onCerrar: () => void
  onQuitar: (id: number) => void
  onAgregar: (id: number) => void
  onEliminar: (id: number) => void
  onCheckout: () => void
}) {
  const total = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onCerrar} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" /> Mi carrito
          </h2>
          <button onClick={onCerrar} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.producto.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <IconoCategoria categoria={item.producto.categoria} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.producto.nombre}</p>
                    <p className="text-xs text-gray-500">{formatPrecio(item.producto.precio)} c/u</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => onQuitar(item.producto.id)} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => onAgregar(item.producto.id)} className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700">
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => onEliminar(item.producto.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-sm font-bold text-gray-800">{formatPrecio(item.producto.precio * item.cantidad)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrecio(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Confirmar pedido
              </button>
              <p className="text-xs text-center text-gray-400">
                Pago con efectivo, PSE, Nequi o Daviplata
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function Products() {
  const { productos, loading, error, refetch } = useProductos(true)
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [checkoutAbierto, setCheckoutAbierto] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos')
  const [busqueda, setBusqueda] = useState('')

  const categorias = useMemo(() => {
    const cats = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))) as string[]
    return ['Todos', ...cats.sort()]
  }, [productos])

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideCategoria = filtroCategoria === 'Todos' || p.categoria === filtroCategoria
      const coincideBusqueda =
        busqueda === '' ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase())
      return coincideCategoria && coincideBusqueda
    })
  }, [productos, filtroCategoria, busqueda])

  const getCantidad = (id: number) => carrito.find((i) => i.producto.id === id)?.cantidad ?? 0
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id)
      if (existe) return prev.map((i) => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  const quitarDelCarrito = (id: number) => {
    setCarrito((prev) => {
      const item = prev.find((i) => i.producto.id === id)
      if (!item) return prev
      if (item.cantidad === 1) return prev.filter((i) => i.producto.id !== id)
      return prev.map((i) => (i.producto.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
    })
  }

  const eliminarDelCarrito = (id: number) => setCarrito((prev) => prev.filter((i) => i.producto.id !== id))

  const handlePedidoCreado = () => {
    setCarrito([])
    setCheckoutAbierto(false)
    setCarritoAbierto(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nuestros Productos</h1>
            <p className="text-sm text-gray-500">Directo del campo a tu mesa</p>
          </div>
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex gap-2 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtroCategoria === cat ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <p className="text-sm">Cargando productos...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-red-500">
            <AlertCircle className="w-10 h-10" />
            <p className="text-sm">{error}</p>
            <button onClick={refetch} className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors">
              Reintentar
            </button>
          </div>
        )}
        {!loading && !error && productosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Package className="w-10 h-10 opacity-40" />
            <p className="text-sm">No se encontraron productos</p>
            {busqueda && <button onClick={() => setBusqueda('')} className="text-sm text-green-600 hover:underline">Limpiar búsqueda</button>}
          </div>
        )}
        {!loading && !error && productosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                cantidad={getCantidad(producto.id)}
                onAgregar={() => agregarAlCarrito(producto)}
                onQuitar={() => quitarDelCarrito(producto.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Panel carrito */}
      {carritoAbierto && (
        <PanelCarrito
          items={carrito}
          onCerrar={() => setCarritoAbierto(false)}
          onQuitar={quitarDelCarrito}
          onAgregar={(id) => { const prod = productos.find((p) => p.id === id); if (prod) agregarAlCarrito(prod) }}
          onEliminar={eliminarDelCarrito}
          onCheckout={() => { setCarritoAbierto(false); setCheckoutAbierto(true) }}
        />
      )}

      {/* Modal checkout */}
      {checkoutAbierto && (
        <ModalCheckout
          items={carrito}
          onCerrar={() => setCheckoutAbierto(false)}
          onPedidoCreado={handlePedidoCreado}
        />
      )}
    </div>
  )
}
