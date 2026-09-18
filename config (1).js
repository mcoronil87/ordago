/* =========================================================
   Configuración de Órdago
   ---------------------------------------------------------
   Rellena estos dos valores con los de tu proyecto de Supabase.
   Los encuentras en:  Settings → API Keys

   · supabaseUrl : la "Project URL" (Settings → Data API)
   · supabaseKey : la clave PUBLICABLE, empieza por sb_publishable_
                   (en proyectos antiguos se llama "anon public")

   NUNCA pongas aquí la clave secreta (sb_secret_ o service_role):
   esa salta todas las protecciones de la base de datos.

   La clave publicable está pensada para vivir en el navegador y
   puede ir en el repositorio sin problema. Lo que protege los datos
   son las políticas de la base de datos (ver schema.sql).

   Si dejas los valores vacíos, el juego funciona igual pero cada
   persona solo verá sus propias marcas: no hay cuadrilla compartida.
   ========================================================= */
window.DUELO_CONFIG = {
  supabaseUrl: "https://ywcmrkapvjvebhyllgai.supabase.co",
  supabaseKey: "sb_publishable_6ASbzgBXY0mZUrJV9AjmbA_ZDlJZ1Au",

  // nombre de la tabla creada por schema.sql
  tabla: "documentos",

  // cada cuánto se refrescan las clasificaciones, en milisegundos
  refrescoMs: 6000
};
