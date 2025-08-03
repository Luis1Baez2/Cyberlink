import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Los técnicos no pueden acceder al dashboard principal
	if (locals.user.role === 'TECHNICIAN') {
		throw redirect(302, '/reparaciones');
	}

	let pendingPartsCount = 0;

	// Si es el dueño, obtener cantidad de repuestos pendientes
	if (locals.user.username === 'dueño') {
		const { db } = await import('$lib/server/db');
		
		try {
			// Contar solo reparaciones en estado WAITING_PARTS
			pendingPartsCount = await db.repair.count({
				where: {
					status: 'WAITING_PARTS'
				}
			});
		} catch (error) {
			// Si falla, usar método alternativo
			console.log('Usando método alternativo para contar repuestos');
			pendingPartsCount = await db.repair.count({
				where: {
					status: 'WAITING_PARTS'
				}
			});
		}
	}

	return {
		user: locals.user,
		pendingPartsCount
	};
};