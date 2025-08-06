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
			rol: 'ADMIN'
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
			rol: 'EMPLEADO'
		}
	});
	console.log('Usuario vendedor creado:', { username: employee.nombreUsuario });

	// Crear técnico Juan
	const juan = await prisma.usuario.upsert({
		where: { nombreUsuario: 'juan' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'juan',
			contrasena: hashedPassword,
			nombre: 'Juan',
			rol: 'TECNICO'
		}
	});
	console.log('Técnico Juan creado:', { username: juan.nombreUsuario });

	// Crear técnico Rodrigo
	const rodrigo = await prisma.usuario.upsert({
		where: { nombreUsuario: 'rodrigo' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'rodrigo',
			contrasena: hashedPassword,
			nombre: 'Rodrigo',
			rol: 'TECNICO'
		}
	});
	console.log('Técnico Rodrigo creado:', { username: rodrigo.nombreUsuario });

	// Crear técnico Franco
	const franco = await prisma.usuario.upsert({
		where: { nombreUsuario: 'franco' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'franco',
			contrasena: hashedPassword,
			nombre: 'Franco',
			rol: 'TECNICO'
		}
	});
	console.log('Técnico Franco creado:', { username: franco.nombreUsuario });

	// Crear usuario cajero
	const cashier = await prisma.usuario.upsert({
		where: { nombreUsuario: 'cajero' },
		update: { contrasena: hashedPassword },
		create: {
			nombreUsuario: 'cajero',
			contrasena: hashedPassword,
			nombre: 'Cajero de Prueba',
			rol: 'EMPLEADO'
		}
	});
	console.log('Usuario cajero creado:', { username: cashier.nombreUsuario });

	// Crear clientes de ejemplo
	const customer1 = await prisma.cliente.create({
		data: {
			nombre: 'Juan Pérez',
			telefono: '555-0123',
			correo: 'juan.perez@email.com',
			direccion: 'Calle Principal 123'
		}
	});

	const customer2 = await prisma.cliente.create({
		data: {
			nombre: 'María García',
			telefono: '555-0124',
			correo: 'maria.garcia@email.com',
			direccion: 'Avenida Central 456'
		}
	});

	const customer3 = await prisma.cliente.create({
		data: {
			nombre: 'Pedro López',
			telefono: '555-0125',
			direccion: 'Plaza Mayor 789'
		}
	});

	console.log('Clientes creados');

	// Crear reparaciones de ejemplo
	await prisma.reparacion.create({
		data: {
			numeroReparacion: '000001',
			clienteId: customer1.id,
			tecnicoId: juan.id,
			tipoDispositivo: 'Celular',
			marca: 'Samsung',
			modelo: 'Galaxy S21',
			problema: 'Pantalla rota',
			estado: 'EN_REPARACION',
			prioridad: 'ALTA',
			costoEstimado: 200,
			progreso: 50,
			notas: {
				create: {
					texto: 'Cliente solicita presupuesto antes de proceder',
					autorId: admin.id
				}
			}
		}
	});

	await prisma.reparacion.create({
		data: {
			numeroReparacion: '000002',
			clienteId: customer2.id,
			tecnicoId: rodrigo.id,
			tipoDispositivo: 'Notebook',
			marca: 'Dell',
			modelo: 'Inspiron 15',
			problema: 'No enciende',
			estado: 'EN_REVISION',
			prioridad: 'MEDIA',
			progreso: 20
		}
	});

	await prisma.reparacion.create({
		data: {
			numeroReparacion: '000003',
			clienteId: customer3.id,
			tipoDispositivo: 'Monitor',
			marca: 'LG',
			modelo: '24MK430H',
			problema: 'Parpadea la imagen',
			estado: 'SIN_ASIGNAR',
			prioridad: 'BAJA',
			progreso: 0
		}
	});

	console.log('Reparaciones de ejemplo creadas');

	console.log('Seed completado exitosamente');
}

main()
	.catch((e) => {
		console.error('Error en seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});