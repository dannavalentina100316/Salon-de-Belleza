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
- En **Estilistas** puedes editar nombre, teléfono, servicios y horario, cambiar su estado activo, o eliminarla. No se permite eliminar una estilista ni cambiar su horario/servicios si eso dejaría citas futuras agendadas sin atender.
- Registra clientes con nombre, apellido, correo, teléfono y contraseña. El backend guarda un hash de la contraseña con bcrypt; publica la API por HTTPS en producción.
- Agenda citas seleccionando cliente, servicio y fecha; la aplicación muestra las estilistas que ofrecen ese servicio y los inicios libres, cada 15 minutos dentro de su jornada. Los horarios ocupados por citas agendadas o confirmadas se ocultan; el backend vuelve a validar cruces al guardar.
- En la agenda puedes cambiar el estado a **Agendada**, **Confirmada**, **Cancelada** o **Realizada**. Las citas canceladas y realizadas ya no bloquean el horario de una estilista.
- Los datos del salón se consultan y guardan en MongoDB a través del backend Express. El navegador solo persiste preferencias de interfaz con Pinia; no guarda datos personales.

La variable `VITE_API_URL` se incorpora al bundle del navegador y no debe contener secretos. Las credenciales de MongoDB permanecen solo en el `.env` del backend.

## Desplegar el backend en Render y el frontend en Vercel

1. En Render, crea un **Blueprint** desde este repositorio. Render detectará el archivo `render.yaml` de la raíz y preparará la API usando la carpeta `backend`.
2. Al crear el servicio, Render solicitará el valor secreto `MONGODB_URI`. Agrégalo en el formulario o en **Environment** del servicio; nunca lo guardes en GitHub ni en el código.
3. Espera a que termine el despliegue del backend y copia su dominio HTTPS, por ejemplo `https://salon-belleza-api.onrender.com`.
4. En Vercel, configura **Root Directory** como `salon-frontend` y usa el preset **Vite**. Los comandos son `npm run build` y `dist`.
5. En **Settings > Environment Variables** del proyecto de Vercel, configura `VITE_API_URL` con la URL del backend seguida de `/api`, por ejemplo `https://salon-belleza-api.onrender.com/api`.
6. Vuelve a desplegar el frontend después de configurar `VITE_API_URL`, porque Vite incorpora esa variable durante el build.

El backend permite solicitudes CORS para que el frontend de Vercel pueda consumir la API. El archivo `.env` se usa solo para desarrollo local y permanece excluido de Git; `MONGODB_URI` debe configurarse como variable secreta en Render.
