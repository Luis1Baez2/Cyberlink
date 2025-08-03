import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const selectedStatus = url.searchParams.get('status') || 'all';
	const searchTerm = url.searchParams.get('search') || '';
	
	// Construir filtro base
	let baseFilter = {};
	
	// Filtrar por estado
	if (selectedStatus !== 'all') {
		if (selectedStatus === 'unassigned') {
			baseFilter.status = 'UNASSIGNED';
		} else if (selectedStatus === 'inRepair') {
			baseFilter.status = { in: ['IN_REVIEW', 'IN_REPAIR'] };
		} else if (selectedStatus === 'completed') {
			baseFilter.status = 'COMPLETED';
		} else {
			baseFilter.status = selectedStatus;
		}
	} else {
		// Para 'all', excluir retiradas y canceladas
		baseFilter.status = { notIn: ['RETIRADO', 'CANCELLED'] };
	}
	
	// Agregar filtro de búsqueda si existe
	let repairFilter = baseFilter;
	if (searchTerm && searchTerm.length >= 2) {
		repairFilter = {
			AND: [
				baseFilter,
				{
					OR: [
						{ repairNumber: { contains: searchTerm } },
						{ customer: { name: { contains: searchTerm } } },
						{ brand: { contains: searchTerm } },
						{ model: { contains: searchTerm } }
					]
				}
			]
		};
	}
	
	try {
		// Obtener reparaciones filtradas
		const repairs = await db.repair.findMany({
			where: repairFilter,
			include: {
				customer: true,
				technician: true
			},
			orderBy: {
				receivedDate: 'desc'
			},
			take: 50 // Limitar a 50 reparaciones para performance
		});
		
		// Calcular estadísticas (excluyendo retiradas y canceladas)
		const allRepairs = await db.repair.findMany({
			where: {
				status: { notIn: ['RETIRADO', 'CANCELLED'] }
			}
		});
		
		const stats = {
			unassigned: allRepairs.filter(r => r.status === 'UNASSIGNED').length,
			inRepair: allRepairs.filter(r => ['IN_REVIEW', 'IN_REPAIR'].includes(r.status)).length,
			waitingParts: allRepairs.filter(r => r.status === 'WAITING_PARTS').length,
			completed: allRepairs.filter(r => r.status === 'COMPLETED').length
		};
		
		return json({
			repairs,
			stats
		});
	} catch (error) {
		console.error('Error cargando reparaciones:', error);
		return json({
			repairs: [],
			stats: {
				unassigned: 0,
				inRepair: 0,
				waitingParts: 0,
				completed: 0
			}
		});
	}
};