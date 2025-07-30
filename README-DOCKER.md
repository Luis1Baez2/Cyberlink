# CyberLink - Configuración con Docker

## Requisitos Previos
- Docker
- Docker Compose

## Instalación Rápida

1. **Clonar el repositorio** (si aún no lo tienes)
   ```bash
   git clone <tu-repositorio>
   cd Cyberlink
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` y configura:
   - `JWT_SECRET`: Una clave secreta segura para autenticación
   - `ORIGIN`: La URL donde se accederá a la aplicación

3. **Iniciar la aplicación**
   ```bash
   ./docker-start.sh
   ```
   O manualmente:
   ```bash
   docker compose up -d
   ```

## Acceso a la Aplicación

- **Local**: http://localhost:5051
- **Red local**: http://[TU-IP]:5051

### Usuarios por defecto:
- **Dueño**: usuario: `dueño`, contraseña: `1234`
- **Admin**: usuario: `admin`, contraseña: `1234`
- **Técnico**: usuario: `rodrigo`, contraseña: `1234`

## Comandos Útiles

### Ver logs
```bash
docker compose logs -f
```

### Detener la aplicación
```bash
./docker-stop.sh
# o
docker compose down
```

### Reiniciar la aplicación
```bash
docker compose restart
```

### Acceder al contenedor
```bash
docker exec -it cyberlink-app sh
```

### Ejecutar comandos de Prisma
```bash
# Actualizar esquema de base de datos
docker exec -it cyberlink-app npx prisma db push

# Generar cliente de Prisma
docker exec -it cyberlink-app npx prisma generate

# Ver base de datos con Prisma Studio
docker exec -it cyberlink-app npx prisma studio
```

## Producción

Para usar en producción:

1. **Usar docker-compose.prod.yml**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **Configurar variables de entorno de producción**
   - Cambiar `JWT_SECRET` a un valor seguro
   - Configurar `ORIGIN` con el dominio real
   - El puerto 5051 se usa por defecto

## Backups

Los backups automáticos se ejecutan diariamente:
- Se guardan en la carpeta `./backups`
- Se mantienen por 30 días (configurable)
- Para hacer backup manual:
  ```bash
  docker exec cyberlink-backup sh -c "cp /data/cyberlink.db /backups/cyberlink-manual-$(date +%Y%m%d-%H%M%S).db"
  ```

## Estructura de Volúmenes

- `./data`: Base de datos SQLite
- `./uploads`: Archivos subidos por usuarios
- `./backups`: Copias de seguridad de la base de datos

## Solución de Problemas

### La aplicación no inicia
1. Verificar logs: `docker compose logs app`
2. Asegurarse de que el puerto 3000 no esté en uso
3. Verificar permisos en las carpetas de volúmenes

### Error de base de datos
1. Verificar que la carpeta `./data` existe y tiene permisos
2. Ejecutar: `docker compose run app npx prisma db push`

### Problemas de permisos
```bash
sudo chown -R 1001:1001 ./data ./uploads
```