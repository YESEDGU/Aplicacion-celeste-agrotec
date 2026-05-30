// ============================================================
//  CELESTE AGROTEC — Trabaja con Nosotros (CAC-008)
//  Archivo: src/pages/WorkWithUs.tsx
// ============================================================

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, TrendingUp, Users, CheckCircle2, Loader2, AlertCircle, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const benefits = [
  'Margen de ganancia competitivo en productos avícolas',
  'Soporte logístico y capacitación constante',
  'Zona de venta exclusiva asignada',
  'Acceso a la plataforma de seguimiento de pedidos',
]

const WorkWithUs = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', ciudad: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exitoso, setExitoso] = useState(false)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim() || !form.correo.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      setError('El formato del correo no es válido.')
      return
    }

    setEnviando(true)

    const { error: err } = await supabase.from('solicitudes_distribuidor').insert({
      nombre: form.nombre.trim(),
      correo: form.correo.trim().toLowerCase(),
      telefono: form.telefono.trim() || null,
      ciudad: form.ciudad.trim() || null,
      mensaje: form.mensaje.trim() || null,
      estado: 'pendiente',
    })

    setEnviando(false)

    if (err) {
      setError('No se pudo enviar la solicitud. Intenta de nuevo.')
      return
    }

    setExitoso(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Trabaja con Nosotros</h1>
        <p className="text-muted-foreground mb-10">
          <span className="text-xs text-muted-foreground/60">CAC-008</span> · Únete como aliado comercial
        </p>

        {/* Cards de beneficios */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: Briefcase, title: 'Modelo de Negocio', desc: 'Conviértete en distribuidor autorizado de nuestros productos avícolas en tu zona.' },
            { icon: TrendingUp, title: 'Rentabilidad', desc: 'Productos con alta rotación y márgenes atractivos para tu negocio.' },
            { icon: Users, title: 'Comunidad', desc: 'Forma parte de una red de aliados comerciales en todo el país.' },
          ].map((item) => (
            <Card key={item.title} className="border-border text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full celeste-gradient flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beneficios + formulario */}
        <Card className="border-border max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Beneficios de ser aliado</h2>
            <ul className="space-y-3 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>

            {!mostrarFormulario && !exitoso && (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="w-full celeste-gradient font-semibold h-12 text-lg rounded-lg text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Quiero ser distribuidor
              </button>
            )}

            {/* Formulario */}
            {mostrarFormulario && !exitoso && (
              <form onSubmit={handleEnviar} className="space-y-4 border-t pt-6 mt-2">
                <h3 className="font-semibold text-gray-800 text-lg">Envía tu solicitud</h3>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                    <input
                      value={form.nombre}
                      onChange={e => set('nombre', e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                    <input
                      type="email"
                      value={form.correo}
                      onChange={e => set('correo', e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      value={form.telefono}
                      onChange={e => set('telefono', e.target.value)}
                      placeholder="300 123 4567"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input
                      value={form.ciudad}
                      onChange={e => set('ciudad', e.target.value)}
                      placeholder="Bucaramanga"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje (opcional)</label>
                  <textarea
                    value={form.mensaje}
                    onChange={e => set('mensaje', e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia o zona de interés..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 py-2.5 rounded-lg celeste-gradient text-primary-foreground text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  >
                    {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {enviando ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            )}

            {/* Éxito */}
            {exitoso && (
              <div className="border-t pt-6 mt-2 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">¡Solicitud enviada!</h3>
                <p className="text-sm text-gray-500">Recibimos tu información. Pronto nos pondremos en contacto contigo.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkWithUs
