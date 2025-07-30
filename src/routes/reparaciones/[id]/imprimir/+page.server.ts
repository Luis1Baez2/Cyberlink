import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const repair = await prisma.repair.findUnique({
			where: {
				id: params.id
			},
			include: {
				customer: true,
				technician: true,
				parts: true,
				notes: {
					include: {
						author: true
					},
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		});

		if (!repair) {
			throw error(404, 'Reparación no encontrada');
		}

		return {
			repair
		};
	} catch (err) {
		console.error('Error cargando reparación:', err);
		throw error(500, 'Error al cargar la reparación');
	}
};