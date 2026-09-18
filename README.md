# Órdago

**Seis retos al día. Un intento.**

Seis retos diarios para picarse con los amigos. Cada día se genera un tablero
nuevo, idéntico para todo el grupo, y cada uno lo juega cuando puede. No es en
tiempo real: juegas, dejas tu marca y compruebas por la tarde si alguien te ha
adelantado.

**Los seis juegos**

| Juego | En qué consiste |
|---|---|
| Buscaminas | 9×12, el clásico, con el número de minas variando según el día |
| Palabra del día | Cinco letras, seis intentos |
| Sudoku mini | 6×6 con solución única, con notas para marcar candidatos |
| Recorrido | Un camino que pasa por las 36 casillas tocando los hitos en orden, con muros |
| Paint Rush | Un minuto reproduciendo colores con un selector |
| Perfect Shape | Dibujar a pulso la figura del día |

Cada día la dificultad es suave, normal o dura, la misma para todo el grupo.

**Cómo se puntúa**

Cada juego da una puntuación propia, pero lo que cuenta para la clasificación
son los puntos por posición: 10 al primero, 7 al segundo, 5 al tercero, 3 al
cuarto, 2 al quinto y 1 a quien lo haya jugado. Así se pueden comparar juegos
que dan cifras muy distintas.

Hay tres clasificaciones: la del día, la de la semana (de lunes a domingo, se
reinicia sola) y el palmarés, que guarda para siempre quién ganó cada semana.

---

## Publicarlo

### 1. Subir los archivos a GitHub

Crea un repositorio y sube estos archivos tal cual, en la raíz:

```
index.html
config.js
backend.js
schema.sql
README.md
.nojekyll
```

### 2. Activar GitHub Pages

En el repositorio: **Settings → Pages → Source: Deploy from a branch**,
elige la rama `main` y la carpeta `/ (root)`. En un par de minutos tendrás la
web en `https://TUUSUARIO.github.io/NOMBREDELREPO/`.

Ya funciona, pero en **modo local**: cada persona ve solo sus propias marcas.
Para jugar en grupo hace falta el paso siguiente.

### 3. Crear la base de datos en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto (el plan
   gratuito sobra de largo para esto).
2. Ve a **SQL Editor → New query**, pega todo el contenido de `schema.sql` y
   pulsa **Run**.
3. Ve a **Project Settings → API** y copia dos cosas:
   - **Project URL**
   - la clave **anon public** (la de arriba, *no* la de `service_role`)
4. Pégalas en `config.js`:

```js
window.DUELO_CONFIG = {
  supabaseUrl: "https://xxxxxxxxxxxx.supabase.co",
  supabaseKey: "eyJhbGciOi...",
  tabla: "documentos",
  refrescoMs: 6000
};
```

5. Sube el `config.js` modificado. Listo: ya se comparten las clasificaciones.

---

## Cómo se juega en cuadrilla

Quien empieza crea una cuadrilla y recibe un código de seis caracteres. Ese código
(o el enlace, que lo lleva incluido) es lo único que hay que compartir. Al
entrar solo se pide un nombre: no hay registro, ni correo, ni contraseña.

Cada jugador recibe además un **código de recuperación**, visible abajo en la
pantalla de retos. Sirve para recuperar el historial desde otro móvil.

---

## Notas sobre seguridad

La clave `anon` de Supabase está pensada para vivir en el navegador y puede ir
en el repositorio sin problema. Lo que protege los datos son las políticas de
la base de datos.

Dicho esto, **este montaje no tiene autenticación**: cualquiera que conozca el
código de un grupo puede escribir en él, y las puntuaciones se calculan en el
navegador, así que alguien con ganas podría falsearlas. Para un grupo de
amigos es un riesgo aceptable. Si algún día quieres cerrarlo de verdad:

- Añade **inicio de sesión con Google**. Supabase lo trae hecho: un botón, sin
  contraseñas ni correos de verificación. Sustituiría al código de recuperación.
- Valida las puntuaciones en el servidor, con una función que reciba la partida
  y compruebe que el resultado es posible.

---

## Cosas útiles

- **Probar sin esperar a mañana**: añade `?test` a la URL y aparece una barra
  con dos herramientas, reiniciar los retos de hoy y añadir jugadores de
  ejemplo para ver cómo quedan las clasificaciones con gente.
- **Cambiar la dificultad**: en `index.html`, busca `var TIERS` y ajusta los
  valores. Cada día se elige uno a partir de la fecha, así que todo el grupo
  juega siempre lo mismo.
- **Cambiar las palabras**: busca `var WORDS` en `index.html`. Son palabras de
  cinco letras sin acentos ni eñes. Ahora mismo se acepta cualquier
  combinación de cinco letras como intento; si quieres validar contra un
  diccionario real, ese es el sitio por donde empezar.
- **El día empieza a medianoche** en la hora de cada dispositivo. Si tu grupo
  está repartido por husos horarios, quien vaya por delante verá el reto nuevo
  antes.
