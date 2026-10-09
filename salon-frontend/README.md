# Casa Flora · Frontend

Aplicación Vue 3 para administrar la agenda del salón.

## Arquitectura

- Quasar Framework 2 con `@quasar/vite-plugin` y Sass.
- Vue Router con rutas para resumen, citas, clientes, equipo y servicios.
- Pinia para el estado compartido. `pinia-plugin-persistedstate` persiste únicamente preferencias de interfaz; no se guardan datos personales en el almacenamiento del navegador.
- Axios centralizado en `src/services/api.js`, con URL configurable, timeout, encabezado Bearer y normalización de errores.
- Los stores delegan las solicitudes a `src/services/salon.js` y consumen los endpoints REST del backend MVC.

## Requisitos

Node.js 20.19+ (o 22.12+) y npm.

## Desarrollo local

1. Instala dependencias con `npm install`.
2. El backend local usa `http://localhost:3000/api`. Copia `.env.example` a `.env` si necesitas definir `VITE_API_URL` explícitamente.
3. Inicia el backend desde la carpeta `backend`.
4. Inicia el frontend con `npm run dev`.
5. Ejecuta `npm run build` para generar la versión de producción.

## Uso

- Registra servicios desde **Servicios** antes de dar de alta estilistas; cada estilista necesita al menos un servicio y un horario de trabajo.
- Registra clientes con nombre, apellido, correo, teléfono y contraseña. El backend guarda un hash de la contraseña con bcrypt; publica la API por HTTPS en producción.
- Agenda citas seleccionando cliente, servicio, estilista, fecha y hora de inicio. La API calcula la hora de término y valida disponibilidad, jornada y fecha.
- Los datos del salón se consultan y guardan en MongoDB a través del backend Express. El navegador solo persiste preferencias de interfaz con Pinia; no guarda datos personales.

La variable `VITE_API_URL` se incorpora al bundle del navegador y no debe contener secretos. Las credenciales de MongoDB permanecen solo en el `.env` del backend.

## Desplegar en Vercel

1. Importa el repositorio como un proyecto Vercel y configura **Root Directory** como `salon-frontend`.
2. Usa el framework preset **Vite**. Los comandos por defecto son `npm run build` y `dist`; `vercel.json` configura el fallback de Vue Router para abrir directamente `/citas`, `/clientes`, `/equipo` y `/servicios`.
3. Cuando la API ya esté desplegada, agrega `VITE_API_URL=https://<dominio-api>/api` en **Settings > Environment Variables** para Production.
4. Vuelve a desplegar el frontend después de cambiar `VITE_API_URL`, ya que Vite incorpora esa variable durante el build.

El orden recomendado es desplegar primero el frontend para obtener su URL, luego el backend configurando `CORS_ORIGIN` con esa URL, y por último configurar `VITE_API_URL` y volver a desplegar el frontend. El `.env.example` solo es una plantilla; no subas valores secretos.
