import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/server/auth';

const prisma = new PrismaClient();

async function main() {
	// Crear usuarios de prueba
	const hashedPassword = await hashPassword('1234');
	
	const admin = await prisma.user.upsert({
		where: { username: 'admin' },
		update: {},
		create: {
			username: 'admin',
			password: hashedPassword,
			name: 'Administrador',
			role: 'ADMIN'
		}
	});

	const manager = await prisma.user.upsert({
		where: { username: 'gerente' },
		update: {},
		create: {
			username: 'gerente',
			password: hashedPassword,
			name: 'Gerente General',
			role: 'MANAGER'
		}
	});

	const employee = await prisma.user.upsert({
		where: { username: 'vendedor' },
		update: {},
		create: {
			username: 'vendedor',
			password: hashedPassword,
			name: 'María Vendedora',
			role: 'EMPLOYEE'
		}
	});

	const juan = await prisma.user.upsert({
		where: { username: 'juan' },
		update: {},
		create: {
			username: 'juan',
			password: hashedPassword,
			name: 'Juan',
			role: 'TECHNICIAN'
		}
	});

	const rodrigo = await prisma.user.upsert({
		where: { username: 'rodrigo' },
		update: {},
		create: {
			username: 'rodrigo',
			password: hashedPassword,
			name: 'Rodrigo',
			role: 'TECHNICIAN'
		}
	});

	const franco = await prisma.user.upsert({
		where: { username: 'franco' },
		update: {},
		create: {
			username: 'franco',
			password: hashedPassword,
			name: 'Franco',
			role: 'TECHNICIAN'
		}
	});

	console.log('Usuarios creados:', { admin, manager, employee, juan, rodrigo, franco });

	// Crear clientes de ejemplo
	const customer1 = await prisma.customer.upsert({
		where: { phone: '555-0123' },
		update: {},
		create: {
			name: 'Juan Pérez',
			phone: '555-0123',
			email: 'juan.perez@email.com',
			address: 'Calle Principal 123, Ciudad'
		}
	});

	const customer2 = await prisma.customer.upsert({
		where: { phone: '555-0124' },
		update: {},
		create: {
			name: 'María García',
			phone: '555-0124',
			email: 'maria.garcia@email.com',
			address: 'Avenida Central 456, Ciudad'
		}
	});

	const customer3 = await prisma.customer.upsert({
		where: { phone: '555-0125' },
		update: {},
		create: {
			name: 'Pedro López',
			phone: '555-0125',
			address: 'Plaza Mayor 789, Ciudad'
		}
	});

	const customer4 = await prisma.customer.upsert({
		where: { phone: '555-0126' },
		update: {},
		create: {
			name: 'Ana Martínez',
			phone: '555-0126',
			email: 'ana.martinez@email.com'
		}
	});

	const customer5 = await prisma.customer.upsert({
		where: { phone: '555-0127' },
		update: {},
		create: {
			name: 'Roberto Silva',
			phone: '555-0127',
			email: 'roberto.silva@email.com'
		}
	});

	console.log('Clientes creados');

	// Crear 7 reparaciones de ejemplo (una por cada estado)
	
	// 1. UNASSIGNED - Sin asignar
	const repair1 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-010',
			customerId: customer1.id,
			deviceType: 'Tablet',
			brand: 'Apple',
			model: 'iPad Air',
			issue: 'Batería no carga',
			status: 'UNASSIGNED',
			priority: 'HIGH',
			progress: 0,
			receivedDate: new Date('2024-01-25'),
			notes: {
				create: [
					{
						text: 'Cliente reporta que la batería no carga. Equipo pendiente de asignación a técnico.',
						authorId: employee.id,
						createdAt: new Date('2024-01-25T10:00:00')
					}
				]
			}
		}
	});

	// 2. IN_REVIEW - En revisión
	const repair2 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-011',
			customerId: customer2.id,
			technicianId: juan.id,
			deviceType: 'Notebook',
			brand: 'HP',
			model: 'Pavilion 15',
			serialNumber: 'HP987654321',
			issue: 'Pantalla azul frecuente',
			status: 'IN_REVIEW',
			priority: 'HIGH',
			estimatedCost: 0,
			progress: 15,
			receivedDate: new Date('2024-01-24'),
			notes: {
				create: [
					{
						text: 'Cliente reporta pantallas azules frecuentes, especialmente al usar programas pesados.',
						authorId: employee.id,
						createdAt: new Date('2024-01-24T09:00:00')
					},
					{
						text: 'Iniciando diagnóstico. Revisando memoria RAM y disco duro.',
						authorId: juan.id,
						createdAt: new Date('2024-01-24T14:00:00')
					}
				]
			}
		}
	});

	// 3. IN_REPAIR - En reparación
	const repair3 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-012',
			customerId: customer3.id,
			technicianId: rodrigo.id,
			deviceType: 'Celular',
			brand: 'Samsung',
			model: 'Galaxy S21',
			issue: 'Pantalla rota y táctil no funciona',
			diagnosis: 'Pantalla completamente dañada. Requiere reemplazo completo del módulo de pantalla.',
			status: 'IN_REPAIR',
			priority: 'MEDIUM',
			estimatedCost: 250,
			progress: 65,
			receivedDate: new Date('2024-01-22'),
			estimatedDate: new Date('2024-01-26'),
			notes: {
				create: [
					{
						text: 'Pantalla con múltiples fisuras. Táctil no responde.',
						authorId: employee.id,
						createdAt: new Date('2024-01-22T11:00:00')
					},
					{
						text: 'Se confirmó necesidad de reemplazo completo de pantalla.',
						authorId: rodrigo.id,
						createdAt: new Date('2024-01-22T15:00:00')
					},
					{
						text: 'Pantalla nueva instalada. Probando funcionamiento.',
						authorId: rodrigo.id,
						createdAt: new Date('2024-01-24T16:00:00')
					}
				]
			},
			parts: {
				create: [
					{
						name: 'Pantalla Samsung Galaxy S21 Original',
						quantity: 1,
						price: 180,
						status: 'RECEIVED'
					}
				]
			}
		}
	});

	// 4. WAITING_PARTS - Esperando repuestos
	const repair4 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-013',
			customerId: customer4.id,
			technicianId: juan.id,
			deviceType: 'Impresora',
			brand: 'Epson',
			model: 'L3150',
			issue: 'No imprime, hace ruidos extraños',
			diagnosis: 'Cabezal de impresión dañado. Sistema de alimentación de tinta obstruido.',
			status: 'WAITING_PARTS',
			priority: 'LOW',
			estimatedCost: 120,
			progress: 40,
			receivedDate: new Date('2024-01-20'),
			notes: {
				create: [
					{
						text: 'Impresora hace ruidos al intentar imprimir pero no sale nada.',
						authorId: employee.id,
						createdAt: new Date('2024-01-20T10:00:00')
					},
					{
						text: 'Diagnóstico: cabezal dañado y sistema de tinta obstruido.',
						authorId: juan.id,
						createdAt: new Date('2024-01-21T11:00:00')
					},
					{
						text: 'Se ordenó cabezal de repuesto. Tiempo de entrega: 5-7 días.',
						authorId: juan.id,
						createdAt: new Date('2024-01-21T16:00:00')
					}
				]
			},
			parts: {
				create: [
					{
						name: 'Cabezal de impresión Epson L3150',
						quantity: 1,
						price: 85,
						status: 'ORDERED'
					}
				]
			}
		}
	});

	// 5. COMPLETED - Terminado
	const repair5 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-014',
			customerId: customer5.id,
			technicianId: rodrigo.id,
			deviceType: 'Notebook',
			brand: 'Dell',
			model: 'Inspiron 15',
			serialNumber: 'DL123456789',
			issue: 'No enciende',
			diagnosis: 'Fuente de alimentación defectuosa. Se reemplazó con éxito.',
			status: 'COMPLETED',
			priority: 'HIGH',
			estimatedCost: 150,
			finalCost: 150,
			progress: 100,
			receivedDate: new Date('2024-01-18'),
			estimatedDate: new Date('2024-01-22'),
			notes: {
				create: [
					{
						text: 'Laptop no muestra signos de vida al presionar el botón de encendido.',
						authorId: employee.id,
						createdAt: new Date('2024-01-18T09:00:00')
					},
					{
						text: 'Probado con otra fuente - funciona. Fuente original defectuosa.',
						authorId: rodrigo.id,
						createdAt: new Date('2024-01-18T14:00:00')
					},
					{
						text: 'Fuente nueva instalada y probada. Equipo funcionando perfectamente.',
						authorId: rodrigo.id,
						createdAt: new Date('2024-01-19T16:00:00')
					},
					{
						text: 'Reparación completada. Equipo listo para entrega.',
						authorId: rodrigo.id,
						createdAt: new Date('2024-01-19T17:00:00')
					}
				]
			},
			parts: {
				create: [
					{
						name: 'Fuente de alimentación Dell 65W',
						quantity: 1,
						price: 65,
						status: 'INSTALLED'
					}
				]
			}
		}
	});

	// 6. CANCELLED - Cancelado
	const repair6 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-015',
			customerId: customer1.id,
			technicianId: juan.id,
			deviceType: 'Monitor',
			brand: 'LG',
			model: '24MK430H',
			issue: 'No enciende, sin imagen',
			diagnosis: 'Placa principal dañada. Costo de reparación supera el valor del equipo.',
			status: 'CANCELLED',
			priority: 'MEDIUM',
			estimatedCost: 280,
			progress: 30,
			receivedDate: new Date('2024-01-19'),
			notes: {
				create: [
					{
						text: 'Monitor no da señales de vida. Sin LED de encendido.',
						authorId: employee.id,
						createdAt: new Date('2024-01-19T10:00:00')
					},
					{
						text: 'Diagnóstico: placa principal quemada. Costo de reparación: $280',
						authorId: juan.id,
						createdAt: new Date('2024-01-19T15:00:00')
					},
					{
						text: 'Cliente informado del costo. Decide no reparar por ser muy elevado.',
						authorId: employee.id,
						createdAt: new Date('2024-01-20T10:00:00')
					},
					{
						text: 'Reparación cancelada por decisión del cliente.',
						authorId: admin.id,
						createdAt: new Date('2024-01-20T11:00:00')
					}
				]
			}
		}
	});

	// 7. DELIVERED - Entregado
	const repair7 = await prisma.repair.create({
		data: {
			repairNumber: 'REP-2024-016',
			customerId: customer2.id,
			technicianId: juan.id,
			deviceType: 'Celular',
			brand: 'iPhone',
			model: '12 Pro',
			serialNumber: 'IP12345678',
			issue: 'Batería se descarga muy rápido',
			diagnosis: 'Batería con muchos ciclos de carga. Se reemplazó por una nueva.',
			status: 'DELIVERED',
			priority: 'MEDIUM',
			estimatedCost: 100,
			finalCost: 100,
			progress: 100,
			receivedDate: new Date('2024-01-15'),
			estimatedDate: new Date('2024-01-17'),
			deliveryDate: new Date('2024-01-17'),
			notes: {
				create: [
					{
						text: 'Cliente reporta que la batería dura solo 2-3 horas.',
						authorId: employee.id,
						createdAt: new Date('2024-01-15T10:00:00')
					},
					{
						text: 'Diagnóstico: Batería con 89% de salud. Se recomienda reemplazo.',
						authorId: juan.id,
						createdAt: new Date('2024-01-15T14:00:00')
					},
					{
						text: 'Batería nueva instalada. Calibración completa.',
						authorId: juan.id,
						createdAt: new Date('2024-01-16T16:00:00')
					},
					{
						text: 'Equipo entregado al cliente. Funcionando perfectamente.',
						authorId: employee.id,
						createdAt: new Date('2024-01-17T11:00:00')
					}
				]
			},
			parts: {
				create: [
					{
						name: 'Batería iPhone 12 Pro Original',
						quantity: 1,
						price: 75,
						status: 'INSTALLED'
					}
				]
			}
		}
	});

	console.log('Reparaciones creadas: 7 reparaciones (una por cada estado)');

	// Crear categorías de productos
	const categoryComputers = await prisma.category.upsert({
		where: { name: 'Computadoras' },
		update: {},
		create: {
			name: 'Computadoras',
			description: 'Laptops, desktops y accesorios'
		}
	});

	const categoryPhones = await prisma.category.upsert({
		where: { name: 'Celulares' },
		update: {},
		create: {
			name: 'Celulares',
			description: 'Teléfonos móviles y accesorios'
		}
	});

	const categoryParts = await prisma.category.upsert({
		where: { name: 'Repuestos' },
		update: {},
		create: {
			name: 'Repuestos',
			description: 'Partes y componentes para reparación'
		}
	});

	console.log('Categorías creadas:', { categoryComputers, categoryPhones, categoryParts });

	// Crear algunos productos
	await prisma.product.create({
		data: {
			code: 'LAP001',
			name: 'Laptop Dell Inspiron 15',
			description: 'Laptop para uso general',
			brand: 'Dell',
			model: 'Inspiron 15',
			categoryId: categoryComputers.id,
			price: 899.99,
			cost: 650,
			stock: 5,
			minStock: 2
		}
	});

	await prisma.product.create({
		data: {
			code: 'CEL001',
			name: 'Samsung Galaxy S21',
			description: 'Smartphone de gama alta',
			brand: 'Samsung',
			model: 'Galaxy S21',
			categoryId: categoryPhones.id,
			price: 799.99,
			cost: 550,
			stock: 8,
			minStock: 3
		}
	});

	await prisma.product.create({
		data: {
			code: 'REP001',
			name: 'Pantalla LCD Samsung S21',
			description: 'Pantalla de repuesto original',
			brand: 'Samsung',
			categoryId: categoryParts.id,
			price: 150,
			cost: 95,
			stock: 10,
			minStock: 5
		}
	});

	console.log('Productos creados');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});