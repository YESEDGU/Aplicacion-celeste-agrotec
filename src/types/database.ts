// ============================================================
//  CELESTE AGROTEC — Tipos TypeScript del esquema Supabase
//  Archivo: src/types/database.ts
// ============================================================

export interface Rol {
  id: number;
  descripcion: string;
  fecha_crea: string;
}

export interface Perfil {
  id: string;
  usuario: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  id_rol: number;
  activo: boolean;
  fecha_crea: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  imagen_url?: string;
  estado: 'activo' | 'inactivo';
  fecha_crea: string;
  fecha_actualiza: string;
}

export interface Pedido {
  id: number;
  id_usuario: string;
  estado: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';
  valor_total: number;
  metodo_pago?: 'efectivo' | 'pse' | 'nequi' | 'daviplata';
  referencia_pago?: string;
  f_estimada_entrega?: string;
  notas?: string;
  fecha_crea: string;
  fecha_actualiza: string;
}

export interface PedidoItem {
  id: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

export interface Envio {
  id: number;
  id_pedido: number;
  id_distribuidor?: number;
  direccion?: string;
  telefono?: string;
  estado: 'preparando' | 'en_camino' | 'entregado' | 'fallido';
  fecha_envio?: string;
  fecha_entrega?: string;
  notas?: string;
  fecha_crea: string;
}

export interface Pago {
  id: number;
  id_pedido: number;
  metodo: 'efectivo' | 'pse' | 'nequi' | 'daviplata';
  valor: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  id_transaccion?: string;
  banco?: string;
  fecha_pago?: string;
  fecha_crea: string;
}

export interface Distribuidor {
  id: number;
  cedula: string;
  nombre: string;
  placa_vehiculo?: string;
  id_usuario?: string;
  activo: boolean;
  fecha_crea: string;
}

export interface SolicitudDistribuidor {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  ciudad?: string;
  mensaje?: string;
  estado: 'pendiente' | 'revisando' | 'aprobada' | 'rechazada';
  fecha_crea: string;
}

export interface Auditoria {
  id: number;
  responsable: string;
  id_usuario?: string;
  accion: string;
  tabla_afectada: string;
  id_registro?: number;
  valor_anterior?: Record<string, unknown>;
  valor_nuevo?: Record<string, unknown>;
  fecha_modificacion: string;
}

// Tipo para el carrito (solo en frontend, no en BD)
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}
