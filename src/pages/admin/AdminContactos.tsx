// ============================================================
//  CELESTE AGROTEC — Admin: Mensajes de Contacto
//  Archivo: src/pages/admin/AdminContactos.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Loader2, Mail, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Contacto {
  id: number
  nombre: string
  correo: string
  asunto: string
  mensaje: string
  leido: boolean
  fecha_crea: string
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function TarjetaContacto({ contacto, onMarcarLeido }: {
  contacto: Contacto
  onMarcarLeido: (id: number) => void
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
      contacto.leido ? 'border-gray-100' : 'border-green-200'
    }`}>
      <div
        className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setAbierto(!abierto)}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          contacto.leido ? 'bg-gray-100' : 'bg-green-100'
        }`}>
          <Mail className={`w-4 h-4 ${contacto.leido ? 'text-gray-400' : 'text-green-600'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 text-sm">{contacto.nombre}</p>
            {!contacto.leido && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Nuevo</span>
            )}
          </div>
          <p className="text-xs text-gray-400">{contacto.correo} · {formatFecha(contacto.fecha_crea)}</p>
          <p className="text-sm text-gray-600 mt-1 font-medium truncate">{contacto.asunto}</p>
        </div>

        <button className="p-1 flex-shrink-0">
          {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {abierto && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contacto.mensaje}</p>
          <div className="flex items-center gap-3">
            <a
              href={`mailto:${contacto.correo}?subject=Re: ${contacto.asunto}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Responder por correo →
            </a>
            {!contacto.leido && (
              <button
                onClick={() => onMarcarLeido(contacto.id)}
                className="flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Marcar como leído
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminContactos() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'nuevos' | 'leidos'>('todos')

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contactos')
      .select('*')
      .order('fecha_crea', { ascending: false })
    setContactos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const marcarLeido = async (id: number) => {
    await supabase.from('contactos').update({ leido: true }).eq('id', id)
    cargar()
  }

  const filtrados = contactos.filter(c => {
    if (filtro === 'nuevos') return !c.leido
    if (filtro === 'leidos') return c.leido
    return true
  })

  const noLeidos = contactos.filter(c => !c.leido).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" /> Mensajes de Contacto
          {noLeidos > 0 && (
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{noLeidos}</span>
          )}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{contactos.length} mensajes en total</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['todos', 'nuevos', 'leidos'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filtro === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'nuevos' ? 'Nuevos' : 'Leídos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-green-500" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Mail className="w-10 h-10 opacity-30" />
          <p className="text-sm">No hay mensajes {filtro !== 'todos' ? `"${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(c => (
            <TarjetaContacto key={c.id} contacto={c} onMarcarLeido={marcarLeido} />
          ))}
        </div>
      )}
    </div>
  )
}
