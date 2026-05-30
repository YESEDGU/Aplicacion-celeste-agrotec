// ============================================================
//  CELESTE AGROTEC — Admin: Auditoría
//  Archivo: src/pages/admin/AdminAuditoria.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, Shield, Search, ChevronDown, ChevronUp, FileDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RegistroAuditoria {
  id: number
  responsable: string
  id_usuario: string | null
  accion: string
  tabla_afectada: string
  id_registro: number | null
  valor_anterior: Record<string, unknown> | null
  valor_nuevo: Record<string, unknown> | null
  fecha_modificacion: string
  perfiles?: { usuario: string; id_rol: number } | null
}

const ACCIONES = ['todos', 'crear', 'modificar', 'eliminar', 'cambiar_estado', 'login', 'pago']
const TABLAS = ['todos', 'pedidos', 'productos', 'perfiles', 'envios', 'pagos', 'distribuidores', 'solicitudes_distribuidor', 'contactos']

const ROL_LABEL: Record<number, string> = {
  1: 'Administrador',
  2: 'Cliente',
  3: 'Distribuidor',
}

const ACCION_COLOR: Record<string, string> = {
  crear:          'bg-green-100 text-green-700',
  modificar:      'bg-blue-100 text-blue-700',
  eliminar:       'bg-red-100 text-red-600',
  cambiar_estado: 'bg-amber-100 text-amber-700',
  login:          'bg-purple-100 text-purple-700',
  pago:           'bg-cyan-100 text-cyan-700',
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function BadgeAccion({ accion }: { accion: string }) {
  const color = ACCION_COLOR[accion] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${color}`}>
      {accion.replace('_', ' ')}
    </span>
  )
}

function TarjetaAuditoria({ registro }: { registro: RegistroAuditoria }) {
  const [abierto, setAbierto] = useState(false)
  const tieneDetalle = registro.valor_anterior || registro.valor_nuevo

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className={`p-4 flex items-start gap-3 ${tieneDetalle ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
        onClick={() => tieneDetalle && setAbierto(!abierto)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <BadgeAccion accion={registro.accion} />
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {registro.tabla_afectada}
              {registro.id_registro ? ` #${registro.id_registro}` : ''}
            </span>
            {registro.perfiles && (
              <span className="text-xs text-gray-500">
                {ROL_LABEL[registro.perfiles.id_rol] ?? 'Usuario'}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 mt-1">{registro.responsable}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatFecha(registro.fecha_modificacion)}</p>
        </div>
        {tieneDetalle && (
          <button className="p-1 flex-shrink-0">
            {abierto
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>
        )}
      </div>

      {abierto && tieneDetalle && (
        <div className="border-t border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {registro.valor_anterior && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Valor anterior</p>
              <pre className="text-xs bg-red-50 text-red-800 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(registro.valor_anterior, null, 2)}
              </pre>
            </div>
          )}
          {registro.valor_nuevo && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Valor nuevo</p>
              <pre className="text-xs bg-green-50 text-green-800 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(registro.valor_nuevo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminAuditoria() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('todos')
  const [filtroTabla, setFiltroTabla] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('auditoria')
      .select('*, perfiles(usuario, id_rol)')
      .order('fecha_modificacion', { ascending: false })
      .limit(500)
    setRegistros(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = registros.filter(r => {
    const coincideBusqueda =
      busqueda === '' ||
      r.responsable.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.tabla_afectada.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.accion.toLowerCase().includes(busqueda.toLowerCase())

    const coincideAccion = filtroAccion === 'todos' || r.accion === filtroAccion
    const coincideTabla = filtroTabla === 'todos' || r.tabla_afectada === filtroTabla

    const fecha = new Date(r.fecha_modificacion)
    const coincideFechaDesde = !fechaDesde || fecha >= new Date(fechaDesde)
    const coincideFechaHasta = !fechaHasta || fecha <= new Date(fechaHasta + 'T23:59:59')

    return coincideBusqueda && coincideAccion && coincideTabla && coincideFechaDesde && coincideFechaHasta
  })

  const exportarCSV = () => {
    const headers = ['ID', 'Responsable', 'Accion', 'Tabla', 'ID Registro', 'Fecha']
    const rows = filtrados.map(r => [
      r.id,
      r.responsable,
      r.accion,
      r.tabla_afectada,
      r.id_registro ?? '',
      formatFecha(r.fecha_modificacion),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" /> Auditoría
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtrados.length} registros</p>
        </div>
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <FileDown className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por responsable, tabla o acción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro acción */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Acción</label>
            <select
              value={filtroAccion}
              onChange={e => setFiltroAccion(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {ACCIONES.map(a => (
                <option key={a} value={a}>{a === 'todos' ? 'Todas las acciones' : a.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Filtro tabla */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Módulo</label>
            <select
              value={filtroTabla}
              onChange={e => setFiltroTabla(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {TABLAS.map(t => (
                <option key={t} value={t}>{t === 'todos' ? 'Todos los módulos' : t}</option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {(busqueda || filtroAccion !== 'todos' || filtroTabla !== 'todos' || fechaDesde || fechaHasta) && (
          <button
            onClick={() => { setBusqueda(''); setFiltroAccion('todos'); setFiltroTabla('todos'); setFechaDesde(''); setFechaHasta('') }}
            className="text-xs text-green-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Shield className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay registros de auditoría</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(r => (
            <TarjetaAuditoria key={r.id} registro={r} />
          ))}
        </div>
      )}
    </div>
  )
}
