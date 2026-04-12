import Navbar from "@/components/Navbar";
import heroFarm from "@/assets/hero-farm.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Truck, Shield, Leaf } from "lucide-react";

// CAC-02: Página de Bienvenida
const features = [
  { icon: Leaf, title: "100% Natural", desc: "Productos avícolas criados de forma sostenible" },
  { icon: Truck, title: "Envío Rápido", desc: "Entregamos directamente a tu puerta" },
  { icon: Shield, title: "Calidad Garantizada", desc: "Certificados de calidad en todos nuestros productos" },
  { icon: Package, title: "Variedad", desc: "Huevos, pollo y más para tu hogar o negocio" },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
        <img src={heroFarm} alt="Granja Celeste Agrotec" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 celeste-gradient opacity-70" />
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-primary-foreground mb-4 drop-shadow-lg">
            Bienvenido a Celeste Agrotec
          </h1>
          <p className="text-primary-foreground/90 text-xl max-w-2xl mx-auto mb-8">
            Productos avícolas frescos, directamente del campo a tu mesa. Calidad, confianza y sostenibilidad.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/productos">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg px-8 shadow-lg">
                Ver Productos
              </Button>
            </Link>
            <Link to="/contactos">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold text-lg px-8">
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto w-14 h-14 rounded-full celeste-gradient flex items-center justify-center mb-4">
                <f.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2026 Celeste Agrotec. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
