import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const selectedCategory = url.searchParams.get('category') || 'all';
	const searchTerm = url.searchParams.get('search') || '';
	const lowStockLimit = url.searchParams.get('lowStock') ? parseInt(url.searchParams.get('lowStock')) : null;
	
	// Construir filtro basado en la categoría seleccionada
	let productFilter = {};
	
	// Agregar filtro de búsqueda si existe
	if (searchTerm && searchTerm.length >= 2) {
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
				if (searchTerm && searchTerm.length >= 2) {
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

	return json({
		products,
		categories,
		categoryStats
	});
};