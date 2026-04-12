import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

// CAC-001 Escenario 2: Olvido de contraseña
const ForgotPassword = () => {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!correo.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simular: si el correo contiene "noexiste" → error
      if (correo.includes("noexiste")) {
        setError("Los datos ingresados son incorrectos.");
      } else {
        setSuccess(`Hemos enviado un correo a ${correo} con el enlace para restablecer tu contraseña.`);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 celeste-gradient-subtle">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Recuperar Contraseña
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ingresa tu correo para recibir un enlace de recuperación
            </p>
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
                <Input
                  id="correo"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 celeste-gradient font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
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
  );
};

export default ForgotPassword;
