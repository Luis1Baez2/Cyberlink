import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let pendingPartsCount = 0;

	// Si es el dueño, obtener cantidad de repuestos pendientes
	if (locals.user && locals.user.username === 'dueño') {
		const { prisma } = await import('$lib/server/prisma');
		
		try {
			// Contar SOLO reparaciones en estado WAITING_PARTS que NO hayan sido compradas
			console.log('🔍 Consultando repuestos pendientes...');
			
			// Primero, obtener TODAS las reparaciones con link para debug
			const allRepairsWithLink = await prisma.repair.findMany({
				where: {
					purchaseLink: { not: null }
				},
				select: {
					id: true,
					repairNumber: true,
					status: true,
					partsStatus: true,
					purchaseLink: true,
					partsDescription: true
				}
			});
			
			console.log('🔗 TODAS las reparaciones con link:', allRepairsWithLink.length);
			allRepairsWithLink.forEach(r => {
				console.log(`  - #${r.repairNumber}: status=${r.status}, partsStatus=${r.partsStatus}`);
			});

			// Ahora obtener solo las que están en WAITING_PARTS
			const repairs = await prisma.repair.findMany({
				where: {
					status: 'WAITING_PARTS'
				},
				select: {
					id: true,
					repairNumber: true,
					status: true,
					partsStatus: true,
					purchaseLink: true,
					partsDescription: true
				}
			});
			
			console.log('📊 Reparaciones encontradas:', repairs.length);
			repairs.forEach(r => {
				console.log(`  - #${r.repairNumber}: status=${r.status}, partsStatus=${r.partsStatus}, hasLink=${!!r.purchaseLink}`);
			});
			
			// Filtrar solo las que realmente están pendientes de compra
			const filteredRepairs = repairs.filter(r => 
				r.status === 'WAITING_PARTS' && 
				r.partsStatus !== 'PURCHASED' && 
				r.partsStatus !== 'RECEIVED'
			);
			
			pendingPartsCount = filteredRepairs.length;
			console.log('✅ Repuestos pendientes de compra:', pendingPartsCount);
			
		} catch (error) {
			console.error('❌ Error consultando repuestos:', error);
			pendingPartsCount = 0;
		}
	}

	return {
		user: locals.user,
		pendingPartsCount
	};
};