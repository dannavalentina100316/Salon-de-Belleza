# Backend del salon

## Conectar MongoDB Atlas

1. En Atlas, crea un usuario de base de datos desde **Database Access**.
2. En **Network Access**, agrega la IP desde la que se ejecutara el backend. Evita permitir todas las IPs en produccion.
3. En el cluster, selecciona **Connect > Drivers** y copia la URI de conexion para Node.js.
4. Copia `.env.example` como `.env` si aun no existe. Pega la URI en `MONGODB_URI` y reemplaza el nombre, la contrasena y el host de ejemplo por los datos de Atlas. Puedes usar `salon_belleza` como nombre de base de datos.
5. Si la contrasena contiene caracteres reservados en una URI, codificalos para URL antes de pegarla. No subas `.env` al repositorio.
6. Instala dependencias y arranca el backend:

   ```sh
   npm install
   npm run dev
   ```

El backend solo inicia el servidor cuando la conexion a MongoDB se establece correctamente. Si falla, revisa la URI, las credenciales y la lista de IPs permitidas en Atlas.

## Desplegar en Vercel

Despliega este backend como un proyecto Vercel independiente desde el mismo repositorio:

1. En Vercel, importa el repositorio y establece **Root Directory** en `salon-backend`.
2. Vercel detecta Express a partir de `app.js`; no configures un comando de build.
3. En **Settings > Environment Variables**, agrega `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGIN` para Production. `CORS_ORIGIN` debe ser la URL de producción del frontend Vercel, por ejemplo `https://tu-salon.vercel.app`.
4. Despliega y comprueba `https://<dominio-api>/api/health`.

El backend conecta a MongoDB cuando recibe una solicitud y reutiliza la conexión en las invocaciones calientes. No subas `.env`; configura los secretos desde Vercel.

### Red de MongoDB Atlas

Atlas debe permitir conexiones desde la salida de red del backend. Vercel no ofrece una IP saliente fija en todos sus planes; para una configuración de producción, usa salida estática/privada compatible con tu plan o aloja la API en un proveedor con egress fijo. Para una demostración académica, algunas personas permiten `0.0.0.0/0`, pero eso expone el acceso de red del clúster a Internet: úsalo solo entendiendo el riesgo, con contraseña fuerte y usuario de base de datos con privilegios mínimos. Nunca publiques la URI.

Las rutas de administración actuales no requieren autenticación. Este proyecto sirve como demostración; antes de guardar datos reales de clientes, protege las rutas de escritura con autorización y roles.