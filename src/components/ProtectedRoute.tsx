import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

interface Props {
  children: React.ReactNode
  rolesPermitidos?: number[]  // 1=Admin, 2=Cliente, 3=Distribuidor
}

export default function ProtectedRoute({ children, rolesPermitidos }: Props) {
  const { user, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  if (rolesPermitidos && perfil && !rolesPermitidos.includes(perfil.id_rol)) {
    return <Navigate to="/inicio" replace />
  }

  return <>{children}</>
}
