-- ============================================================
--  CELESTE AGROTEC — Trigger: crear perfil al registrarse
--  Cuando Supabase Auth crea un usuario, se crea su perfil
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, usuario, correo, id_rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'usuario', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'id_rol')::INT, 2)  -- default: Cliente
  );
  RETURN NEW;
END;
$$;

-- Ejecutar al crear usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

