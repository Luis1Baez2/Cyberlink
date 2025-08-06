import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
	log: ['error', 'warn'],
});

// Asegurar conexión antes de hacer operaciones
await prisma.$connect();

async function main() {
	// Contraseña única para todos los usuarios
	const hashedPassword = await bcrypt.hash('1234', 10);
	
	// Crear usuario dueño
	const owner = await prisma.usuario.upsert({
		where: { nombreUsuario: 'dueño' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'dueño',
			contrasena: hashedPassword,
			nombre: 'Dueño del Negocio',
			rol: 'ADMIN' // Temporalmente ADMIN hasta actualizar el schema
		}
	});
	console.log('Usuario dueño creado:', { username: owner.nombreUsuario });

	// Crear usuario administrador
	const admin = await prisma.usuario.upsert({
		where: { nombreUsuario: 'admin' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'admin',
			contrasena: hashedPassword,
			nombre: 'Administrador',
			rol: 'ADMIN'
		}
	});
	console.log('Usuario admin creado:', { username: admin.nombreUsuario });

	// Crear usuario vendedor
	const employee = await prisma.usuario.upsert({
		where: { nombreUsuario: 'vendedor' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'vendedor',
			contrasena: hashedPassword,
			nombre: 'Vendedor de Prueba',
			rol: 'EMPLOYEE'
		}
	});
	console.log('Usuario vendedor creado:', { username: employee.username });

	// Crear técnico Juan
	const juan = await prisma.user.upsert({
		where: { username: 'juan' },
		update: { password: hashedPassword },
		create: {
			username: 'juan',
			password: hashedPassword,
			name: 'Juan',
			role: 'TECHNICIAN'
		}
	});
	console.log('Técnico Juan creado:', { username: juan.username });

	// Crear técnico Rodrigo
	const rodrigo = await prisma.user.upsert({
		where: { username: 'rodrigo' },
		update: { password: hashedPassword },
		create: {
			username: 'rodrigo',
			password: hashedPassword,
			name: 'Rodrigo',
			role: 'TECHNICIAN'
		}
	});
	console.log('Técnico Rodrigo creado:', { username: rodrigo.username });

	// Crear técnico Franco
	const franco = await prisma.user.upsert({
		where: { username: 'franco' },
		update: { password: hashedPassword },
		create: {
			username: 'franco',
			password: hashedPassword,
			name: 'Franco',
			role: 'TECHNICIAN'
		}
	});
	console.log('Técnico Franco creado:', { username: franco.username });

	// Crear usuario cajero
	const cashier = await prisma.user.upsert({
		where: { username: 'cajero' },
		update: { password: hashedPassword },
		create: {
			username: 'cajero',
			password: hashedPassword,
			name: 'Cajero de Prueba',
			role: 'EMPLOYEE' // Temporalmente EMPLOYEE hasta actualizar el schema
		}
	});
	console.log('Usuario cajero creado:', { username: cashier.username });

	// Crear clientes de ejemplo
	const customer1 = await prisma.customer.create({
		data: {
			name: 'Juan Pérez',
			phone: '555-0123',
			email: 'juan.perez@email.com',
			address: 'Calle Principal 123'
		}
	});

	const customer2 = await prisma.customer.create({
		data: {
			name: 'María García',
			phone: '555-0124',
			email: 'maria.garcia@email.com',
			address: 'Avenida Central 456'
		}
	});

	const customer3 = await prisma.customer.create({
		data: {
			name: 'Pedro López',
			phone: '555-0125',
			address: 'Plaza Mayor 789'
		}
	});

	console.log('Clientes creados');

	// Crear reparaciones de ejemplo
	await prisma.repair.create({
		data: {
			repairNumber: '000001',
			customerId: customer1.id,
			technicianId: juan.id,
			deviceType: 'Celular',
			brand: 'Samsung',
			model: 'Galaxy S21',
			issue: 'Pantalla rota',
			status: 'IN_REPAIR',
			priority: 'HIGH',
			estimatedCost: 200,
			progress: 50,
			notes: {
				create: [
					{
						text: 'sin cargador',
						authorId: juan.id
					}
				]
			}
		}
	});

	await prisma.repair.create({
		data: {
			repairNumber: '000002',
			customerId: customer2.id,
			technicianId: rodrigo.id,
			deviceType: 'Laptop',
			brand: 'HP',
			model: 'Pavilion 15',
			issue: 'No enciende',
			status: 'IN_REVIEW',
			priority: 'MEDIUM',
			progress: 25,
			notes: {
				create: [
					{
						text: 'Revisando fuente de alimentación',
						authorId: rodrigo.id
					}
				]
			}
		}
	});

	await prisma.repair.create({
		data: {
			repairNumber: '000003',
			customerId: customer3.id,
			deviceType: 'Tablet',
			brand: 'iPad',
			model: 'Air 4',
			issue: 'Batería no carga',
			status: 'UNASSIGNED',
			priority: 'LOW',
			progress: 0,
			notes: {
				create: [
					{
						text: 'Pendiente de asignación',
						authorId: employee.id
					}
				]
			}
		}
	});

	console.log('Reparaciones de ejemplo creadas');
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