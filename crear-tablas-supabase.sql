-- Crear todas las tablas necesarias para ProManager en Supabase

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLEADO',
    "workShift" TEXT NOT NULL DEFAULT 'TIEMPO_COMPLETO',
    "recoveryEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS "products" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "categoryId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "taxId" TEXT,
    "cuitDni" TEXT,
    "condicionIva" TEXT DEFAULT 'Consumidor Final',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Tabla de Reparaciones
CREATE TABLE IF NOT EXISTS "repairs" (
    "id" TEXT NOT NULL,
    "repairNumber" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "problemDescription" TEXT NOT NULL,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INGRESADO',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "technicianId" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "estimatedCost" DOUBLE PRECISION DEFAULT 0,
    "laborCost" DOUBLE PRECISION DEFAULT 0,
    "partsCost" DOUBLE PRECISION DEFAULT 0,
    "accessories" TEXT,
    "receivedBy" TEXT,
    "deliveredTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "repairs_pkey" PRIMARY KEY ("id")
);

-- Tabla de Notas
CREATE TABLE IF NOT EXISTS "notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'EMITIDA',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Tabla de Items de Factura
CREATE TABLE IF NOT EXISTS "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" INTEGER,
    "repairId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- Agregar columnas adicionales si no existen
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "cuitDni" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "condicionIva" TEXT DEFAULT 'Consumidor Final';

-- Insertar usuarios iniciales
INSERT INTO "users" (id, username, password, name, role, "workShift") VALUES
('usr_admin_001', 'admin', '$2b$10$X4kv7j5ZcQrNlJbKKZmWlOhkzlXXjqp87F9W9GvQqFrFQm6TfHbgC', 'Administrador', 'ADMIN', 'TIEMPO_COMPLETO'),
('usr_tech_001', 'tecnico1', '$2b$10$YIpWMPdRrlBr8khylhQKaO8VnQg/2FmOmhu8XZH.UlouUzH3DOBHm', 'Técnico 1', 'TECNICO', 'TIEMPO_COMPLETO'),
('usr_emp_001', 'empleado1', '$2b$10$YIpWMPdRrlBr8khylhQKaO8VnQg/2FmOmhu8XZH.UlouUzH3DOBHm', 'Empleado 1', 'EMPLEADO', 'TIEMPO_COMPLETO'),
('usr_mgr_001', 'gerente1', '$2b$10$YIpWMPdRrlBr8khylhQKaO8VnQg/2FmOmhu8XZH.UlouUzH3DOBHm', 'Gerente 1', 'GERENTE', 'TIEMPO_COMPLETO')
ON CONFLICT (id) DO NOTHING;

-- Usuarios:
-- admin: admin123
-- tecnico1: 1234
-- empleado1: 1234
-- gerente1: 1234