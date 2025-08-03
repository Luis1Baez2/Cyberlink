import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';
	
	if (searchTerm.length < 2) {
		return json([]);
	}
	
	try {
		const repairs = await db.repair.findMany({
			where: {
				AND: [
					{ status: { in: ['COMPLETED', 'DELIVERED'] } }, // Solo terminadas
					{
						OR: [
							{ repairNumber: { contains: searchTerm } },
							{ customer: { name: { contains: searchTerm } } },
							{ brand: { contains: searchTerm } },
							{ model: { contains: searchTerm } }
						]
					}
				]
			},
			include: {
				customer: true,
				technician: true
			},
			take: 20,
			orderBy: {
				createdAt: 'desc'
			}
		});
		
		return json(repairs);
	} catch (error) {
		console.error('Error buscando reparaciones:', error);
		return json([]);
	}
};