import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

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
		const repair = await prisma.repair.findUnique({
			where: { id: repairId },
			include: {
				customer: true,
				technician: true,
				notes: {
					include: {
						author: true
					},
					orderBy: {
						createdAt: 'desc'
					}
				},
				parts: true
			}
		});

		console.log('📋 Reparación encontrada:', repair ? 'SÍ' : 'NO');
		if (repair) {
			console.log('🔧 Técnico asignado:', repair.technicianId);
			console.log('📝 Cantidad de notas:', repair.notes?.length || 0);
			console.log('💼 Trabajo realizado:', repair.workPerformed);
			console.log('📄 Observaciones finales:', repair.finalObservations);
			console.log('🏷️ Estado:', repair.status);
		}

		if (!repair) {
			throw error(404, 'Reparación no encontrada');
		}

		// Verificar permisos: los técnicos solo pueden ver sus propias reparaciones O reparaciones sin asignar
		console.log('🔐 Verificando permisos...');
		if (locals.user.role === 'TECHNICIAN' && repair.technicianId && repair.technicianId !== locals.user.id) {
			console.log('❌ Acceso denegado - Técnico sin permisos');
			throw error(403, 'No tienes permisos para ver esta reparación');
		}

		// Obtener lista de técnicos si el usuario es admin o manager
		let technicians = [];
		if (['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			console.log('👥 Cargando lista de técnicos...');
			technicians = await prisma.user.findMany({
				where: { role: 'TECHNICIAN' },
				select: {
					id: true,
					name: true
				},
				orderBy: {
					name: 'asc'
				}
			});
			console.log('👥 Técnicos encontrados:', technicians.length);
		}

		console.log('✅ Carga exitosa - retornando datos');
		return {
			repair,
			user: locals.user,
			technicians
		};
	} catch (err) {
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId && currentRepair.technicianId !== locals.user.id) {
				throw error(403, 'No tienes permisos para actualizar esta reparación');
			}

			// Actualizar el estado en la base de datos
			await prisma.repair.update({
				where: { id: params.id },
				data: {
					status: newStatus,
					updatedAt: new Date()
				}
			});

			// Mapeo de estados para mostrar en español
			const statusLabels = {
				UNASSIGNED: 'Sin asignar',
				IN_REVIEW: 'En revisión',
				IN_REPAIR: 'En reparación',
				WAITING_PARTS: 'Esperando repuestos',
				COMPLETED: 'Terminado',
				CANCELLED: 'Cancelado',
				RETIRADO: 'Retirado'
			};

			// SIEMPRE crear nota automática cuando cambia el estado
			if (currentRepair.status !== newStatus) {
				const automaticNoteText = `🔄 Estado cambiado de "${statusLabels[currentRepair.status]}" a "${statusLabels[newStatus]}"`;
				
				await prisma.note.create({
					data: {
						text: automaticNoteText,
						repairId: params.id,
						authorId: locals.user.id
					}
				});
			}

			// Si el usuario agregó una nota adicional, crearla también
			if (userNote && userNote.trim()) {
				await prisma.note.create({
					data: {
						text: userNote.trim(),
						repairId: params.id,
						authorId: locals.user.id
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
			const repair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!repair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && repair.technicianId && repair.technicianId !== locals.user.id) {
				throw error(403, 'No tienes permisos para agregar notas a esta reparación');
			}

			// Crear la nota
			await prisma.note.create({
				data: {
					text: text.trim(),
					repairId: params.id,
					authorId: locals.user.id
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error agregando nota:', err);
			return { error: 'Error al agregar la nota' };
		}
	},

	// Actualizar repuestos
	updateParts: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		// Solo administradores y managers pueden actualizar repuestos
		if (!['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			throw error(403, 'No tienes permisos para actualizar repuestos');
		}

		const formData = await request.formData();
		// Aquí iría la lógica para actualizar repuestos
		// Por ahora solo retornamos success
		return { success: true };
	},

	// Actualizar costos
	updateCosts: async ({ request, params, locals }) => {
		console.log('💰 Iniciando actualización de costos...');
		console.log('👤 Usuario:', locals.user);
		
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		// Verificar permisos
		const currentRepair = await prisma.repair.findUnique({
			where: { id: params.id }
		});

		if (!currentRepair) {
			throw error(404, 'Reparación no encontrada');
		}

		// Los técnicos solo pueden actualizar sus propias reparaciones
		if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId !== locals.user.id) {
			throw error(403, 'Solo puedes actualizar los costos de tus reparaciones asignadas');
		}

		// Solo administradores, managers y técnicos asignados pueden actualizar costos
		if (!['ADMIN', 'MANAGER'].includes(locals.user.role) && 
			!(locals.user.role === 'TECHNICIAN' && currentRepair.technicianId === locals.user.id)) {
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
				updatedAt: new Date()
			};

			// Los técnicos solo pueden actualizar partsCost y partsDescription
			if (locals.user.role === 'TECHNICIAN') {
				if (partsCost) updateData.partsCost = parseFloat(partsCost);
				if (partsDescription !== undefined) updateData.partsDescription = partsDescription;
			} else {
				// Admin y Manager pueden actualizar todo
				if (laborCost) updateData.laborCost = parseFloat(laborCost);
				if (partsCost) updateData.partsCost = parseFloat(partsCost);
				if (partsDescription !== undefined) updateData.partsDescription = partsDescription;
			}

			console.log('💾 Actualizando costos en BD...');
			await prisma.repair.update({
				where: { id: params.id },
				data: updateData
			});
			console.log('✅ Costos actualizados en BD');

			// Crear nota automática
			const costoTotal = (parseFloat(laborCost) || 0) + (parseFloat(partsCost) || 0);
			await prisma.note.create({
				data: {
					text: `💰 Costos actualizados - Mano de obra: $${laborCost || 0}, Repuestos: $${partsCost || 0}, Total: $${costoTotal}`,
					repairId: params.id,
					authorId: locals.user.id
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			console.log('🔧 Reparación actual:', {
				id: currentRepair.id,
				technicianId: currentRepair.technicianId,
				currentLink: currentRepair.purchaseLink
			});

			// Verificar permisos: técnicos solo sus reparaciones, admin puede todas
			if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId !== locals.user.id) {
				console.error('❌ Técnico no asignado:', {
					repairTech: currentRepair.technicianId,
					userTech: locals.user.id
				});
				throw error(403, 'Solo puedes actualizar el link de compra de tus reparaciones asignadas');
			}

			// Actualizar solo el link de compra
			console.log('💾 Actualizando link en BD...');
			await prisma.repair.update({
				where: { id: params.id },
				data: {
					purchaseLink: purchaseLink || null,
					updatedAt: new Date()
				}
			});
			console.log('✅ Link actualizado en BD');

			// Crear nota automática
			if (purchaseLink && purchaseLink.trim()) {
				await prisma.note.create({
					data: {
						text: `🔗 Link de compra actualizado: ${purchaseLink}`,
						repairId: params.id,
						authorId: locals.user.id
					}
				});
			} else if (currentRepair.purchaseLink && !purchaseLink) {
				await prisma.note.create({
					data: {
						text: `🔗 Link de compra eliminado`,
						repairId: params.id,
						authorId: locals.user.id
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id },
				include: { 
					technician: {
						select: { id: true, name: true }
					}
				}
			});
			console.log('📋 Reparación actual:', {
				id: currentRepair?.id,
				status: currentRepair?.status,
				technicianId: currentRepair?.technicianId,
				technician: currentRepair?.technician?.name
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Obtener información del nuevo técnico si se proporciona ID
			const newTechnician = newTechnicianId ? await prisma.user.findUnique({
				where: { id: newTechnicianId },
				select: { id: true, name: true }
			}) : null;
			console.log('👤 Nuevo técnico:', newTechnician);

			// Determinar el nuevo estado
			const newStatus = newTechnicianId && currentRepair.status === 'UNASSIGNED' ? 'IN_REVIEW' : currentRepair.status;
			console.log('🔄 Cambio de estado:', currentRepair.status, '->', newStatus);

			// Actualizar la reparación con el nuevo técnico
			console.log('💾 Actualizando reparación...');
			await prisma.repair.update({
				where: { id: params.id },
				data: {
					technicianId: newTechnicianId || null,
					status: newStatus,
					updatedAt: new Date()
				}
			});
			console.log('✅ Reparación actualizada');

			// SIEMPRE crear nota automática para cambios de técnico
			let automaticNoteText = '';

			if (!currentRepair.technicianId && newTechnicianId) {
				// Primera asignación
				automaticNoteText = `👤 Reparación asignada a ${newTechnician?.name}`;
				console.log('📝 Tipo de cambio: Primera asignación');
			} else if (currentRepair.technicianId && !newTechnicianId) {
				// Quitar asignación
				automaticNoteText = `👤 Se quitó la asignación del técnico ${currentRepair.technician?.name}`;
				console.log('📝 Tipo de cambio: Quitar asignación');
			} else if (currentRepair.technicianId && newTechnicianId && currentRepair.technicianId !== newTechnicianId) {
				// Cambio de técnico
				automaticNoteText = `👤 Reparación reasignada de ${currentRepair.technician?.name} a ${newTechnician?.name}`;
				console.log('📝 Tipo de cambio: Reasignación');
			}

			console.log('📝 Texto de nota automática:', automaticNoteText);

			// Crear la nota automática si hay cambios
			if (automaticNoteText) {
				console.log('💾 Creando nota automática...');
				await prisma.note.create({
					data: {
						text: automaticNoteText,
						repairId: params.id,
						authorId: locals.user.id
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId !== locals.user.id) {
				throw error(403, 'Solo puedes completar tus reparaciones asignadas');
			}

			// Actualizar la reparación
			const updateData: any = {
				workPerformed: workPerformed.trim(),
				finalObservations: finalObservations?.trim() || null,
				updatedAt: new Date()
			};
			
			// Solo cambiar el estado si no está ya en COMPLETED o RETIRADO
			if (currentRepair.status !== 'COMPLETED' && currentRepair.status !== 'RETIRADO') {
				updateData.status = 'COMPLETED';
			}
			
			await prisma.repair.update({
				where: { id: params.id },
				data: updateData
			});

			// Crear nota automática
			const noteText = (currentRepair.status === 'COMPLETED' || currentRepair.status === 'RETIRADO')
				? `📝 Información de reparación actualizada\n🔧 Trabajo realizado: ${workPerformed.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`
				: `✅ Reparación completada\n🔧 Trabajo realizado: ${workPerformed.trim()}${finalObservations ? '\n📝 Observaciones: ' + finalObservations.trim() : ''}`;
				
			await prisma.note.create({
				data: {
					text: noteText,
					repairId: params.id,
					authorId: locals.user.id
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId !== locals.user.id) {
				throw error(403, 'Solo puedes actualizar tus reparaciones asignadas');
			}

			// Actualizar solo los campos de trabajo sin cambiar el estado
			await prisma.repair.update({
				where: { id: params.id },
				data: {
					workPerformed: workPerformed?.trim() || null,
					finalObservations: finalObservations?.trim() || null,
					updatedAt: new Date()
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
			const currentRepair = await prisma.repair.findUnique({
				where: { id: params.id }
			});

			if (!currentRepair) {
				throw error(404, 'Reparación no encontrada');
			}

			// Verificar permisos
			if (locals.user.role === 'TECHNICIAN' && currentRepair.technicianId !== locals.user.id) {
				throw error(403, 'Solo puedes cancelar tus reparaciones asignadas');
			}

			// Actualizar la reparación
			const updateData: any = {
				cancellationReason: cancellationReason.trim(),
				finalObservations: finalObservations?.trim() || null,
				updatedAt: new Date()
			};
			
			// Solo cambiar el estado si no está ya en CANCELLED
			if (currentRepair.status !== 'CANCELLED') {
				updateData.status = 'CANCELLED';
			}
			
			await prisma.repair.update({
				where: { id: params.id },
				data: updateData
			});

			// Crear nota automática
			const noteText = currentRepair.status === 'CANCELLED'
				? `📝 Información de cancelación actualizada\n❌ Motivo: ${cancellationReason.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`
				: `❌ Reparación cancelada\n📝 Motivo: ${cancellationReason.trim()}${finalObservations ? '\n💬 Observaciones: ' + finalObservations.trim() : ''}`;
				
			await prisma.note.create({
				data: {
					text: noteText,
					repairId: params.id,
					authorId: locals.user.id
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