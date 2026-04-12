import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import heroFarm from "@/assets/hero-farm.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // CAC-001: Escenario 1 - Validación de usuarios
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    // Simulación de validación contra BD
    setTimeout(() => {
      setLoading(false);

      // Demo: credenciales correctas = admin/admin123
      if (usuario === "admin" && contrasena === "admin123") {
        navigate("/inicio");
        return;
      }

      if (usuario === "distribuidor" && contrasena === "dist123") {
        navigate("/inicio");
        return;
      }

      // CAC-001: Si el usuario no existe o credenciales incorrectas
      setError("Las credenciales ingresadas son incorrectas.");
    }, 1200);
  };

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
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Iniciar Sesión
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Ingresa tus credenciales para acceder
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mensaje de error - CAC-001: Credenciales incorrectas */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  placeholder="Ej: Oscar123"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contrasena"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="h-11 pr-10"
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>

            {/* CAC-001 Escenario 2 */}
            <div className="text-center">
              <Link
                to="/olvide-contrasena"
                className="text-sm text-secondary hover:text-secondary/80 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            {/* CAC-001 Escenario 3 */}
            <Link to="/crear-cuenta" className="block">
              <Button variant="outline" className="w-full h-11">
                Crear Cuenta
              </Button>
            </Link>

            {/* Demo credentials hint */}
            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Demo — Credenciales de prueba:</p>
              <p>Admin: <code className="bg-background px-1 rounded">admin / admin123</code></p>
              <p>Distribuidor: <code className="bg-background px-1 rounded">distribuidor / dist123</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
