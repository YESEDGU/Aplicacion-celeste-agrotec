import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Users, CheckCircle2 } from "lucide-react";

// CAC-008: Trabaja con nosotros
const benefits = [
  "Margen de ganancia competitivo en productos avícolas",
  "Soporte logístico y capacitación constante",
  "Zona de venta exclusiva asignada",
  "Acceso a la plataforma de seguimiento de pedidos",
];

const WorkWithUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Trabaja con Nosotros</h1>
        <p className="text-muted-foreground mb-10">
          <span className="text-xs text-muted-foreground/60">CAC-008</span> · Únete como aliado comercial
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: Briefcase, title: "Modelo de Negocio", desc: "Conviértete en distribuidor autorizado de nuestros productos avícolas en tu zona." },
            { icon: TrendingUp, title: "Rentabilidad", desc: "Productos con alta rotación y márgenes atractivos para tu negocio." },
            { icon: Users, title: "Comunidad", desc: "Forma parte de una red de aliados comerciales en todo el país." },
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
            <Button className="w-full celeste-gradient font-semibold h-12 text-lg">
              Quiero ser distribuidor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkWithUs;
