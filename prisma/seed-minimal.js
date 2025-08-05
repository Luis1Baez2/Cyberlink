import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
	log: ['error', 'warn'],
});

// Asegurar conexión antes de hacer operaciones
await prisma.$connect();

async function main() {
	// Contraseña para el usuario admin
	const hashedPassword = await bcrypt.hash('1234', 10);
	
	// Crear SOLO usuario dueño/admin
	const owner = await prisma.user.upsert({
		where: { username: 'admin' },
		update: { password: hashedPassword },
		create: {
			username: 'admin',
			password: hashedPassword,
			name: 'Administrador',
			role: 'ADMIN'
		}
	});
	console.log('Usuario admin creado:', { username: owner.username });
	console.log('✅ Base de datos inicializada con usuario admin únicamente');
	console.log('');
	console.log('Usuario: admin');
	console.log('Contraseña: 1234');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});