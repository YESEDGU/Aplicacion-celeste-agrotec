import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

// CAC-001 Escenario 3: Registrar cliente nuevo
const CreateAccount = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    usuario: "",
    correo: "",
    telefono: "",
    direccion: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!form.usuario || !form.correo || !form.telefono || !form.direccion || !form.contrasena) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }

    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Si el usuario es "admin" → ya registrado
      if (form.usuario === "admin") {
        setError("No es posible añadirlo a la base de datos, ya que este usuario está registrado.");
        return;
      }

      setSuccess("¡Cuenta creada exitosamente! Serás redirigido al inicio de sesión...");
      setTimeout(() => navigate("/"), 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 celeste-gradient-subtle">
      <Card className="w-full max-w-lg shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Crear Cuenta
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-muted-foreground/60 text-xs">CAC-001 · Esc. 3</span> · Regístrate para empezar a comprar
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input id="usuario" placeholder="Ej: Oscar123" value={form.usuario} onChange={(e) => updateField("usuario", e.target.value)} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" placeholder="tucorreo@ejemplo.com" value={form.correo} onChange={(e) => updateField("correo", e.target.value)} className="h-11" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" placeholder="300 123 4567" value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Cra 10 #20-30" value={form.direccion} onChange={(e) => updateField("direccion", e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Input id="contrasena" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.contrasena} onChange={(e) => updateField("contrasena", e.target.value)} className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar contraseña</Label>
              <Input id="confirmar" type="password" placeholder="Repite tu contraseña" value={form.confirmarContrasena} onChange={(e) => updateField("confirmarContrasena", e.target.value)} className="h-11" />
            </div>

            <Button type="submit" className="w-full h-11 celeste-gradient font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
            <p>Prueba con usuario <code className="bg-background px-1 rounded">admin</code> para ver el error de usuario ya registrado.</p>
          </div>

          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-secondary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Ya tengo cuenta, iniciar sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAccount;
