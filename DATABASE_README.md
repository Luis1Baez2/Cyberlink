# Configuración de Base de Datos - ProManager

## Esquema en Español

El esquema de la base de datos ha sido traducido completamente al español. Los modelos ahora usan nombres en español pero mantienen compatibilidad con las columnas originales en inglés mediante el uso de `@map()`.

## Configuración de PostgreSQL

### 1. Configurar la URL de conexión

Edita el archivo `.env` y configura tu URL de PostgreSQL:

```env
# Para desarrollo local
DATABASE_URL="postgresql://usuario:password@localhost:5432/promanager?schema=public"

# Para Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Para Neon
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require"

# Para Vercel Postgres
DATABASE_URL="postgres://[USER]:[PASSWORD]@[HOST].postgres.vercel-storage.com:5432/[DATABASE]"
```

### 2. Crear la base de datos

Puedes usar uno de estos métodos:

#### Opción A: Usar Prisma Migrate (Recomendado)
```bash
# Generar el cliente Prisma
npx prisma generate

# Crear las migraciones y aplicarlas
npx prisma migrate dev --name init

# O para producción
npx prisma migrate deploy
```

#### Opción B: Usar el archivo SQL unificado
```bash
# Conectarte a PostgreSQL y ejecutar:
psql -U tu_usuario -d tu_database -f database-completo.sql
```

### 3. Archivos disponibles

- **`prisma/schema.prisma`**: Esquema de Prisma en español con mapeo a columnas en inglés
- **`database-completo.sql`**: Script SQL completo con creación de tablas y datos iniciales
- **Archivos SQL antiguos** (para referencia):
  - `create-tables.sql`: Estructura original
  - `seed-data.sql`: Datos de ejemplo

## Modelos traducidos

| Modelo Original | Modelo en Español | Tabla en BD |
|----------------|-------------------|-------------|
| User | Usuario | users |
| Category | Categoria | categories |
| Product | Producto | products |
| Customer | Cliente | customers |
| Order | Orden | orders |
| OrderItem | ItemOrden | order_items |
| Repair | Reparacion | repairs |
| RepairPart | ParteReparacion | repair_parts |
| Note | Nota | notes |
| RepairStatusHistory | HistorialEstadoReparacion | repair_status_history |
| InventoryMovement | MovimientoInventario | inventory_movements |
| PurchaseNotification | NotificacionCompra | purchase_notifications |

## Usuarios por defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |
| tecnico1 | 1234 | TECNICO |
| empleado1 | 1234 | EMPLEADO |
| gerente1 | 1234 | GERENTE |

## Notas importantes

1. **Compatibilidad**: El esquema mantiene compatibilidad total con el código existente gracias al uso de `@map()`
2. **Migraciones**: Si ya tienes datos, asegúrate de hacer backup antes de aplicar migraciones
3. **Producción**: Para producción, usa `npx prisma migrate deploy` en lugar de `dev`
4. **SSL**: Algunos proveedores requieren SSL. Añade `?sslmode=require` a tu URL si es necesario