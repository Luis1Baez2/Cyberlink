import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Obtener lista de clientes
		const rawCustomers = await db.cliente.findMany({
			orderBy: {
				nombre: 'asc'
			}
		});
		
		// Mapear los datos del español al inglés para el frontend
		const customers = rawCustomers.map(c => ({
			id: c.id,
			name: c.nombre,
			phone: c.telefono,
			email: c.correo,
			address: c.direccion
		}));

		// Obtener lista de técnicos
		const rawTechnicians = await db.usuario.findMany({
			where: {
				rol: 'TECNICO'
			},
			select: {
				id: true,
				nombre: true
			},
			orderBy: {
				nombre: 'asc'
			}
		});
		
		const technicians = rawTechnicians.map(t => ({
			id: t.id,
			name: t.nombre
		}));

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
				const existingCustomer = await db.cliente.findFirst({
					where: {
						telefono: customerPhone
					}
				});
				
				if (existingCustomer) {
					// Si existe, actualizar sus datos si es necesario
					const updateData: any = {
						nombre: customerName
					};
					
					// Solo actualizar email si se proporciona y es diferente
					if (customerEmail && customerEmail.trim() !== '' && existingCustomer.correo !== customerEmail) {
						updateData.correo = customerEmail;
					}
					
					// Solo actualizar dirección si se proporciona
					if (customerAddress && customerAddress.trim() !== '') {
						updateData.direccion = customerAddress;
					}
					
					// Solo actualizar si hay cambios
					if (Object.keys(updateData).length > 0) {
						await db.cliente.update({
							where: { id: existingCustomer.id },
							data: updateData
						});
					}
					
					finalCustomerId = existingCustomer.id;
				} else {
					// Si no existe, crear nuevo cliente
					const customerData: any = {
						nombre: customerName,
						telefono: customerPhone
					};
					
					// Solo agregar email si no está vacío
					if (customerEmail && customerEmail.trim() !== '') {
						customerData.correo = customerEmail;
					}
					
					// Solo agregar dirección si no está vacía
					if (customerAddress && customerAddress.trim() !== '') {
						customerData.direccion = customerAddress;
					}
					
					try {
						const newCustomer = await db.cliente.create({
							data: customerData
						});
						finalCustomerId = newCustomer.id;
					} catch (createError: any) {
						// Si el error es por email duplicado, buscar el cliente con ese email
						if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
							const existingCustomerByEmail = await db.cliente.findFirst({
								where: {
									correo: customerEmail
								}
							});
							
							if (existingCustomerByEmail) {
								// Actualizar los datos del cliente existente
								await db.cliente.update({
									where: { id: existingCustomerByEmail.id },
									data: {
										nombre: customerName,
										telefono: customerPhone,
										direccion: customerAddress || existingCustomerByEmail.direccion
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

			// Si aún no hay cliente, crear uno genérico/temporal
			if (!finalCustomerId) {
				// Crear un cliente genérico si no se proporciona ninguno
				const genericCustomer = await db.cliente.create({
					data: {
						nombre: 'Cliente Sin Registrar',
						telefono: `TEMP-${Date.now()}`, // Número temporal único
						correo: null,
						direccion: null
					}
				});
				finalCustomerId = genericCustomer.id;
			}

			// Generar número de orden único
			const lastRepair = await db.reparacion.findFirst({
				orderBy: {
					creadoEn: 'desc'
				}
			});

			let nextNumber = 1;
			if (lastRepair && lastRepair.numeroReparacion) {
				// Extraer solo el número de la orden anterior
				const lastNumber = parseInt(lastRepair.numeroReparacion.replace(/\D/g, ''));
				if (!isNaN(lastNumber)) {
					nextNumber = lastNumber + 1;
				}
			}

			const repairNumber = nextNumber.toString().padStart(6, '0'); // Formato: 000001, 000002, etc.

			// Crear la reparación primero sin las notas
			const repair = await db.reparacion.create({
				data: {
					numeroReparacion: repairNumber,
					clienteId: finalCustomerId,
					tipoDispositivo: deviceType,
					marca: brand,
					modelo: model,
					numeroSerie: serialNumber || null,
					problema: issue,
					tecnicoId: null,
					prioridad: 'MEDIA',
					costoEstimado: null,
					fechaEstimada: null,
					estado: 'SIN_ASIGNAR',
					progreso: 0,
					fechaRecibido: new Date()
				}
			});

			// Si hay notas y un usuario autenticado, crear la nota por separado
			if (notes && notes.trim() && locals.user?.id) {
				try {
					await db.nota.create({
						data: {
							texto: notes,
							reparacionId: repair.id,
							autorId: locals.user.id
						}
					});
				} catch (noteError) {
					console.log('⚠️ No se pudo crear la nota inicial, pero la reparación fue creada:', noteError);
				}
			}

			console.log('✅ Reparación creada exitosamente:', repair.id);
			
			// Redirigir a la página de detalles de la reparación con flag para imprimir y número de orden
			throw redirect(302, `/reparaciones/${repair.id}?print=true&created=true&orderNumber=${repair.numeroReparacion}`);
		} catch (error: any) {
			// Si es un redirect, lanzarlo (es parte del flujo normal, no un error)
			if (error && typeof error === 'object' && error.status === 302) {
				throw error;
			}
			
			console.error('❌ Error real creando reparación:', error);
			return fail(500, { error: 'Error al crear la reparación. Por favor intente nuevamente.' });
		}
	}
};