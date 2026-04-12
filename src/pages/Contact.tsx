import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Mail, MapPin, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

// CAC-007: Contactos
const Contact = () => {
  const [form, setForm] = useState({ nombre: "", correo: "", asunto: "", mensaje: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre || !form.correo || !form.asunto || !form.mensaje) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      setError("El correo electrónico no tiene un formato válido.");
      return;
    }

    setSuccess("Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.");
    setForm({ nombre: "", correo: "", asunto: "", mensaje: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Contactos</h1>
        <p className="text-muted-foreground mb-10">
          <span className="text-xs text-muted-foreground/60">CAC-007</span> · Comunícate con nosotros
        </p>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: Phone, label: "Teléfono", value: "+57 (1) 234 5678" },
              { icon: MessageCircle, label: "WhatsApp", value: "+57 300 123 4567", link: "https://wa.me/573001234567" },
              { icon: Mail, label: "Correo", value: "contacto@celesteagrotec.com", link: "mailto:contacto@celesteagrotec.com" },
              { icon: MapPin, label: "Ubicación", value: "Km 5 Vía Bogotá-Soacha, Colombia", link: "https://maps.google.com" },
            ].map((item) => (
              <Card key={item.label} className="border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full celeste-gradient flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-secondary underline-offset-4 hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-foreground font-medium">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CAC-007 Esc. 2: Formulario */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-heading text-xl font-semibold text-foreground">Envíanos un mensaje</h2>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-success/30 bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Correo electrónico</Label>
                  <Input value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="tucorreo@ejemplo.com" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Asunto</Label>
                  <Input value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} placeholder="Asunto del mensaje" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} placeholder="Escribe tu mensaje..." rows={4} />
                </div>
                <Button type="submit" className="w-full celeste-gradient font-semibold h-11">Enviar</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
