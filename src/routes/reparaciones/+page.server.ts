import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Verificar permisos
	if (!['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(locals.user.role)) {
		throw redirect(302, '/');
	}

	try {
		// Obtener reparaciones con información relacionada
		let repairs;
		
		if (locals.user.role === 'TECHNICIAN') {
			// Los técnicos solo ven sus reparaciones asignadas que NO estén terminadas o entregadas
			repairs = await db.repair.findMany({
				where: {
					technicianId: locals.user.id,
					NOT: {
						status: {
							in: ['COMPLETED', 'DELIVERED']
						}
					}
				},
				include: {
					customer: true,
					technician: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			});
		} else {
			// Admin y Manager ven todas las reparaciones
			repairs = await db.repair.findMany({
				include: {
					customer: true,
					technician: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			});
		}

		// Obtener lista de técnicos para el filtro (solo para admin y manager)
		let technicians = [];
		if (['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			technicians = await db.user.findMany({
				where: { role: 'TECHNICIAN' },
				select: {
					id: true,
					name: true
				},
				orderBy: {
					name: 'asc'
				}
			});
		}

		return {
			user: locals.user,
			repairs,
			technicians
		};
	} catch (error) {
		console.error('Error cargando reparaciones:', error);
		return {
			user: locals.user,
			repairs: [],
			technicians: []
		};
	}
};