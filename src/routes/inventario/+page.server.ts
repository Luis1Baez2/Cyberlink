import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const searchTerm = url.searchParams.get('search') || '';
	const lowStockLimit = url.searchParams.get('lowStock') ? parseInt(url.searchParams.get('lowStock')) : null;
	
	// Construir filtro basado en búsqueda y stock
	let productFilter: any = {};
	
	// Agregar filtro de búsqueda si existe
	if (searchTerm) {
		productFilter = {
			OR: [
				{ codigo: { contains: searchTerm } },
				{ nombre: { contains: searchTerm } },
				{ categoria: { nombre: { contains: searchTerm } } }
			]
		};
	}

	// Agregar filtro de stock bajo si existe
	if (lowStockLimit !== null && lowStockLimit >= 0) {
		const stockFilter = { stock: { lte: lowStockLimit } };
		if (Object.keys(productFilter).length > 0) {
			productFilter = { AND: [productFilter, stockFilter] };
		} else {
			productFilter = stockFilter;
		}
	}

	const rawProducts = await db.producto.findMany({
		where: productFilter,
		include: {
			categoria: true
		},
		orderBy: {
			creadoEn: 'desc'
		}
	});
	
	// Mapear productos del español al inglés para el frontend
	const products = rawProducts.map(p => ({
		id: p.id,
		code: p.codigo,
		name: p.nombre,
		description: p.descripcion,
		brand: p.marca,
		model: p.modelo,
		categoryId: p.categoriaId,
		price: p.precio,
		cost: p.costo,
		stock: p.stock,
		minStock: p.stockMinimo,
		status: p.estado,
		imageUrl: p.urlImagen,
		createdAt: p.creadoEn,
		updatedAt: p.actualizadoEn,
		category: p.categoria ? {
			id: p.categoria.id,
			name: p.categoria.nombre,
			description: p.categoria.descripcion,
			parentId: p.categoria.padreId
		} : null
	}));

	return {
		user: locals.user,
		products,
		searchTerm,
		lowStockLimit,
		selectedCategory: 'all'
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const categoryName = data.get('category')?.toString();
		const price = parseFloat(data.get('price')?.toString() || '0');
		const cost = parseFloat(data.get('cost')?.toString() || '0');
		const stock = parseInt(data.get('stock')?.toString() || '0');
		const minStock = parseInt(data.get('minStock')?.toString() || '0');

		if (!name || !categoryName) {
			return fail(400, { error: 'Nombre y categoría son obligatorios' });
		}

		try {
			// Buscar o crear la categoría
			let category = await db.categoria.findFirst({
				where: { 
					nombre: {
						equals: categoryName,
						mode: 'insensitive'
					}
				}
			});

			if (!category) {
				// Crear nueva categoría si no existe
				category = await db.categoria.create({
					data: {
						nombre: categoryName,
						descripcion: `Categoría ${categoryName}`
					}
				});
			}

			// Generar código automático incremental
			const lastProduct = await db.producto.findFirst({
				orderBy: { id: 'desc' }
			});
			const nextCode = lastProduct ? (parseInt(lastProduct.codigo) + 1).toString().padStart(6, '0') : '000001';

			await db.producto.create({
				data: {
					codigo: nextCode,
					nombre: name,
					categoriaId: category.id,
					precio: price,
					costo: cost,
					stock: stock,
					stockMinimo: minStock
				}
			});
		} catch (error) {
			console.error('Error creando producto:', error);
			return fail(400, { error: 'Error al crear el producto' });
		}

		return { success: true, message: 'Producto creado exitosamente' };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString();
		const categoryName = data.get('category')?.toString();
		const price = parseFloat(data.get('price')?.toString() || '0');
		const cost = parseFloat(data.get('cost')?.toString() || '0');
		const stock = parseInt(data.get('stock')?.toString() || '0');
		const minStock = parseInt(data.get('minStock')?.toString() || '0');

		if (!id || !name || !categoryName) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		try {
			// Buscar o crear la categoría
			let category = await db.categoria.findFirst({
				where: { 
					nombre: {
						equals: categoryName,
						mode: 'insensitive'
					}
				}
			});

			if (!category) {
				// Crear nueva categoría si no existe
				category = await db.categoria.create({
					data: {
						nombre: categoryName,
						descripcion: `Categoría ${categoryName}`
					}
				});
			}

			await db.producto.update({
				where: { id: parseInt(id) },
				data: {
					nombre: name,
					categoriaId: category.id,
					precio: price,
					costo: cost,
					stock: stock,
					stockMinimo: minStock
				}
			});
		} catch (error) {
			console.error('Error actualizando producto:', error);
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
			await db.producto.delete({
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
			let systemCustomer = await db.cliente.findFirst({
				where: { telefono: 'SISTEMA' }
			});

			if (!systemCustomer) {
				systemCustomer = await db.cliente.create({
					data: {
						nombre: 'SISTEMA - Notificaciones de Inventario',
						telefono: 'SISTEMA',
						correo: null,
						direccion: 'N/A'
					}
				});
			}

			// Generar número de reparación único para notificación de inventario
			const lastRepair = await db.reparacion.findFirst({
				orderBy: { numeroReparacion: 'desc' }
			});
			const nextNumber = lastRepair ? (parseInt(lastRepair.numeroReparacion) + 1).toString().padStart(6, '0') : '000001';

			// Crear una "reparación" especial para notificación de inventario
			const repair = await db.reparacion.create({
				data: {
					numeroReparacion: nextNumber,
					clienteId: systemCustomer.id,
					tipoDispositivo: 'INVENTARIO',
					marca: 'REPOSICIÓN',
					modelo: productName,
					problema: `Stock bajo del producto: ${productName} (Código: ${productCode}). Stock actual: ${currentStock}, Stock mínimo: ${minStock}`,
					diagnostico: `Solicitado por: ${locals.user.name} (${locals.user.username}). Cantidad solicitada: ${quantity} unidades.${observations ? ' Observaciones: ' + observations : ''}`,
					estado: 'ESPERANDO_REPUESTO',
					estadoPartes: 'PENDIENTE',
					costoEstimado: 0,
					enlaceCompra: purchaseLink || '',
					descripcionPartes: `Reposición de inventario: ${productName} (${productCode}) - Cantidad solicitada: ${quantity} unidades`
				}
			});

			// Crear una nota con la información del solicitante
			if (locals.user?.id) {
				try {
					await db.nota.create({
						data: {
							texto: `📦 Solicitud de compra creada por ${locals.user.name}. Cantidad: ${quantity} unidades.${purchaseLink ? ' Link de compra proporcionado.' : ''}${observations ? ' Observaciones: ' + observations : ''}`,
							reparacionId: repair.id,
							autorId: locals.user.id
						}
					});
				} catch (noteError) {
					console.log('⚠️ No se pudo crear la nota de notificación:', noteError);
				}
			}

			console.log('✅ Notificación de inventario creada como reparación:', repair.numeroReparacion);

		} catch (error) {
			console.error('❌ Error al crear notificación:', error);
			return fail(400, { error: 'Error al crear la notificación de compra' });
		}

		return { success: true, message: 'Notificación enviada exitosamente. El dueño la verá en la sección de Compras.' };
	}
};