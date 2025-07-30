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
		const { prisma } = await import('$lib/server/prisma');
		
		try {
			// Contar reparaciones en estado WAITING_PARTS o con link de compra
			pendingPartsCount = await prisma.repair.count({
				where: {
					OR: [
						// Reparaciones en espera de repuesto
						{ status: 'WAITING_PARTS' },
						// O reparaciones con link de compra pendiente
						{
							purchaseLink: {
								not: null
							},
							OR: [
								{ partsStatus: null },
								{ partsStatus: 'PENDING' }
							]
						}
					]
				}
			});
		} catch (error) {
			// Si falla, usar método alternativo
			console.log('Usando método alternativo para contar repuestos');
			pendingPartsCount = await prisma.repair.count({
				where: {
					OR: [
						{ status: 'WAITING_PARTS' },
						{
							purchaseLink: {
								not: null
							},
							partsCost: {
								not: null
							}
						}
					]
				}
			});
		}
	}

	return {
		user: locals.user,
		pendingPartsCount
	};
};