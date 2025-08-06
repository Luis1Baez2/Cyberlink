import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const repairId = params.id;
	console.log('🔍 Cargando reparación:', repairId);
	console.log('👤 Usuario:', locals.user.role, locals.user.name, locals.user.id);

	try {
		// Obtener la reparación con todas sus relaciones
		console.log('📊 Consultando base de datos...');
		const rawRepair = await db.reparacion.findUnique({
			where: { id: repairId },
			include: {
				cliente: true,
				tecnico: true,
				notas: {
					include: {
						autor: true
					},
					orderBy: {
						creadoEn: 'desc'
					}
				}
			}
		});

		console.log('📋 Reparación encontrada:', rawRepair ? 'SÍ' : 'NO');
		
		if (!rawRepair) {
			throw error(404, 'Reparación no encontrada');
		}

		// Mapear los datos del español al inglés para el frontend
		const repair = {
			id: rawRepair.id,
			repairNumber: rawRepair.numeroReparacion,
			customer: rawRepair.cliente ? {
				id: rawRepair.cliente.id,
				name: rawRepair.cliente.nombre,
				phone: rawRepair.cliente.telefono,
				email: rawRepair.cliente.correo,
				address: rawRepair.cliente.direccion
			} : null,
			technician: rawRepair.tecnico ? {
				id: rawRepair.tecnico.id,
				name: rawRepair.tecnico.nombre,
				username: rawRepair.tecnico.nombreUsuario
			} : null,
			technicianId: rawRepair.tecnicoId,
			deviceType: rawRepair.tipoDispositivo,
			brand: rawRepair.marca,
			model: rawRepair.modelo,
			serialNumber: rawRepair.numeroSerie,
			issue: rawRepair.problema,
			diagnosis: rawRepair.diagnostico,
			status: rawRepair.estado === 'SIN_ASIGNAR' ? 'UNASSIGNED' :
					rawRepair.estado === 'EN_REVISION' ? 'IN_REVIEW' :
					rawRepair.estado === 'EN_REPARACION' ? 'IN_REPAIR' :
					rawRepair.estado === 'ESPERANDO_REPUESTO' ? 'WAITING_PARTS' :
					rawRepair.estado === 'COMPLETADO' ? 'COMPLETED' :
					rawRepair.estado === 'CANCELADO' ? 'CANCELLED' :
					rawRepair.estado === 'RETIRADO' ? 'RETIRADO' : rawRepair.estado,
			priority: rawRepair.prioridad === 'ALTA' ? 'HIGH' :
					 rawRepair.prioridad === 'MEDIA' ? 'MEDIUM' :
					 rawRepair.prioridad === 'BAJA' ? 'LOW' : rawRepair.prioridad,
			estimatedCost: rawRepair.costoEstimado,
			finalCost: rawRepair.costoFinal,
			receivedDate: rawRepair.fechaRecibido,
			estimatedDate: rawRepair.fechaEstimada,
			deliveryDate: rawRepair.fechaEntrega,
			progress: rawRepair.progreso,
			purchaseLink: rawRepair.enlaceCompra,
			partsDescription: rawRepair.descripcionPartes,
			partsStatus: rawRepair.estadoPartes,
			estimatedArrival: rawRepair.llegadaEstimada,
			laborCost: rawRepair.costoManoObra,
			partsCost: rawRepair.costoPartes,
			workPerformed: rawRepair.trabajoRealizado,
			finalObservations: rawRepair.observacionesFinales,
			cancellationReason: rawRepair.motivoCancelacion,
			createdAt: rawRepair.creadoEn,
			updatedAt: rawRepair.actualizadoEn,
			notes: rawRepair.notas ? rawRepair.notas.map(n => ({
				id: n.id,
				text: n.texto,
				createdAt: n.creadoEn,
				author: n.autor ? {
					id: n.autor.id,
					name: n.autor.nombre,
					username: n.autor.nombreUsuario
				} : null
			})) : [],
			parts: []
		};

		console.log('🏷️ Estado mapeado:', repair.status);
		console.log('📝 Cantidad de notas:', repair.notes?.length || 0);

		// Verificar permisos: los técnicos solo pueden ver sus propias reparaciones O reparaciones sin asignar
		console.log('🔐 Verificando permisos...');
		if (locals.user.role === 'TECHNICIAN' && rawRepair.tecnicoId && rawRepair.tecnicoId !== locals.user.id) {
			console.log('❌ Acceso denegado - Técnico sin permisos');
			throw error(403, 'No tienes permisos para ver esta reparación');
		}

		// Obtener lista de técnicos si el usuario es admin o manager
		let technicians = [];
		if (['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			console.log('👥 Cargando lista de técnicos...');
			const rawTechnicians = await db.usuario.findMany({
				where: { rol: 'TECNICO' },
				select: {
					id: true,
					nombre: true
				},
				orderBy: {
					nombre: 'asc'
				}
			});
			technicians = rawTechnicians.map(t => ({
				id: t.id,
				name: t.nombre
			}));
			console.log('👥 Técnicos encontrados:', technicians.length);
		}

		console.log('✅ Carga exitosa - retornando datos');
		return {
			repair,
			user: locals.user,
			technicians
		};
	} catch (err: any) {
		console.error('💥 Error cargando reparación:', err);
		console.error('💥 Stack trace:', err.stack);
		
		// Si ya es un HttpError, re-lanzarlo
		if (err.status) {
			throw err;
		}
		
		throw error(500, 'Error al cargar la reparación');
	}
};

export const actions: Actions = {
	// Actualizar estado de reparación
	updateStatus: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const newStatus = formData.get('status') as string;
		const userNote = formData.get('note') as string;

		try {
			// Obtener la reparación actual
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId && currentRepair.tecnicoId !== locals.user.id) {
				throw error(403, 'No tienes permisos para actualizar esta reparación');
			}

			// Mapear el estado del inglés al español
			const statusMap: Record<string, string> = {
				'UNASSIGNED': 'SIN_ASIGNAR',
				'IN_REVIEW': 'EN_REVISION',
				'IN_REPAIR': 'EN_REPARACION',
				'WAITING_PARTS': 'ESPERANDO_REPUESTO',
				'COMPLETED': 'COMPLETADO',
				'CANCELLED': 'CANCELADO',
				'RETIRADO': 'RETIRADO'
			};

			const mappedStatus = statusMap[newStatus] || newStatus;

			// Actualizar el estado en la base de datos
			await db.reparacion.update({
				where: { id: params.id },
				data: {
					estado: mappedStatus,
					actualizadoEn: new Date()
				}
			});

			// Mapeo de estados para mostrar en español
			const statusLabels: Record<string, string> = {
				SIN_ASIGNAR: 'Sin asignar',
				EN_REVISION: 'En revisión',
				EN_REPARACION: 'En reparación',
				ESPERANDO_REPUESTO: 'Esperando repuestos',
				COMPLETADO: 'Terminado',
				CANCELADO: 'Cancelado',
				RETIRADO: 'Retirado'
			};

			// SIEMPRE crear nota automática cuando cambia el estado
			if (currentRepair.estado !== mappedStatus) {
				const automaticNoteText = `🔄 Estado cambiado de "${statusLabels[currentRepair.estado]}" a "${statusLabels[mappedStatus]}"`;
				
				await db.nota.create({
					data: {
						texto: automaticNoteText,
						reparacionId: params.id,
						autorId: locals.user.id
					}
				});
			}

			// Si el usuario agregó una nota adicional, crearla también
			if (userNote && userNote.trim()) {
				await db.nota.create({
					data: {
						texto: userNote.trim(),
						reparacionId: params.id,
						autorId: locals.user.id
					}
				});
			}

			return { success: true };
		} catch (err) {
			console.error('Error actualizando estado:', err);
			return { error: 'Error al actualizar el estado' };
		}
	},

	// Agregar nota
	addNote: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const text = formData.get('text') as string;

		if (!text || !text.trim()) {
			return { error: 'La nota no puede estar vacía' };
		}

		try {
			// Verificar que la reparación existe
			const repair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!repair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && repair.tecnicoId && repair.tecnicoId !== locals.user.id) {
				throw error(403, 'No tienes permisos para agregar notas a esta reparación');
			}

			// Crear la nota
			await db.nota.create({
				data: {
					texto: text.trim(),
					reparacionId: params.id,
					autorId: locals.user.id
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error agregando nota:', err);
			return { error: 'Error al agregar la nota' };
		}
	},

	// Actualizar costos
	updateCosts: async ({ request, params, locals }) => {
		console.log('💰 Iniciando actualización de costos...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		// Verificar permisos
		const currentRepair = await db.reparacion.findUnique({
			where: { id: params.id }
		});

		if (!currentRepair) {
			throw error(404, 'Reparación no encontrada');
		}

		// Los técnicos solo pueden actualizar sus propias reparaciones
		if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId !== locals.user.id) {
			throw error(403, 'Solo puedes actualizar los costos de tus reparaciones asignadas');
		}

		// Solo administradores, managers y técnicos asignados pueden actualizar costos
		if (!['ADMIN', 'MANAGER'].includes(locals.user.role) && 
			!(locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId === locals.user.id)) {
			console.error('❌ Usuario sin permisos para costos:', locals.user.role);
			throw error(403, 'No tienes permisos para actualizar costos');
		}

		const formData = await request.formData();
		const laborCost = formData.get('laborCost') as string;
		const partsCost = formData.get('partsCost') as string;
		const partsDescription = formData.get('partsDescription') as string;
		
		console.log('💵 Costos recibidos:', {
			laborCost,
			partsCost,
			partsDescription
		});

		try {
			// Preparar datos para actualizar
			const updateData: any = {
				actualizadoEn: new Date()
			};

			// Los técnicos solo pueden actualizar partsCost y partsDescription
			if (locals.user.role === 'TECHNICIAN') {
				if (partsCost) updateData.costoPartes = parseFloat(partsCost);
				if (partsDescription !== undefined) updateData.descripcionPartes = partsDescription;
			} else {
				// Admin y Manager pueden actualizar todo
				if (laborCost) updateData.costoManoObra = parseFloat(laborCost);
				if (partsCost) updateData.costoPartes = parseFloat(partsCost);
				if (partsDescription !== undefined) updateData.descripcionPartes = partsDescription;
			}

			console.log('💾 Actualizando costos en BD...');
			await db.reparacion.update({
				where: { id: params.id },
				data: updateData
			});
			console.log('✅ Costos actualizados en BD');

			// Crear nota automática
			const costoTotal = (parseFloat(laborCost) || 0) + (parseFloat(partsCost) || 0);
			await db.nota.create({
				data: {
					texto: `💰 Costos actualizados - Mano de obra: $${laborCost || 0}, Repuestos: $${partsCost || 0}, Total: $${costoTotal}`,
					reparacionId: params.id,
					autorId: locals.user.id
				}
			});

			console.log('✅ Costos actualizados correctamente');
			return { success: true };
		} catch (err) {
			console.error('💥 Error actualizando costos:', err);
			return { error: 'Error al actualizar los costos' };
		}
	},

	// Actualizar link de compra
	updateLink: async ({ request, params, locals }) => {
		console.log('🔗 Iniciando actualización de link...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		// Verificar que sea técnico o administrador
		if (locals.user.role !== 'TECHNICIAN' && locals.user.role !== 'ADMIN') {
			console.error('❌ Usuario no tiene permisos:', locals.user.role);
			throw error(403, 'Solo los técnicos y administradores pueden actualizar el link de compra');
		}

		const formData = await request.formData();
		const purchaseLink = formData.get('purchaseLink') as string;
		console.log('🔗 Link recibido:', purchaseLink);

		try {
			// Obtener la reparación actual
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			console.log('🔧 Reparación actual:', {
				id: currentRepair.id,
				technicianId: currentRepair.tecnicoId,
				currentLink: currentRepair.enlaceCompra
			});

			// Verificar permisos: técnicos solo sus reparaciones, admin puede todas
			if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId !== locals.user.id) {
				console.error('❌ Técnico no asignado:', {
					repairTech: currentRepair.tecnicoId,
					userTech: locals.user.id
				});
				throw error(403, 'Solo puedes actualizar el link de compra de tus reparaciones asignadas');
			}

			// Actualizar solo el link de compra
			console.log('💾 Actualizando link en BD...');
			await db.reparacion.update({
				where: { id: params.id },
				data: {
					enlaceCompra: purchaseLink || null,
					actualizadoEn: new Date()
				}
			});
			console.log('✅ Link actualizado en BD');

			// Crear nota automática
			if (purchaseLink && purchaseLink.trim()) {
				await db.nota.create({
					data: {
						texto: `🔗 Link de compra actualizado: ${purchaseLink}`,
						reparacionId: params.id,
						autorId: locals.user.id
					}
				});
			} else if (currentRepair.enlaceCompra && !purchaseLink) {
				await db.nota.create({
					data: {
						texto: `🔗 Link de compra eliminado`,
						reparacionId: params.id,
						autorId: locals.user.id
					}
				});
			}

			console.log('✅ Link actualizado correctamente');
			return { success: true };
		} catch (err) {
			console.error('💥 Error actualizando link:', err);
			return { error: 'Error al actualizar el link de compra' };
		}
	},

	// Asignar técnico
	assignTechnician: async ({ request, params, locals }) => {
		console.log('🔧 Iniciando asignación de técnico...');
		console.log('👤 Usuario que asigna:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		// Solo administradores y managers pueden asignar técnicos
		if (!['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			throw error(403, 'No tienes permisos para asignar técnicos');
		}

		const formData = await request.formData();
		const newTechnicianId = formData.get('technicianId') as string;
		console.log('🆔 Nuevo técnico ID:', newTechnicianId);

		try {
			// Verificar que locals.user.id existe antes de continuar
			if (!locals.user.id) {
				console.error('❌ locals.user.id is undefined:', locals.user);
				throw error(500, 'Error de autenticación');
			}

			// Obtener la reparación actual con técnico incluido
			console.log('📊 Consultando reparación actual...');
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id },
				include: { 
					tecnico: {
						select: { id: true, nombre: true }
					}
				}
			});
			console.log('📋 Reparación actual:', {
				id: currentRepair?.id,
				status: currentRepair?.estado,
				technicianId: currentRepair?.tecnicoId,
				technician: currentRepair?.tecnico?.nombre
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Obtener información del nuevo técnico si se proporciona ID
			const newTechnician = newTechnicianId ? await db.usuario.findUnique({
				where: { id: newTechnicianId },
				select: { id: true, nombre: true }
			}) : null;
			console.log('👤 Nuevo técnico:', newTechnician);

			// Determinar el nuevo estado
			const newStatus = newTechnicianId && currentRepair.estado === 'SIN_ASIGNAR' ? 'EN_REVISION' : currentRepair.estado;
			console.log('🔄 Cambio de estado:', currentRepair.estado, '->', newStatus);

			// Actualizar la reparación con el nuevo técnico
			console.log('💾 Actualizando reparación...');
			await db.reparacion.update({
				where: { id: params.id },
				data: {
					tecnicoId: newTechnicianId || null,
					estado: newStatus,
					actualizadoEn: new Date()
				}
			});
			console.log('✅ Reparación actualizada');

			// SIEMPRE crear nota automática para cambios de técnico
			let automaticNoteText = '';

			if (!currentRepair.tecnicoId && newTechnicianId) {
				// Primera asignación
				automaticNoteText = `👤 Reparación asignada a ${newTechnician?.nombre}`;
				console.log('📝 Tipo de cambio: Primera asignación');
			} else if (currentRepair.tecnicoId && !newTechnicianId) {
				// Quitar asignación
				automaticNoteText = `👤 Se quitó la asignación del técnico ${currentRepair.tecnico?.nombre}`;
				console.log('📝 Tipo de cambio: Quitar asignación');
			} else if (currentRepair.tecnicoId && newTechnicianId && currentRepair.tecnicoId !== newTechnicianId) {
				// Cambio de técnico
				automaticNoteText = `👤 Reparación reasignada de ${currentRepair.tecnico?.nombre} a ${newTechnician?.nombre}`;
				console.log('📝 Tipo de cambio: Reasignación');
			}

			console.log('📝 Texto de nota automática:', automaticNoteText);

			// Crear la nota automática si hay cambios
			if (automaticNoteText) {
				console.log('💾 Creando nota automática...');
				await db.nota.create({
					data: {
						texto: automaticNoteText,
						reparacionId: params.id,
						autorId: locals.user.id
					}
				});
				console.log('✅ Nota automática creada');
			} else {
				console.log('⚠️ No se creó nota automática (no hay cambios)');
			}

			return { success: true };
		} catch (err) {
			console.error('Error asignando técnico:', err);
			return { error: 'Error al asignar el técnico' };
		}
	},

	// Completar reparación
	completeRepair: async ({ request, params, locals }) => {
		console.log('✅ Iniciando completar reparación...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const workPerformed = formData.get('workPerformed') as string;
		const finalObservations = formData.get('finalObservations') as string;

		if (!workPerformed || !workPerformed.trim()) {
			return { error: 'Debe especificar el trabajo realizado' };
		}

		try {
			// Obtener la reparación actual
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId !== locals.user.id) {
				throw error(403, 'Solo puedes completar tus reparaciones asignadas');
			}

			// Actualizar la reparación
			const updateData: any = {
				trabajoRealizado: workPerformed.trim(),
				observacionesFinales: finalObservations?.trim() || null,
				actualizadoEn: new Date()
			};
			
			// Solo cambiar el estado si no está ya en COMPLETADO o RETIRADO
			if (currentRepair.estado !== 'COMPLETADO' && currentRepair.estado !== 'RETIRADO') {
				updateData.estado = 'COMPLETADO';
			}
			
			await db.reparacion.update({
				where: { id: params.id },
				data: updateData
			});

			// Crear nota automática
			const noteText = (currentRepair.estado === 'COMPLETADO' || currentRepair.estado === 'RETIRADO')
				? `📝 Información de reparación actualizada\n🔧 Trabajo realizado: ${workPerformed.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`
				: `✅ Reparación completada\n🔧 Trabajo realizado: ${workPerformed.trim()}${finalObservations ? '\n📝 Observaciones: ' + finalObservations.trim() : ''}`;
				
			await db.nota.create({
				data: {
					texto: noteText,
					reparacionId: params.id,
					autorId: locals.user.id
				}
			});

			console.log('✅ Reparación completada correctamente');
			return { success: true };
		} catch (err) {
			console.error('💥 Error completando reparación:', err);
			return { error: 'Error al completar la reparación' };
		}
	},

	// Guardar información de trabajo (auto-guardado)
	saveWorkInfo: async ({ request, params, locals }) => {
		console.log('💾 Iniciando guardado de información de trabajo...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const workPerformed = formData.get('workPerformed') as string;
		const finalObservations = formData.get('finalObservations') as string;

		try {
			// Obtener la reparación actual
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId !== locals.user.id) {
				throw error(403, 'Solo puedes actualizar tus reparaciones asignadas');
			}

			// Actualizar solo los campos de trabajo sin cambiar el estado
			await db.reparacion.update({
				where: { id: params.id },
				data: {
					trabajoRealizado: workPerformed?.trim() || null,
					observacionesFinales: finalObservations?.trim() || null,
					actualizadoEn: new Date()
				}
			});

			console.log('✅ Información de trabajo guardada correctamente');
			return { success: true };
		} catch (err) {
			console.error('💥 Error guardando información de trabajo:', err);
			return { error: 'Error al guardar la información' };
		}
	},

	// Cancelar reparación
	cancelRepair: async ({ request, params, locals }) => {
		console.log('❌ Iniciando cancelar reparación...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const cancellationReason = formData.get('cancellationReason') as string;
		const finalObservations = formData.get('finalObservations') as string;

		if (!cancellationReason || !cancellationReason.trim()) {
			return { error: 'Debe especificar el motivo de cancelación' };
		}

		try {
			// Obtener la reparación actual
			const currentRepair = await db.reparacion.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.tecnicoId !== locals.user.id) {
				throw error(403, 'Solo puedes cancelar tus reparaciones asignadas');
			}

			// Actualizar la reparación
			const updateData: any = {
				motivoCancelacion: cancellationReason.trim(),
				observacionesFinales: finalObservations?.trim() || null,
				actualizadoEn: new Date()
			};
			
			// Solo cambiar el estado si no está ya en CANCELADO
			if (currentRepair.estado !== 'CANCELADO') {
				updateData.estado = 'CANCELADO';
			}
			
			await db.reparacion.update({
				where: { id: params.id },
				data: updateData
			});

			// Crear nota automática
			const noteText = currentRepair.estado === 'CANCELADO'
				? `📝 Información de cancelación actualizada\n❌ Motivo: ${cancellationReason.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`
				: `❌ Reparación cancelada\n📝 Motivo: ${cancellationReason.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`;
				
			await db.nota.create({
				data: {
					texto: noteText,
					reparacionId: params.id,
					autorId: locals.user.id
				}
			});

			console.log('❌ Reparación cancelada correctamente');
			return { success: true };
		} catch (err) {
			console.error('💥 Error cancelando reparación:', err);
			return { error: 'Error al cancelar la reparación' };
		}
	}
};