// ============================================================
//  CELESTE AGROTEC — Admin: Gestión de Productos
//  Archivo: src/pages/admin/AdminProductos.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Plus, Pencil, PowerOff, Power, X, Loader2, AlertCircle, ImageOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types/database'

const CATEGORIAS = ['Huevos', 'Pollo', 'Concentrados', 'Otros']

function formatPrecio(valor: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)
}

// ── Modal crear / editar ──────────────────────────────────────
function ModalProducto({
  producto,
  onGuardar,
  onCerrar,
}: {
  producto: Partial<Producto> | null
  onGuardar: () => void
  onCerrar: () => void
}) {
  const esNuevo = !producto?.id
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: producto?.precio?.toString() ?? '',
    stock: producto?.stock?.toString() ?? '',
    categoria: producto?.categoria ?? 'Huevos',
    imagen_url: producto?.imagen_url ?? '',
    estado: producto?.estado ?? 'activo',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.precio || !form.stock) {
      setError('Nombre, precio y stock son obligatorios.')
      return
    }
    setGuardando(true)
    setError(null)

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      categoria: form.categoria,
      imagen_url: form.imagen_url.trim() || null,
      estado: form.estado,
      fecha_actualiza: new Date().toISOString(),
    }

    const { error: err } = esNuevo
      ? await supabase.from('productos').insert(payload)
      : await supabase.from('productos').update(payload).eq('id', producto!.id!)

    if (err) {
      setError('No se pudo guardar el producto. Intenta de nuevo.')
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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {esNuevo ? 'Nuevo producto' : 'Editar producto'}
            </h2>
            <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Formulario */}
          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ej: Huevos de Gallina AA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                placeholder="Descripción breve del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP) *</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={e => set('precio', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="15000"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => set('stock', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => set('categoria', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={e => set('estado', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
              <input
                value={form.imagen_url}
                onChange={e => set('imagen_url', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="https://..."
              />
              {form.imagen_url && (
                <img src={form.imagen_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border" />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t">
            <button onClick={onCerrar} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              {esNuevo ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalProducto, setModalProducto] = useState<Partial<Producto> | null | undefined>(undefined)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').order('categoria').order('nombre')
    setProductos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const toggleEstado = async (p: Producto) => {
    const nuevoEstado = p.estado === 'activo' ? 'inactivo' : 'activo'
    await supabase.from('productos').update({ estado: nuevoEstado, fecha_actualiza: new Date().toISOString() }).eq('id', p.id)
    cargar()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Productos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{productos.length} productos en total</p>
        </div>
        <button
          onClick={() => setModalProducto(null)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{p.nombre}</p>
                          {p.descripcion && <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatPrecio(p.precio)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${p.stock <= 10 ? 'text-red-500' : 'text-gray-800'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalProducto(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleEstado(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.estado === 'activo'
                              ? 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                              : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                          }`}
                          title={p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {p.estado === 'activo' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalProducto !== undefined && (
        <ModalProducto
          producto={modalProducto}
          onGuardar={() => { setModalProducto(undefined); cargar() }}
          onCerrar={() => setModalProducto(undefined)}
        />
      )}
    </div>
  )
}
