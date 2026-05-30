import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2, Mail } from 'lucide-react'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabase'

const ForgotPassword = () => {
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!correo.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('El formato del correo electrónico no es válido.')
      return
    }

    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      correo.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )

    setLoading(false)

    if (resetError) {
      setError('Los datos ingresados son incorrectos o el correo no existe.')
      return
    }

    setSuccess('Hemos enviado un correo a esa dirección con el enlace para restablecer tu contraseña.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 celeste-gradient-subtle">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center"><Logo /></div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
            <p className="text-muted-foreground text-sm mt-1">Te enviaremos un enlace a tu correo</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-success/30 bg-success/10 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">{success}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="correo"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 celeste-gradient font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar enlace'}
              </Button>
            </form>
          )}

          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-secondary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
