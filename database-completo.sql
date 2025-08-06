-- Base de datos completa ProManager en PostgreSQL (Español)
-- ============================================================

-- Eliminar tablas si existen (en orden inverso por las dependencias)
DROP TABLE IF EXISTS "purchase_notifications" CASCADE;
DROP TABLE IF EXISTS "inventory_movements" CASCADE;
DROP TABLE IF EXISTS "repair_status_history" CASCADE;
DROP TABLE IF EXISTS "notes" CASCADE;
DROP TABLE IF EXISTS "repair_parts" CASCADE;
DROP TABLE IF EXISTS "repairs" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================================
-- CREAR TABLAS
-- ============================================================

-- Tabla de Usuarios
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
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
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Tabla de Productos
CREATE TABLE "products" (
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
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- Tabla de Órdenes
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Tabla de Items de Orden
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- Tabla de Reparaciones
CREATE TABLE "repairs" (
    "id" TEXT NOT NULL,
    "repairNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "deviceType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "issue" TEXT NOT NULL,
    "diagnosis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SIN_ASIGNAR',
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "estimatedCost" DOUBLE PRECISION,
    "finalCost" DOUBLE PRECISION,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseLink" TEXT,
    "partsDescription" TEXT,
    "partsStatus" TEXT DEFAULT 'PENDIENTE',
    "estimatedArrival" TIMESTAMP(3),
    "laborCost" DOUBLE PRECISION,
    "partsCost" DOUBLE PRECISION,
    "workPerformed" TEXT,
    "finalObservations" TEXT,
    "cancellationReason" TEXT,
    
    CONSTRAINT "repairs_pkey" PRIMARY KEY ("id")
);

-- Tabla de Partes de Reparación
CREATE TABLE "repair_parts" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "productId" INTEGER,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "repair_parts_pkey" PRIMARY KEY ("id")
);

-- Tabla de Notas
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- Tabla de Historial de Estados de Reparación
CREATE TABLE "repair_status_history" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "repair_status_history_pkey" PRIMARY KEY ("id")
);

-- Tabla de Movimientos de Inventario
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- Tabla de Notificaciones de Compra
CREATE TABLE "purchase_notifications" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchaseLink" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "purchase_notifications_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CREAR ÍNDICES ÚNICOS
-- ============================================================

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
CREATE UNIQUE INDEX "customers_taxId_key" ON "customers"("taxId");
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE UNIQUE INDEX "repairs_repairNumber_key" ON "repairs"("repairNumber");

-- ============================================================
-- AGREGAR CLAVES FORÁNEAS
-- ============================================================

ALTER TABLE "categories" 
    ADD CONSTRAINT "categories_parentId_fkey" 
    FOREIGN KEY ("parentId") REFERENCES "categories"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products" 
    ADD CONSTRAINT "products_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" 
    ADD CONSTRAINT "orders_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" 
    ADD CONSTRAINT "orders_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" 
    ADD CONSTRAINT "order_items_orderId_fkey" 
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" 
    ADD CONSTRAINT "order_items_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "repairs" 
    ADD CONSTRAINT "repairs_technicianId_fkey" 
    FOREIGN KEY ("technicianId") REFERENCES "users"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "repairs" 
    ADD CONSTRAINT "repairs_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "repair_parts" 
    ADD CONSTRAINT "repair_parts_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "repair_parts" 
    ADD CONSTRAINT "repair_parts_repairId_fkey" 
    FOREIGN KEY ("repairId") REFERENCES "repairs"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notes" 
    ADD CONSTRAINT "notes_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notes" 
    ADD CONSTRAINT "notes_repairId_fkey" 
    FOREIGN KEY ("repairId") REFERENCES "repairs"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "repair_status_history" 
    ADD CONSTRAINT "repair_status_history_repairId_fkey" 
    FOREIGN KEY ("repairId") REFERENCES "repairs"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" 
    ADD CONSTRAINT "inventory_movements_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" 
    ADD CONSTRAINT "inventory_movements_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_notifications" 
    ADD CONSTRAINT "purchase_notifications_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario administrador (contraseña: admin123)
INSERT INTO "users" ("id", "username", "password", "name", "role", "workShift", "recoveryEmail", "updatedAt") 
VALUES (
    'clq1000000000000001', 
    'admin', 
    '$2a$10$K7L.fR3s7nB6KBBS8gF5le9Lg3Fb.V9rNPgKxDn6NFYjVr5qMr9gO', 
    'Administrador', 
    'ADMIN', 
    'TIEMPO_COMPLETO',
    'admin@promanager.com',
    CURRENT_TIMESTAMP
);

-- Usuarios adicionales (contraseña para todos: 1234)
INSERT INTO "users" ("id", "username", "password", "name", "role", "workShift", "updatedAt") VALUES 
(
    'clq2000000000000001', 
    'tecnico1', 
    '$2a$10$xVQmOv5uLCtFXrajmV0tLuwzA8xUZroe2oV1j6qfuQnhPKH8f5hHu', 
    'Juan Técnico', 
    'TECNICO', 
    'MAÑANA',
    CURRENT_TIMESTAMP
),
(
    'clq2000000000000002', 
    'empleado1', 
    '$2a$10$xVQmOv5uLCtFXrajmV0tLuwzA8xUZroe2oV1j6qfuQnhPKH8f5hHu', 
    'María Empleada', 
    'EMPLEADO', 
    'TARDE',
    CURRENT_TIMESTAMP
),
(
    'clq2000000000000003', 
    'gerente1', 
    '$2a$10$xVQmOv5uLCtFXrajmV0tLuwzA8xUZroe2oV1j6qfuQnhPKH8f5hHu', 
    'Carlos Gerente', 
    'GERENTE', 
    'TIEMPO_COMPLETO',
    CURRENT_TIMESTAMP
);

-- Categorías principales
INSERT INTO "categories" ("name", "description", "updatedAt") VALUES 
('Notebooks', 'Computadoras portátiles', CURRENT_TIMESTAMP),
('Accesorios', 'Accesorios para computadoras y dispositivos', CURRENT_TIMESTAMP),
('Componentes', 'Componentes de hardware', CURRENT_TIMESTAMP),
('Celulares', 'Teléfonos móviles', CURRENT_TIMESTAMP),
('Tablets', 'Tabletas y dispositivos táctiles', CURRENT_TIMESTAMP),
('Impresoras', 'Impresoras y multifuncionales', CURRENT_TIMESTAMP),
('Monitores', 'Pantallas y monitores', CURRENT_TIMESTAMP),
('Redes', 'Equipos de red y conectividad', CURRENT_TIMESTAMP);

-- Subcategorías (después de insertar las principales)
INSERT INTO "categories" ("name", "description", "parentId", "updatedAt") VALUES 
-- Subcategorías de Notebooks (id=1)
('Gaming', 'Notebooks para videojuegos', 1, CURRENT_TIMESTAMP),
('Ultrabooks', 'Notebooks ultradelgadas', 1, CURRENT_TIMESTAMP),
('Empresariales', 'Notebooks para uso empresarial', 1, CURRENT_TIMESTAMP),
-- Subcategorías de Accesorios (id=2)
('Cargadores', 'Cargadores y adaptadores de corriente', 2, CURRENT_TIMESTAMP),
('Fundas', 'Fundas y estuches protectores', 2, CURRENT_TIMESTAMP),
('Cables', 'Cables de conexión y datos', 2, CURRENT_TIMESTAMP),
('Teclados', 'Teclados externos', 2, CURRENT_TIMESTAMP),
('Mouse', 'Mouse y dispositivos señaladores', 2, CURRENT_TIMESTAMP),
('Auriculares', 'Auriculares y audífonos', 2, CURRENT_TIMESTAMP),
-- Subcategorías de Componentes (id=3)
('Memoria RAM', 'Módulos de memoria RAM', 3, CURRENT_TIMESTAMP),
('Discos Duros', 'Discos duros mecánicos', 3, CURRENT_TIMESTAMP),
('SSD', 'Unidades de estado sólido', 3, CURRENT_TIMESTAMP),
('Procesadores', 'Procesadores y CPUs', 3, CURRENT_TIMESTAMP),
('Placas Madre', 'Motherboards y placas base', 3, CURRENT_TIMESTAMP),
('Tarjetas Gráficas', 'GPUs y tarjetas de video', 3, CURRENT_TIMESTAMP),
('Fuentes de Poder', 'Fuentes de alimentación', 3, CURRENT_TIMESTAMP),
-- Subcategorías de Celulares (id=4)
('Android', 'Teléfonos con sistema Android', 4, CURRENT_TIMESTAMP),
('iPhone', 'Teléfonos Apple iPhone', 4, CURRENT_TIMESTAMP),
-- Subcategorías de Tablets (id=5)
('iPad', 'Tablets Apple iPad', 5, CURRENT_TIMESTAMP),
('Android Tablets', 'Tablets con sistema Android', 5, CURRENT_TIMESTAMP);

-- Productos de ejemplo
INSERT INTO "products" (
    "code", "name", "description", "brand", "model", 
    "categoryId", "price", "cost", "stock", "minStock", "status", "updatedAt"
) VALUES 
-- Memoria RAM (categoría 18)
('RAM001', 'RAM DDR4 8GB 3200MHz Kingston', 'Memoria RAM DDR4 de alta velocidad', 'Kingston', 'KVR32N22S8/8', 18, 45.00, 30.00, 25, 5, 'ACTIVO', CURRENT_TIMESTAMP),
('RAM002', 'RAM DDR4 16GB 3200MHz Corsair', 'Memoria RAM gaming con disipador', 'Corsair', 'CMK16GX4M1E3200C16', 18, 85.00, 60.00, 15, 3, 'ACTIVO', CURRENT_TIMESTAMP),
('RAM003', 'RAM DDR5 16GB 5600MHz Kingston Fury', 'Memoria RAM DDR5 última generación', 'Kingston', 'KF556C40BB-16', 18, 120.00, 90.00, 10, 2, 'ACTIVO', CURRENT_TIMESTAMP),
-- SSD (categoría 20)
('SSD001', 'SSD Kingston NV2 500GB M.2 NVMe', 'SSD NVMe de alta velocidad', 'Kingston', 'SNV2S/500G', 20, 65.00, 45.00, 20, 5, 'ACTIVO', CURRENT_TIMESTAMP),
('SSD002', 'SSD Samsung 980 1TB M.2 NVMe', 'SSD Samsung de alto rendimiento', 'Samsung', 'MZ-V8V1T0BW', 20, 110.00, 80.00, 12, 3, 'ACTIVO', CURRENT_TIMESTAMP),
('SSD003', 'SSD WD Blue 500GB SATA 2.5"', 'SSD SATA para notebooks', 'Western Digital', 'WDS500G3B0A', 20, 55.00, 38.00, 18, 4, 'ACTIVO', CURRENT_TIMESTAMP),
-- Cargadores (categoría 12)
('CHG001', 'Cargador Universal Notebook 90W', 'Cargador universal con múltiples puntas', 'Generic', 'UN90W', 12, 35.00, 20.00, 30, 5, 'ACTIVO', CURRENT_TIMESTAMP),
('CHG002', 'Cargador USB-C 65W PD', 'Cargador rápido USB-C Power Delivery', 'Anker', 'A2663', 12, 45.00, 28.00, 20, 5, 'ACTIVO', CURRENT_TIMESTAMP),
('CHG003', 'Cargador iPhone 20W Original', 'Cargador original Apple', 'Apple', 'MHJE3AM/A', 12, 25.00, 15.00, 40, 10, 'ACTIVO', CURRENT_TIMESTAMP),
-- Cables (categoría 14)
('CBL001', 'Cable HDMI 2.1 4K 2m', 'Cable HDMI de alta velocidad 4K 120Hz', 'UGREEN', 'HD140', 14, 15.00, 8.00, 50, 10, 'ACTIVO', CURRENT_TIMESTAMP),
('CBL002', 'Cable USB-C a USB-C 3.1 1m', 'Cable USB-C de carga y datos', 'Anker', 'A8182', 14, 12.00, 6.00, 60, 15, 'ACTIVO', CURRENT_TIMESTAMP),
('CBL003', 'Cable DisplayPort 1.4 2m', 'Cable DisplayPort 8K', 'VESA', 'DP14-2M', 14, 20.00, 12.00, 25, 5, 'ACTIVO', CURRENT_TIMESTAMP),
-- Teclados (categoría 15)
('KBD001', 'Teclado Mecánico Redragon K552', 'Teclado mecánico gaming RGB', 'Redragon', 'K552', 15, 55.00, 35.00, 15, 3, 'ACTIVO', CURRENT_TIMESTAMP),
('KBD002', 'Teclado Logitech K380 Bluetooth', 'Teclado inalámbrico multidispositivo', 'Logitech', 'K380', 15, 45.00, 30.00, 20, 5, 'ACTIVO', CURRENT_TIMESTAMP),
-- Mouse (categoría 16)
('MOU001', 'Mouse Logitech G203 Gaming', 'Mouse gaming con RGB', 'Logitech', 'G203', 16, 35.00, 22.00, 25, 5, 'ACTIVO', CURRENT_TIMESTAMP),
('MOU002', 'Mouse Razer DeathAdder Essential', 'Mouse ergonómico gaming', 'Razer', 'RZ01-03850100', 16, 40.00, 25.00, 18, 4, 'ACTIVO', CURRENT_TIMESTAMP);

-- Clientes de ejemplo
INSERT INTO "customers" ("id", "name", "email", "phone", "address", "taxId", "updatedAt") VALUES 
('clq3000000000000001', 'Juan Pérez', 'juan.perez@email.com', '1122334455', 'Av. Corrientes 1234, CABA', '20303030303', CURRENT_TIMESTAMP),
('clq3000000000000002', 'María García', 'maria.garcia@email.com', '1166778899', 'Av. Libertador 5678, CABA', '27404040404', CURRENT_TIMESTAMP),
('clq3000000000000003', 'Carlos López', 'carlos.lopez@email.com', '1155667788', 'Av. Cabildo 910, CABA', NULL, CURRENT_TIMESTAMP),
('clq3000000000000004', 'Ana Martínez', 'ana.martinez@email.com', '1144556677', 'Av. Santa Fe 2345, CABA', '23505050505', CURRENT_TIMESTAMP),
('clq3000000000000005', 'Roberto Silva', 'roberto.silva@email.com', '1133445566', 'Av. Rivadavia 4567, CABA', NULL, CURRENT_TIMESTAMP),
('clq3000000000000006', 'Lucía Fernández', 'lucia.fernandez@email.com', '1199887766', 'Av. Belgrano 789, CABA', '27606060606', CURRENT_TIMESTAMP),
('clq3000000000000007', 'Diego Rodríguez', NULL, '1177665544', 'Av. San Juan 1011, CABA', NULL, CURRENT_TIMESTAMP),
('clq3000000000000008', 'Sofía González', 'sofia.gonzalez@email.com', '1188776655', 'Av. Independencia 1213, CABA', '23707070707', CURRENT_TIMESTAMP);

-- Reparaciones de ejemplo
INSERT INTO "repairs" (
    "id", "repairNumber", "customerId", "technicianId", 
    "deviceType", "brand", "model", "serialNumber",
    "issue", "diagnosis", "status", "priority",
    "estimatedCost", "progress", "receivedDate", "updatedAt"
) VALUES 
(
    'clq4000000000000001', 
    'REP000001', 
    'clq3000000000000001',
    'clq2000000000000001',
    'Notebook',
    'Dell',
    'Inspiron 15 3000',
    'DLL123456789',
    'No enciende',
    'Problema con la fuente de alimentación. Se requiere reemplazo del cargador.',
    'EN_PROGRESO',
    'ALTA',
    85.00,
    50,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP
),
(
    'clq4000000000000002', 
    'REP000002', 
    'clq3000000000000002',
    'clq2000000000000001',
    'Celular',
    'Samsung',
    'Galaxy A54',
    'SAM987654321',
    'Pantalla rota',
    'Pantalla completamente dañada. Requiere reemplazo completo del módulo.',
    'ESPERANDO_PARTES',
    'MEDIA',
    150.00,
    25,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP
),
(
    'clq4000000000000003', 
    'REP000003', 
    'clq3000000000000003',
    NULL,
    'Notebook',
    'HP',
    'Pavilion 14',
    NULL,
    'Lentitud extrema',
    NULL,
    'SIN_ASIGNAR',
    'BAJA',
    NULL,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'clq4000000000000004', 
    'REP000004', 
    'clq3000000000000004',
    'clq2000000000000001',
    'Tablet',
    'Apple',
    'iPad Air',
    'APL456789123',
    'No carga',
    'Puerto de carga dañado. Requiere cambio del flex de carga.',
    'EN_PROGRESO',
    'ALTA',
    120.00,
    75,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP
);

-- Notas en reparaciones
INSERT INTO "notes" ("id", "repairId", "authorId", "text", "createdAt") VALUES 
('clq5000000000000001', 'clq4000000000000001', 'clq2000000000000001', 'Cliente informado sobre el diagnóstico. Autoriza la reparación.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('clq5000000000000002', 'clq4000000000000001', 'clq2000000000000001', 'Cargador de reemplazo pedido. Llegada estimada mañana.', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('clq5000000000000003', 'clq4000000000000002', 'clq2000000000000001', 'Presupuesto enviado al cliente vía WhatsApp.', CURRENT_TIMESTAMP - INTERVAL '18 hours'),
('clq5000000000000004', 'clq4000000000000004', 'clq2000000000000001', 'Flex de carga en stock. Procediendo con la reparación.', CURRENT_TIMESTAMP - INTERVAL '6 hours');

-- Historial de estados de reparación
INSERT INTO "repair_status_history" ("id", "repairId", "status", "comment", "createdAt") VALUES 
('clq6000000000000001', 'clq4000000000000001', 'SIN_ASIGNAR', 'Reparación recibida', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('clq6000000000000002', 'clq4000000000000001', 'ASIGNADO', 'Asignado a técnico Juan', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours'),
('clq6000000000000003', 'clq4000000000000001', 'EN_PROGRESO', 'Diagnóstico completado', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('clq6000000000000004', 'clq4000000000000002', 'SIN_ASIGNAR', 'Reparación recibida', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('clq6000000000000005', 'clq4000000000000002', 'ASIGNADO', 'Asignado a técnico Juan', CURRENT_TIMESTAMP - INTERVAL '20 hours'),
('clq6000000000000006', 'clq4000000000000002', 'ESPERANDO_PARTES', 'Esperando pantalla de reemplazo', CURRENT_TIMESTAMP - INTERVAL '18 hours');

-- ============================================================
-- INFORMACIÓN DE USUARIOS
-- ============================================================
-- Usuario: admin     | Contraseña: admin123
-- Usuario: tecnico1  | Contraseña: 1234
-- Usuario: empleado1 | Contraseña: 1234
-- Usuario: gerente1  | Contraseña: 1234