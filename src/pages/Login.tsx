import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'
import heroFarm from '@/assets/hero-farm.jpg'
import { supabase } from '@/lib/supabase'

const Login = () => {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: correo.trim().toLowerCase(),
      password: contrasena,
    })

    setLoading(false)

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Las credenciales ingresadas son incorrectas.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo electrónico antes de ingresar.')
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
      }
      return
    }

    navigate('/inicio')
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroFarm} alt="Granja Celeste" className="w-full h-full object-cover" />
        <div className="absolute inset-0 celeste-gradient opacity-60" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <h2 className="font-heading text-4xl font-bold text-primary-foreground mb-4">
            Del campo a tu mesa
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-md">
            Productos avícolas frescos y de la mejor calidad. Conectamos productores con consumidores.
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 celeste-gradient-subtle">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Iniciar Sesión</h1>
              <p className="text-muted-foreground text-sm mt-1">Ingresa tus credenciales para acceder</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contrasena"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 celeste-gradient font-semibold" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</>
                ) : 'Ingresar'}
              </Button>
            </form>

            <div className="text-center">
              <Link to="/olvide-contrasena" className="text-sm text-secondary hover:text-secondary/80 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Link to="/crear-cuenta" className="block">
              <Button variant="outline" className="w-full h-11">Crear Cuenta</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
