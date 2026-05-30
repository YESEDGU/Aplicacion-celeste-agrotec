// ============================================================
//  CELESTE AGROTEC — Perfil de Usuario
//  Archivo: src/pages/Perfil.tsx
// ============================================================

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, MapPin, Lock, CheckCircle2, AlertCircle, Loader2, Pencil, X } from 'lucide-react'

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const ROLES: Record<number, { label: string; color: string }> = {
  1: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  2: { label: 'Cliente',       color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Distribuidor',  color: 'bg-amber-100 text-amber-700' },
}

export default function Perfil() {
  const { perfil } = useAuth()

  // ── Editar datos de contacto ──────────────────────────────
  const [editando, setEditando] = useState(false)
  const [telefono, setTelefono] = useState(perfil?.telefono ?? '')
  const [direccion, setDireccion] = useState(perfil?.direccion ?? '')
  const [guardando, setGuardando] = useState(false)
  const [exitoDatos, setExitoDatos] = useState(false)
  const [errorDatos, setErrorDatos] = useState<string | null>(null)

  // ── Cambiar contraseña ────────────────────────────────────
  const [nuevaPass, setNuevaPass] = useState('')
  const [confirmarPass, setConfirmarPass] = useState('')
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [exitoPass, setExitoPass] = useState(false)
  const [errorPass, setErrorPass] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleGuardarDatos = async () => {
    setGuardando(true)
    setErrorDatos(null)
    setExitoDatos(false)

    const { error } = await supabase
      .from('perfiles')
      .update({
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
      })
      .eq('id', perfil!.id)

    setGuardando(false)

    if (error) {
      setErrorDatos('No se pudieron guardar los cambios. Intenta de nuevo.')
      return
    }

    setExitoDatos(true)
    setEditando(false)
    setTimeout(() => setExitoDatos(false), 3000)
  }

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorPass(null)
    setExitoPass(false)

    if (nuevaPass.length < 6) {
      setErrorPass('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (nuevaPass !== confirmarPass) {
      setErrorPass('Las contraseñas no coinciden.')
      return
    }

    setGuardandoPass(true)

    const { error } = await supabase.auth.updateUser({ password: nuevaPass })

    setGuardandoPass(false)

    if (error) {
      setErrorPass('No se pudo actualizar la contraseña. Intenta de nuevo.')
      return
    }

    setExitoPass(true)
    setNuevaPass('')
    setConfirmarPass('')
    setTimeout(() => setExitoPass(false), 3000)
  }

  const rol = ROLES[perfil?.id_rol ?? 2]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Información de tu cuenta</p>
        </div>

        {/* ── Datos de la cuenta ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Datos de la cuenta</h2>
            {!editando ? (
              <button
                onClick={() => { setEditando(true); setExitoDatos(false) }}
                className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
            ) : (
              <button
                onClick={() => { setEditando(false); setErrorDatos(null) }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            {exitoDatos && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Cambios guardados correctamente
              </div>
            )}
            {errorDatos && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorDatos}
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl uppercase flex-shrink-0">
                {perfil?.usuario?.[0] ?? 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{perfil?.usuario}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${rol.color}`}>
                  {rol.label}
                </span>
              </div>
            </div>

            {/* Campos */}
            <div className="space-y-3 pt-2">
              {/* Nombre — solo lectura */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Nombre de usuario</p>
                  <p className="text-sm text-gray-800 mt-0.5">{perfil?.usuario}</p>
                </div>
              </div>

              {/* Correo — solo lectura */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Correo electrónico</p>
                  <p className="text-sm text-gray-800 mt-0.5">{perfil?.correo}</p>
                </div>
              </div>

              {/* Teléfono — editable */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Teléfono</p>
                  {editando ? (
                    <input
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      placeholder="300 123 4567"
                      className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 mt-0.5">{perfil?.telefono ?? <span className="text-gray-400 italic">No registrado</span>}</p>
                  )}
                </div>
              </div>

              {/* Dirección — editable */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dirección</p>
                  {editando ? (
                    <input
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      placeholder="Calle 45 # 12-34, Bucaramanga"
                      className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 mt-0.5">{perfil?.direccion ?? <span className="text-gray-400 italic">No registrada</span>}</p>
                  )}
                </div>
              </div>
            </div>

            {editando && (
              <button
                onClick={handleGuardarDatos}
                disabled={guardando}
                className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Cambiar contraseña</h2>
          </div>

          <form onSubmit={handleCambiarPassword} className="p-5 space-y-4">
            {exitoPass && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Contraseña actualizada correctamente
              </div>
            )}
            {errorPass && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorPass}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={nuevaPass}
                  onChange={e => setNuevaPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmarPass}
                onChange={e => setConfirmarPass(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoPass}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {guardandoPass && <Loader2 className="w-4 h-4 animate-spin" />}
              {guardandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
