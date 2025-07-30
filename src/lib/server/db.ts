import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Evitar múltiples instancias de Prisma en desarrollo
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Crear una sola instancia
export const db = globalForPrisma.prisma ?? new PrismaClient({
	log: dev ? ['error', 'warn'] : ['error'],
});

// Solo en desarrollo, guardar la instancia globalmente
if (dev) {
	globalForPrisma.prisma = db;
}

// Función helper para asegurar la conexión
export async function connectDB() {
	try {
		await db.$connect();
		return true;
	} catch (error) {
		console.error('Error conectando a la base de datos:', error);
		// Reintentar conexión
		await new Promise(resolve => setTimeout(resolve, 100));
		try {
			await db.$connect();
			return true;
		} catch (retryError) {
			console.error('Error en reintento de conexión:', retryError);
			return false;
		}
	}
}