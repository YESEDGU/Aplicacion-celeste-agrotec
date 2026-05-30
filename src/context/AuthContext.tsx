import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Perfil {
  id: string
  usuario: string
  correo: string
  telefono: string | null
  direccion: string | null
  id_rol: number
  activo: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  perfil: Perfil | null
  loading: boolean
  rolNombre: string
  isAdmin: boolean
  isDistribuidor: boolean
  isCliente: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchPerfil(userId: string) {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setPerfil(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchPerfil(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchPerfil(session.user.id)
      else setPerfil(null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setPerfil(null)
  }

  const rolNombre =
    perfil?.id_rol === 1 ? 'Administrador' :
    perfil?.id_rol === 3 ? 'Distribuidor' : 'Cliente'

  return (
    <AuthContext.Provider value={{
      user, session, perfil, loading, rolNombre,
      isAdmin: perfil?.id_rol === 1,
      isDistribuidor: perfil?.id_rol === 3,
      isCliente: perfil?.id_rol === 2,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
