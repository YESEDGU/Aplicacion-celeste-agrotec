import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, X, Filter, Plus, Minus, ShoppingCart, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productEggs from "@/assets/product-eggs.jpg";
import productChicken from "@/assets/product-chicken.jpg";
import productFeed from "@/assets/product-feed.jpg";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const allProducts: Product[] = [
  { id: 1, name: "Huevos de Gallina AA", category: "Huevos", price: 15000, unit: "canasta x30", image: productEggs },
  { id: 2, name: "Huevos de Gallina A", category: "Huevos", price: 12000, unit: "canasta x30", image: productEggs },
  { id: 3, name: "Pechuga de Pollo", category: "Pollo", price: 9800, unit: "kg", image: productChicken },
  { id: 4, name: "Muslo de Pollo", category: "Pollo", price: 7500, unit: "kg", image: productChicken },
  { id: 5, name: "Concentrado Avícola", category: "Concentrados", price: 85000, unit: "bulto 40kg", image: productFeed },
  { id: 6, name: "Suplemento Mineral", category: "Concentrados", price: 45000, unit: "bulto 25kg", image: productFeed },
];

const categories = ["Todos", "Huevos", "Pollo", "Concentrados"];

// CAC-003: Gestión de productos
const Products = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addDialog, setAddDialog] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [quantity, setQuantity] = useState(1);

  // CAC-003 Esc. 1: Refrescar
  const handleRefresh = () => {
    setSearch("");
    setSelectedCategory("Todos");
    toast({ title: "Productos actualizados", description: "Se han cargado los productos más recientes." });
  };

  // Filtro y búsqueda
  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // CAC-003 Esc. 4: Agregar al carrito
  const handleAddToCart = () => {
    if (!addDialog.product) return;
    const existing = cart.find((c) => c.id === addDialog.product!.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === addDialog.product!.id ? { ...c, quantity: c.quantity + quantity } : c)));
    } else {
      setCart([...cart, { ...addDialog.product, quantity }]);
    }
    toast({ title: "Producto añadido", description: `${addDialog.product.name} x${quantity} añadido al carrito.` });
    setAddDialog({ open: false });
    setQuantity(1);
  };

  const removeFromCart = (id: number) => setCart(cart.filter((c) => c.id !== id));
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground text-sm">
              <span className="text-muted-foreground/60 text-xs">CAC-003</span> · Catálogo de productos disponibles
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refrescar (CAC-003 Esc.1)">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* CAC-003 Esc. 2 & 3: Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer ${selectedCategory === cat ? "celeste-gradient text-primary-foreground" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Productos o mensaje vacío */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No hay ningún producto que coincida con tu búsqueda</p>
            <p className="text-sm mt-1">Intenta con otro término o cambia el filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border">
                <div className="aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  <h3 className="font-heading font-semibold text-foreground">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">${product.price.toLocaleString("es-CO")}</span>
                      <span className="text-muted-foreground text-xs ml-1">/ {product.unit}</span>
                    </div>
                    <Button
                      size="icon"
                      className="celeste-gradient rounded-full"
                      onClick={() => setAddDialog({ open: true, product })}
                      title="Agregar al carrito (CAC-003 Esc.4)"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CAC-003 Esc. 4: Popup agregar cantidad */}
      <Dialog open={addDialog.open} onOpenChange={(open) => { setAddDialog({ open }); setQuantity(1); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Agregar al carrito</DialogTitle>
          </DialogHeader>
          {addDialog.product && (
            <div className="space-y-4">
              <p className="text-foreground font-medium">{addDialog.product.name}</p>
              <p className="text-muted-foreground text-sm">Precio: ${addDialog.product.price.toLocaleString("es-CO")} / {addDialog.product.unit}</p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="font-semibold text-primary">Total: ${(addDialog.product.price * quantity).toLocaleString("es-CO")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog({ open: false })}>Cancelar</Button>
            <Button className="celeste-gradient" onClick={handleAddToCart}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CAC-003 Esc. 5: Carrito flotante */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-6 right-6 celeste-gradient rounded-full h-14 w-14 shadow-lg" size="icon">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="font-heading">
              Mi Carrito
              <span className="text-muted-foreground text-xs ml-2">CAC-003 Esc.5</span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">Tu carrito está vacío</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toLocaleString("es-CO")} × {item.quantity} = <span className="text-primary font-semibold">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">${cartTotal.toLocaleString("es-CO")}</span>
              </div>
              <Button className="w-full celeste-gradient font-semibold h-12">
                Proceder al Pago
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Products;
