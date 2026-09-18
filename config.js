/* =========================================================
   Configuración de Órdago
   ---------------------------------------------------------
   Rellena estos dos valores con los de tu proyecto de Supabase.
   Los encuentras en:  Project Settings → API

   · supabaseUrl : la "Project URL"
   · supabaseKey : la clave "anon public" (NO la de service_role)

   Si los dejas vacíos, el juego funciona igual pero cada
   persona solo verá sus propias marcas: no hay grupo compartido.

   La clave anon es pública por diseño y puede ir en el repositorio:
   está pensada para vivir en el navegador. Lo que protege los datos
   son las políticas de la base de datos (ver schema.sql).
   La clave service_role NUNCA debe aparecer aquí.
   ========================================================= */
window.DUELO_CONFIG = {
  supabaseUrl: "",
  supabaseKey: "",

  // nombre de la tabla creada por schema.sql
  tabla: "documentos",

  // cada cuánto se refrescan las clasificaciones, en milisegundos
  refrescoMs: 6000
};
