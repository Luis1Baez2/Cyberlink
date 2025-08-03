import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const productSearch = url.searchParams.get('productSearch') || '';
	const repairSearch = url.searchParams.get('repairSearch') || '';
	
	// Buscar productos con stock > 0
	let products = [];
	if (productSearch.length >= 2) {
		products = await db.product.findMany({
			where: {
				AND: [
					{ stock: { gt: 0 } }, // Solo productos con stock
					{
						OR: [
							{ code: { contains: productSearch } },
							{ name: { contains: productSearch } },
							{ brand: { contains: productSearch } }
						]
					}
				]
			},
			include: {
				category: true
			},
			take: 10 // Limitar resultados
		});
	}
	
	// Buscar reparaciones completadas y no facturadas
	let repairs = [];
	if (repairSearch.length >= 2) {
		repairs = await db.repair.findMany({
			where: {
				AND: [
					{ status: { in: ['COMPLETED', 'DELIVERED'] } }, // Solo terminadas
					{
						OR: [
							{ repairNumber: { contains: repairSearch } },
							{ customer: { name: { contains: repairSearch } } },
							{ brand: { contains: repairSearch } },
							{ model: { contains: repairSearch } }
						]
					}
				]
			},
			include: {
				customer: true,
				technician: true
			},
			take: 10 // Limitar resultados
		});
	}

	return {
		user: locals.user,
		products,
		repairs,
		productSearch,
		repairSearch
	};
};

export const actions: Actions = {
	addToCart: async ({ request }) => {
		const data = await request.formData();
		const type = data.get('type')?.toString(); // 'product' o 'repair'
		const itemId = data.get('itemId')?.toString();
		const quantity = parseInt(data.get('quantity')?.toString() || '1');

		// TODO: Implementar lógica del carrito (usar sesión o base de datos temporal)
		console.log('Agregando al carrito:', { type, itemId, quantity });
		
		return { success: true, message: 'Item agregado al carrito' };
	},

	createInvoice: async ({ request, locals }) => {
		const data = await request.formData();
		
		try {
			// Generar número de orden automático incremental
			const lastOrder = await db.order.findFirst({
				orderBy: { id: 'desc' }
			});
			const nextOrderNumber = lastOrder ? (parseInt(lastOrder.orderNumber) + 1).toString().padStart(6, '0') : '000001';
			
			// TODO: Implementar lógica completa de creación de factura con items del carrito
			console.log('Creando factura con número:', nextOrderNumber);
			
			return { success: true, message: `Factura ${nextOrderNumber} creada exitosamente` };
		} catch (error) {
			return fail(500, { error: 'Error al crear la factura' });
		}
	}
};