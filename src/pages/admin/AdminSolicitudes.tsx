// ============================================================
//  CELESTE AGROTEC — Admin: Solicitudes de Distribuidor
//  Archivo: src/pages/admin/AdminSolicitudes.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, UserPlus, ChevronDown, ChevronUp, Phone, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type EstadoSolicitud = 'pendiente' | 'revisando' | 'aprobada' | 'rechazada'

interface Solicitud {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  ciudad: string | null
  mensaje: string | null
  estado: EstadoSolicitud
  fecha_crea: string
}

const ESTADOS: { value: EstadoSolicitud; label: string; color: string }[] = [
  { value: 'pendiente',  label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'revisando',  label: 'Revisando',  color: 'bg-blue-100 text-blue-700' },
  { value: 'aprobada',   label: 'Aprobada',   color: 'bg-green-100 text-green-700' },
  { value: 'rechazada',  label: 'Rechazada',  color: 'bg-red-100 text-red-600' },
]

function BadgeEstado({ estado }: { estado: EstadoSolicitud }) {
  const e = ESTADOS.find(s => s.value === estado) ?? ESTADOS[0]
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${e.color}`}>{e.label}</span>
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function TarjetaSolicitud({ solicitud, onCambiarEstado }: {
  solicitud: Solicitud
  onCambiarEstado: (id: number, estado: EstadoSolicitud) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [cambiando, setCambiando] = useState(false)

  const handleCambio = async (estado: EstadoSolicitud) => {
    setCambiando(true)
    await onCambiarEstado(solicitud.id, estado)
    setCambiando(false)
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      solicitud.estado === 'pendiente' ? 'border-yellow-200' : 'border-gray-100'
    }`}>
      <div
        className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setAbierto(!abierto)}
      >
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-4 h-4 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 text-sm">{solicitud.nombre}</p>
            <BadgeEstado estado={solicitud.estado} />
          </div>
          <p className="text-xs text-gray-400">{solicitud.correo} · {formatFecha(solicitud.fecha_crea)}</p>
          <div className="flex items-center gap-3 mt-1">
            {solicitud.telefono && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {solicitud.telefono}
              </span>
            )}
            {solicitud.ciudad && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {solicitud.ciudad}
              </span>
            )}
          </div>
        </div>

        <button className="p-1 flex-shrink-0">
          {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {abierto && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {solicitud.mensaje && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mensaje</p>
              <p className="text-sm text-gray-700">{solicitud.mensaje}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
            <div className="flex gap-2 flex-wrap">
              {ESTADOS.map(e => (
                <button
                  key={e.value}
                  onClick={() => handleCambio(e.value)}
                  disabled={cambiando || solicitud.estado === e.value}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                    solicitud.estado === e.value
                      ? e.color + ' ring-2 ring-offset-1 ring-green-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`mailto:${solicitud.correo}?subject=Solicitud de Distribuidor - Celeste Agrotec`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Responder por correo →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoSolicitud | 'todos'>('todos')

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes_distribuidor')
      .select('*')
      .order('fecha_crea', { ascending: false })
    setSolicitudes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: number, estado: EstadoSolicitud) => {
    await supabase.from('solicitudes_distribuidor').update({ estado }).eq('id', id)
    cargar()
  }

  const filtradas = filtro === 'todos'
    ? solicitudes
    : solicitudes.filter(s => s.estado === filtro)

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-600" /> Solicitudes de Distribuidor
          {pendientes > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendientes}</span>
          )}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{solicitudes.length} solicitudes en total</p>
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
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <UserPlus className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay solicitudes{filtro !== 'todos' ? ` "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(s => (
            <TarjetaSolicitud key={s.id} solicitud={s} onCambiarEstado={cambiarEstado} />
          ))}
        </div>
      )}
    </div>
  )
}
