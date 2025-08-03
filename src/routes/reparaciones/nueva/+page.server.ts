import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Obtener lista de clientes
		const customers = await db.customer.findMany({
			orderBy: {
				name: 'asc'
			}
		});

		// Obtener lista de técnicos
		const technicians = await db.user.findMany({
			where: {
				role: 'TECHNICIAN'
			},
			select: {
				id: true,
				name: true
			},
			orderBy: {
				name: 'asc'
			}
		});

		return {
			user: locals.user,
			customers,
			technicians
		};
	} catch (error) {
		console.error('Error cargando datos:', error);
		return {
			user: locals.user,
			customers: [],
			technicians: []
		};
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		
		// Extraer datos del formulario
		const customerId = formData.get('customerId') as string;
		const customerName = formData.get('customerName') as string;
		const customerPhone = formData.get('customerPhone') as string;
		const customerEmail = formData.get('customerEmail') as string;
		const customerAddress = formData.get('customerAddress') as string;
		
		let deviceType = formData.get('deviceType') as string;
		const customDeviceType = formData.get('customDeviceType') as string;
		if (deviceType === 'Otros' && customDeviceType) {
			deviceType = customDeviceType;
		} else if (deviceType === 'Otros' && !customDeviceType) {
			return fail(400, { error: 'Debe especificar el tipo de dispositivo' });
		}
		
		let brand = formData.get('brand') as string;
		const customBrand = formData.get('customBrand') as string;
		if (brand === 'Otros' && customBrand) {
			brand = customBrand;
		} else if (brand === 'Otros' && !customBrand) {
			return fail(400, { error: 'Debe especificar la marca' });
		}
		
		const model = formData.get('model') as string;
		const serialNumber = formData.get('serialNumber') as string;
		const issue = formData.get('issue') as string;
		const notes = formData.get('notes') as string;
		
		// Validar campos requeridos
		if (!deviceType || !brand || !model || !issue) {
			return fail(400, { error: 'Por favor complete todos los campos requeridos' });
		}

		console.log('Datos recibidos:', {
			customerId,
			customerName,
			customerPhone,
			deviceType,
			brand,
			model,
			issue
		});

		try {
			// Determinar o crear el cliente
			let finalCustomerId = customerId;
			
			if (!customerId && customerName && customerPhone) {
				// Primero buscar si ya existe un cliente con ese teléfono
				const existingCustomer = await db.customer.findFirst({
					where: {
						phone: customerPhone
					}
				});
				
				if (existingCustomer) {
					// Si existe, actualizar sus datos si es necesario
					const updateData: any = {
						name: customerName
					};
					
					// Solo actualizar email si se proporciona y es diferente
					if (customerEmail && customerEmail.trim() !== '' && existingCustomer.email !== customerEmail) {
						updateData.email = customerEmail;
					}
					
					// Solo actualizar dirección si se proporciona
					if (customerAddress && customerAddress.trim() !== '') {
						updateData.address = customerAddress;
					}
					
					// Solo actualizar si hay cambios
					if (Object.keys(updateData).length > 0) {
						await db.customer.update({
							where: { id: existingCustomer.id },
							data: updateData
						});
					}
					
					finalCustomerId = existingCustomer.id;
				} else {
					// Si no existe, crear nuevo cliente
					const customerData: any = {
						name: customerName,
						phone: customerPhone
					};
					
					// Solo agregar email si no está vacío
					if (customerEmail && customerEmail.trim() !== '') {
						customerData.email = customerEmail;
					}
					
					// Solo agregar dirección si no está vacía
					if (customerAddress && customerAddress.trim() !== '') {
						customerData.address = customerAddress;
					}
					
					try {
						const newCustomer = await db.customer.create({
							data: customerData
						});
						finalCustomerId = newCustomer.id;
					} catch (createError: any) {
						// Si el error es por email duplicado, buscar el cliente con ese email
						if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
							const existingCustomerByEmail = await db.customer.findFirst({
								where: {
									email: customerEmail
								}
							});
							
							if (existingCustomerByEmail) {
								// Actualizar los datos del cliente existente
								await db.customer.update({
									where: { id: existingCustomerByEmail.id },
									data: {
										name: customerName,
										phone: customerPhone,
										address: customerAddress || existingCustomerByEmail.address
									}
								});
								finalCustomerId = existingCustomerByEmail.id;
							} else {
								throw createError;
							}
						} else {
							throw createError;
						}
					}
				}
			}

			if (!finalCustomerId) {
				return fail(400, { error: 'Debe seleccionar un cliente o crear uno nuevo' });
			}

			// Generar número de orden único
			const lastRepair = await db.repair.findFirst({
				orderBy: {
					createdAt: 'desc'
				}
			});

			let nextNumber = 1;
			if (lastRepair && lastRepair.repairNumber) {
				// Extraer solo el número de la orden anterior
				const lastNumber = parseInt(lastRepair.repairNumber.replace(/\D/g, ''));
				if (!isNaN(lastNumber)) {
					nextNumber = lastNumber + 1;
				}
			}

			const repairNumber = nextNumber.toString().padStart(6, '0'); // Formato: 000001, 000002, etc.

			// Crear la reparación
			const repair = await db.repair.create({
				data: {
					repairNumber,
					customerId: finalCustomerId,
					deviceType,
					brand,
					model,
					serialNumber: serialNumber || null,
					issue,
					technicianId: null,
					priority: 'MEDIUM',
					estimatedCost: null,
					estimatedDate: null,
					status: 'UNASSIGNED',
					progress: 0,
					receivedDate: new Date(),
					notes: notes ? {
						create: {
							text: notes,
							authorId: locals.user?.id || 'cmdjiki4o0001eqdsexyjyar8' // ID del admin por defecto
						}
					} : undefined
				}
			});

			console.log('✅ Reparación creada exitosamente:', repair.id);
			
			// Redirigir a la página de detalles de la reparación con flag para imprimir y número de orden
			throw redirect(302, `/reparaciones/${repair.id}?print=true&created=true&orderNumber=${repair.repairNumber}`);
		} catch (error) {
			// Si es un redirect, lanzarlo (es parte del flujo normal, no un error)
			if (error instanceof Response) {
				throw error;
			}
			
			console.error('❌ Error real creando reparación:', error);
			return fail(500, { error: 'Error al crear la reparación. Por favor intente nuevamente.' });
		}
	}
};