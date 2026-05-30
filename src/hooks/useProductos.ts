// ============================================================
//  CELESTE AGROTEC — Hook para productos
//  Archivo: src/hooks/useProductos.ts
// ============================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Producto } from '@/types/database';

interface UseProductosResult {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductos(soloActivos = true): UseProductosResult {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('productos')
      .select('*')
      .order('categoria', { ascending: true })
      .order('nombre', { ascending: true });

    if (soloActivos) {
      query = query.eq('estado', 'activo');
    }

    const { data, error: err } = await query;

    if (err) {
      setError('No se pudieron cargar los productos. Intenta de nuevo.');
      console.error('Error cargando productos:', err);
    } else {
      setProductos(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, [soloActivos]);

  return { productos, loading, error, refetch: fetchProductos };
}
