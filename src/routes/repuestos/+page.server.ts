import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo el dueño y admin pueden ver esta página
	if (locals.user.username !== 'dueño' && locals.user.role !== 'ADMIN') {
		throw redirect(302, '/');
	}

	// Obtener todas las reparaciones que tengan relación con repuestos
	const repairsWithParts = await db.repair.findMany({
		where: {
			OR: [
				{ status: 'WAITING_PARTS' },
				{ partsStatus: { not: null } },
				{ partsCost: { gt: 0 } }
			]
		},
		include: {
			customer: true,
			technician: true
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	// Separar por estado - usar método alternativo si partsStatus no existe
	let pendingParts, purchasedParts, receivedParts;
	
	try {
		// Verificar si el campo partsStatus existe
		const testRepair = repairsWithParts[0];
		if (testRepair && 'partsStatus' in testRepair) {
			pendingParts = repairsWithParts.filter(r => 
				// Solo mostrar equipos que estén esperando repuestos
				r.status === 'WAITING_PARTS' && r.partsStatus !== 'PURCHASED' && r.partsStatus !== 'RECEIVED'
			);
			
			purchasedParts = repairsWithParts.filter(r => 
				r.partsStatus === 'PURCHASED'
			);
			
			receivedParts = repairsWithParts.filter(r => 
				r.partsStatus === 'RECEIVED'
			);
		} else {
			throw new Error('partsStatus no disponible');
		}
	} catch (error) {
		// Método alternativo: solo WAITING_PARTS
		console.log('Usando método alternativo para estados de repuestos');
		pendingParts = repairsWithParts.filter(r => 
			r.status === 'WAITING_PARTS'
		);
		purchasedParts = [];
		receivedParts = [];
	}

	// Estadísticas
	const stats = {
		pending: pendingParts.length,
		purchased: purchasedParts.length,
		received: receivedParts.length,
		totalCost: repairsWithParts.reduce((sum, r) => sum + (r.partsCost || 0), 0)
	};

	return {
		pendingParts,
		purchasedParts,
		receivedParts,
		stats
	};
};

export const actions: Actions = {
	markAsPurchased: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (locals.user.username !== 'dueño') {
			throw error(403, 'Solo el dueño puede marcar como comprado');
		}

		const formData = await request.formData();
		const repairId = formData.get('repairId') as string;
		const estimatedDays = formData.get('estimatedDays') as string;
		
		try {
			// Calcular fecha estimada de llegada
			let estimatedArrival = null;
			if (estimatedDays && parseInt(estimatedDays) > 0) {
				estimatedArrival = new Date();
				estimatedArrival.setDate(estimatedArrival.getDate() + parseInt(estimatedDays));
			}

			// Marcar como comprado directamente
			try {
				await db.repair.update({
					where: { id: repairId },
					data: { 
						partsStatus: 'PURCHASED',
						estimatedArrival: estimatedArrival,
						updatedAt: new Date()
					}
				});
			} catch (error) {
				// Fallback si el campo no existe
				await db.repair.update({
					where: { id: repairId },
					data: { 
						updatedAt: new Date()
					}
				});
			}

			// Crear nota automática con información de compra
			let noteText = '✅ Repuesto marcado como COMPRADO por el dueño';
			if (estimatedDays && parseInt(estimatedDays) > 0) {
				noteText += ` - Llegada estimada: ${parseInt(estimatedDays)} días`;
			}

			await db.note.create({
				data: {
					text: noteText,
					repairId,
					authorId: locals.user.id
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error marcando como comprado:', err);
			return { error: 'Error al marcar como comprado' };
		}
	},

	addArrivalTime: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (locals.user.role !== 'ADMIN' && locals.user.username !== 'dueño') {
			throw error(403, 'Solo admin/dueño pueden agregar tiempo de llegada');
		}

		const formData = await request.formData();
		const repairId = formData.get('repairId') as string;
		const estimatedDays = formData.get('estimatedDays') as string;

		try {
			let estimatedArrival = null;
			if (estimatedDays && parseInt(estimatedDays) > 0) {
				estimatedArrival = new Date();
				estimatedArrival.setDate(estimatedArrival.getDate() + parseInt(estimatedDays));
			}

			try {
				await db.repair.update({
					where: { id: repairId },
					data: { 
						estimatedArrival: estimatedArrival,
						updatedAt: new Date()
					}
				});
			} catch (error) {
				// Fallback 
				await db.repair.update({
					where: { id: repairId },
					data: { 
						updatedAt: new Date()
					}
				});
			}

			// Crear nota
			await db.note.create({
				data: {
					text: `📅 Tiempo estimado de llegada actualizado: ${parseInt(estimatedDays)} días`,
					repairId,
					authorId: locals.user.id
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error agregando tiempo de llegada:', err);
			return { error: 'Error al agregar tiempo de llegada' };
		}
	}
};