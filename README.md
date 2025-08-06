# ProManager - Sistema de Gestión de Reparaciones
<!-- Deploy trigger: 2025-01-03 -->

ProManager es un sistema web completo para la gestión de reparaciones de dispositivos electrónicos, control de inventario y métricas de rendimiento.

## Características

- **Gestión de Reparaciones**: Control completo del ciclo de vida de las reparaciones
- **Control de Inventario**: Gestión de productos, stock y ventas
- **Sistema de Métricas**: Evaluación de rendimiento de técnicos con metas diarias, semanales y mensuales
- **Gestión de Usuarios**: Sistema de roles (Admin, Manager, Employee, Technician)
- **Diseño Elegante**: Interfaz moderna con glassmorphism y transiciones suaves

## Tecnologías

- **Framework**: SvelteKit
- **Base de Datos**: SQLite con Prisma ORM
- **Estilos**: Tailwind CSS
- **Autenticación**: Sistema personalizado con cookies
- **TypeScript**: Para mayor seguridad de tipos

## Instalación

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd promanager-web
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar la base de datos
```bash
npx prisma generate
npx prisma db push
```

4. (Opcional) Sembrar datos de prueba
```bash
npm run seed
```

5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

## Usuarios por defecto

- **Dueño**: usuario: `dueño`, contraseña: `admin123`
- **Admin**: usuario: `admin`, contraseña: `admin123`
- **Técnico**: usuario: `rodrigo`, contraseña: `tech123`

## Scripts disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run seed` - Sembrar datos de prueba
- `npm run check-db` - Verificar conexión a base de datos

## Estructura del proyecto

```
promanager-web/
├── prisma/              # Esquema y migraciones de base de datos
├── src/
│   ├── lib/            # Utilidades y componentes compartidos
│   ├── routes/         # Páginas y rutas de la aplicación
│   └── app.css        # Estilos globales
├── static/            # Archivos estáticos
└── scripts/           # Scripts de utilidad
```

## Métricas y Evaluación

El sistema evalúa a los técnicos basándose en:
- Reparaciones completadas vs meta mensual
- Tiempo promedio de reparación
- Ingresos generados
- Adaptación automática para técnicos de medio turno

## Licencia

Proyecto privado - Todos los derechos reservados