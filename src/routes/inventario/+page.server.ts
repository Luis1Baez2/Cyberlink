import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const selectedCategory = url.searchParams.get('category') || 'all';
	const searchTerm = url.searchParams.get('search') || '';
	const lowStockLimit = url.searchParams.get('lowStock') ? parseInt(url.searchParams.get('lowStock')) : null;
	
	// Construir filtro basado en la categoría seleccionada
	let productFilter = {};
	
	// Agregar filtro de búsqueda si existe
	if (searchTerm) {
		productFilter = {
			OR: [
				{ code: { contains: searchTerm } },
				{ name: { contains: searchTerm } },
				{ category: { name: { contains: searchTerm } } }
			]
		};
	}
	
	// Combinar con filtro de categoría si existe
	if (selectedCategory !== 'all') {
		const categoryId = parseInt(selectedCategory);
		if (!isNaN(categoryId)) {
			// Buscar por ID de categoría o subcategoría
			const category = await db.category.findUnique({
				where: { id: categoryId },
				include: { children: true }
			});
			
			if (category) {
				const categoryFilter = {};
				if (category.children.length > 0) {
					// Es una categoría padre, buscar en todas sus subcategorías
					const childIds = category.children.map(c => c.id);
					categoryFilter.categoryId = { in: [category.id, ...childIds] };
				} else {
					// Es una subcategoría o categoría sin hijos
					categoryFilter.categoryId = categoryId;
				}
				
				// Combinar filtros si hay búsqueda
				if (searchTerm) {
					productFilter = {
						AND: [productFilter, categoryFilter]
					};
				} else {
					productFilter = categoryFilter;
				}
			}
		}
	}

	// Agregar filtro de stock bajo si existe
	if (lowStockLimit !== null && lowStockLimit >= 0) {
		const stockFilter = { stock: { lte: lowStockLimit } };
		if (Object.keys(productFilter).length > 0) {
			if (productFilter.AND) {
				productFilter.AND.push(stockFilter);
			} else {
				productFilter = { AND: [productFilter, stockFilter] };
			}
		} else {
			productFilter = stockFilter;
		}
	}

	const products = await db.product.findMany({
		where: productFilter,
		include: {
			category: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// Obtener categorías con estructura jerárquica
	const categories = await db.category.findMany({
		where: { parentId: null }, // Solo categorías principales
		include: {
			children: {
				orderBy: { name: 'asc' }
			}
		},
		orderBy: {
			name: 'asc'
		}
	});

	// Obtener todas las categorías para el select del formulario
	const allCategories = await db.category.findMany({
		orderBy: {
			name: 'asc'
		}
	});

	// Estadísticas por categoría
	const categoryStats = {};
	
	// Estadísticas para categorías principales (incluyendo subcategorías)
	for (const category of categories) {
		const childIds = category.children.map(c => c.id);
		const count = await db.product.count({
			where: {
				categoryId: { in: [category.id, ...childIds] }
			}
		});
		categoryStats[category.id] = count;
		
		// Estadísticas para subcategorías
		for (const child of category.children) {
			const childCount = await db.product.count({
				where: { categoryId: child.id }
			});
			categoryStats[child.id] = childCount;
		}
	}

	return {
		user: locals.user,
		products,
		categories,
		allCategories,
		selectedCategory,
		searchTerm,
		lowStockLimit,
		categoryStats
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const categoryId = parseInt(data.get('categoryId')?.toString() || '0');
		const price = parseFloat(data.get('price')?.toString() || '0');
		const cost = parseFloat(data.get('cost')?.toString() || '0');
		const stock = parseInt(data.get('stock')?.toString() || '0');
		const minStock = parseInt(data.get('minStock')?.toString() || '0');

		if (!name || !categoryId || categoryId === 0) {
			return fail(400, { error: 'Nombre y categoría son obligatorios' });
		}

		try {
			// Generar código automático incremental
			const lastProduct = await db.product.findFirst({
				orderBy: { id: 'desc' }
			});
			const nextCode = lastProduct ? (parseInt(lastProduct.code) + 1).toString().padStart(6, '0') : '000001';

			await db.product.create({
				data: {
					code: nextCode,
					name,
					categoryId,
					price,
					cost,
					stock,
					minStock
				}
			});
		} catch (error) {
			return fail(400, { error: 'Error al crear el producto' });
		}

		return { success: true, message: 'Producto creado exitosamente' };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString();
		const categoryId = parseInt(data.get('categoryId')?.toString() || '0');
		const price = parseFloat(data.get('price')?.toString() || '0');
		const cost = parseFloat(data.get('cost')?.toString() || '0');
		const stock = parseInt(data.get('stock')?.toString() || '0');
		const minStock = parseInt(data.get('minStock')?.toString() || '0');

		if (!id || !name || !categoryId || categoryId === 0) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		try {
			await db.product.update({
				where: { id: parseInt(id) },
				data: {
					name,
					categoryId,
					price,
					cost,
					stock,
					minStock
				}
			});
		} catch (error) {
			return fail(400, { error: 'Error al actualizar el producto' });
		}

		return { success: true, message: 'Producto actualizado exitosamente' };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID del producto es obligatorio' });
		}

		try {
			await db.product.delete({
				where: { id: parseInt(id) }
			});
		} catch (error) {
			return fail(400, { error: 'Error al eliminar el producto' });
		}

		return { success: true, message: 'Producto eliminado exitosamente' };
	},

	notify: async ({ request, locals }) => {
		const data = await request.formData();
		const productName = data.get('productName')?.toString() || '';
		const productCode = data.get('productCode')?.toString() || '';
		const currentStock = parseInt(data.get('currentStock')?.toString() || '0');
		const minStock = parseInt(data.get('minStock')?.toString() || '0');
		const quantity = parseInt(data.get('quantity')?.toString() || '1');
		const purchaseLink = data.get('purchaseLink')?.toString() || '';
		const observations = data.get('observations')?.toString() || '';

		if (!productName || !productCode) {
			return fail(400, { error: 'Datos del producto incompletos' });
		}

		if (!locals.user) {
			return fail(401, { error: 'Usuario no autenticado' });
		}

		try {
			// Primero buscar o crear un cliente "SISTEMA" para notificaciones de inventario
			let systemCustomer = await db.customer.findFirst({
				where: { phone: 'SISTEMA' }
			});

			if (!systemCustomer) {
				systemCustomer = await db.customer.create({
					data: {
						name: 'SISTEMA - Notificaciones de Inventario',
						phone: 'SISTEMA',
						email: null,
						address: 'N/A'
					}
				});
			}

			// Generar número de reparación único para notificación de inventario
			const lastRepair = await db.repair.findFirst({
				orderBy: { repairNumber: 'desc' }
			});
			const nextNumber = lastRepair ? (parseInt(lastRepair.repairNumber) + 1).toString().padStart(6, '0') : '000001';

			// Crear una "reparación" especial para notificación de inventario
			const repair = await db.repair.create({
				data: {
					repairNumber: nextNumber,
					customerId: systemCustomer.id,
					deviceType: 'INVENTARIO',
					brand: 'REPOSICIÓN',
					model: productName,
					issue: `Stock bajo del producto: ${productName} (Código: ${productCode}). Stock actual: ${currentStock}, Stock mínimo: ${minStock}`,
					diagnosis: `Solicitado por: ${locals.user.name} (${locals.user.username}). Cantidad solicitada: ${quantity} unidades.${observations ? ' Observaciones: ' + observations : ''}`,
					status: 'WAITING_PARTS',
					partsStatus: 'PENDING',
					estimatedCost: 0,
					purchaseLink: purchaseLink || '',
					partsDescription: `Reposición de inventario: ${productName} (${productCode}) - Cantidad solicitada: ${quantity} unidades`
				}
			});

			// Crear una nota con la información del solicitante
			await db.note.create({
				data: {
					text: `📦 Solicitud de compra creada por ${locals.user.name}. Cantidad: ${quantity} unidades.${purchaseLink ? ' Link de compra proporcionado.' : ''}${observations ? ' Observaciones: ' + observations : ''}`,
					repairId: repair.id,
					authorId: locals.user.id
				}
			});

			console.log('✅ Notificación de inventario creada como reparación:', repair.repairNumber);

		} catch (error) {
			console.error('❌ Error al crear notificación:', error);
			return fail(400, { error: 'Error al crear la notificación de compra' });
		}

		return { success: true, message: 'Notificación enviada exitosamente. El dueño la verá en la sección de Compras.' };
	}
};