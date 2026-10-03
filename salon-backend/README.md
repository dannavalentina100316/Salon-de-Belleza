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