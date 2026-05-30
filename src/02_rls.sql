-- ============================================================
--  CELESTE AGROTEC — Row Level Security (RLS)
--  Controla qué puede ver/hacer cada rol
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria                ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribuidores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_distribuidor ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIÓN HELPER: obtener rol del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS INT
LANGUAGE sql STABLE
AS $$
  SELECT id_rol FROM perfiles WHERE id = auth.uid();
$$;

-- ============================================================
-- POLÍTICAS: perfiles
-- ============================================================
-- Cualquier usuario autenticado puede ver su propio perfil
CREATE POLICY "perfil_propio_select" ON perfiles
    FOR SELECT USING (auth.uid() = id);

-- Admin puede ver todos los perfiles
CREATE POLICY "admin_perfiles_select" ON perfiles
    FOR SELECT USING (get_my_rol() = 1);

-- Admin puede actualizar cualquier perfil
CREATE POLICY "admin_perfiles_update" ON perfiles
    FOR UPDATE USING (get_my_rol() = 1);

-- Admin puede borrar perfiles (excepto el suyo, controlado en app)
CREATE POLICY "admin_perfiles_delete" ON perfiles
    FOR DELETE USING (get_my_rol() = 1 AND id != auth.uid());

-- El sistema puede insertar perfil al registrarse
CREATE POLICY "perfil_insert_propio" ON perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuario puede actualizar su propio perfil
CREATE POLICY "perfil_update_propio" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- POLÍTICAS: productos
-- ============================================================
-- Todos los usuarios autenticados pueden ver productos activos
CREATE POLICY "productos_ver_activos" ON productos
    FOR SELECT USING (auth.role() = 'authenticated' AND estado = 'activo');

-- Admin puede ver todos (activos e inactivos)
CREATE POLICY "admin_productos_select_todos" ON productos
    FOR SELECT USING (get_my_rol() = 1);

-- Admin puede insertar, actualizar, eliminar
CREATE POLICY "admin_productos_insert" ON productos
    FOR INSERT WITH CHECK (get_my_rol() = 1);

CREATE POLICY "admin_productos_update" ON productos
    FOR UPDATE USING (get_my_rol() = 1);

CREATE POLICY "admin_productos_delete" ON productos
    FOR DELETE USING (get_my_rol() = 1);

-- ============================================================
-- POLÍTICAS: pedidos
-- ============================================================
-- Cliente puede ver sus propios pedidos
CREATE POLICY "pedidos_propios_select" ON pedidos
    FOR SELECT USING (id_usuario = auth.uid());

-- Cliente puede crear pedidos
CREATE POLICY "pedidos_insert_propio" ON pedidos
    FOR INSERT WITH CHECK (id_usuario = auth.uid());

-- Admin puede ver todos los pedidos
CREATE POLICY "admin_pedidos_select" ON pedidos
    FOR SELECT USING (get_my_rol() = 1);

-- Admin puede actualizar estado de pedidos
CREATE POLICY "admin_pedidos_update" ON pedidos
    FOR UPDATE USING (get_my_rol() = 1);

-- ============================================================
-- POLÍTICAS: pedido_items
-- ============================================================
CREATE POLICY "items_propios_select" ON pedido_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.id_pedido AND pedidos.id_usuario = auth.uid())
    );

CREATE POLICY "items_insert_propio" ON pedido_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.id_pedido AND pedidos.id_usuario = auth.uid())
    );

CREATE POLICY "admin_items_select" ON pedido_items
    FOR SELECT USING (get_my_rol() = 1);

-- ============================================================
-- POLÍTICAS: envios
-- ============================================================
-- Cliente ve sus propios envíos
CREATE POLICY "envios_propios_select" ON envios
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = envios.id_pedido AND pedidos.id_usuario = auth.uid())
    );

-- Distribuidor ve sus envíos asignados
CREATE POLICY "distribuidor_envios_select" ON envios
    FOR SELECT USING (
        get_my_rol() = 3 AND
        EXISTS (SELECT 1 FROM distribuidores WHERE distribuidores.id = envios.id_distribuidor AND distribuidores.id_usuario = auth.uid())
    );

-- Distribuidor puede actualizar estado de sus envíos
CREATE POLICY "distribuidor_envios_update" ON envios
    FOR UPDATE USING (
        get_my_rol() = 3 AND
        EXISTS (SELECT 1 FROM distribuidores WHERE distribuidores.id = envios.id_distribuidor AND distribuidores.id_usuario = auth.uid())
    );

-- Admin puede ver y gestionar todos los envíos
CREATE POLICY "admin_envios_all" ON envios
    FOR ALL USING (get_my_rol() = 1);

-- ============================================================
-- POLÍTICAS: pagos
-- ============================================================
CREATE POLICY "pagos_propios_select" ON pagos
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pagos.id_pedido AND pedidos.id_usuario = auth.uid())
    );

CREATE POLICY "admin_pagos_all" ON pagos
    FOR ALL USING (get_my_rol() = 1);

-- ============================================================
-- POLÍTICAS: auditoria
-- ============================================================
CREATE POLICY "admin_auditoria_select" ON auditoria
    FOR SELECT USING (get_my_rol() = 1);

CREATE POLICY "auditoria_insert_authenticated" ON auditoria
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- POLÍTICAS: distribuidores
-- ============================================================
CREATE POLICY "admin_distribuidores_all" ON distribuidores
    FOR ALL USING (get_my_rol() = 1);

CREATE POLICY "distribuidor_ver_propio" ON distribuidores
    FOR SELECT USING (id_usuario = auth.uid());

-- ============================================================
-- POLÍTICAS: solicitudes_distribuidor
-- ============================================================
-- Cualquiera puede insertar (formulario público)
CREATE POLICY "solicitud_insert_publico" ON solicitudes_distribuidor
    FOR INSERT WITH CHECK (TRUE);

-- Admin puede ver y gestionar todas
CREATE POLICY "admin_solicitudes_all" ON solicitudes_distribuidor
    FOR ALL USING (get_my_rol() = 1);

