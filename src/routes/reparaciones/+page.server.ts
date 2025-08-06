import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Verificar permisos
	if (!['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(locals.user.role)) {
		throw redirect(302, '/');
	}

	try {
		// Obtener reparaciones con información relacionada
		let rawRepairs;
		
		if (locals.user.role === 'TECHNICIAN') {
			// Los técnicos solo ven sus reparaciones asignadas que NO estén terminadas o entregadas
			rawRepairs = await db.reparacion.findMany({
				where: {
					tecnicoId: locals.user.id,
					NOT: {
						estado: {
							in: ['COMPLETADO', 'ENTREGADO']
						}
					}
				},
				include: {
					cliente: true,
					tecnico: true
				},
				orderBy: {
					creadoEn: 'desc'
				}
			});
		} else {
			// Admin y Manager ven todas las reparaciones
			rawRepairs = await db.reparacion.findMany({
				include: {
					cliente: true,
					tecnico: true
				},
				orderBy: {
					creadoEn: 'desc'
				}
			});
		}

		// Mapear los datos del español al inglés para el frontend
		const repairs = rawRepairs.map(r => ({
			id: r.id,
			repairNumber: r.numeroReparacion,
			customer: r.cliente ? {
				id: r.cliente.id,
				name: r.cliente.nombre,
				phone: r.cliente.telefono,
				email: r.cliente.correo,
				address: r.cliente.direccion
			} : null,
			technician: r.tecnico ? {
				id: r.tecnico.id,
				name: r.tecnico.nombre,
				username: r.tecnico.nombreUsuario
			} : null,
			technicianId: r.tecnicoId,
			deviceType: r.tipoDispositivo,
			brand: r.marca,
			model: r.modelo,
			serialNumber: r.numeroSerie,
			issue: r.problema,
			diagnosis: r.diagnostico,
			status: r.estado === 'SIN_ASIGNAR' ? 'UNASSIGNED' :
					r.estado === 'EN_REVISION' ? 'IN_REVIEW' :
					r.estado === 'EN_REPARACION' ? 'IN_REPAIR' :
					r.estado === 'ESPERANDO_REPUESTO' ? 'WAITING_PARTS' :
					r.estado === 'COMPLETADO' ? 'COMPLETED' :
					r.estado === 'CANCELADO' ? 'CANCELLED' :
					r.estado === 'RETIRADO' ? 'RETIRADO' : r.estado,
			priority: r.prioridad === 'ALTA' ? 'HIGH' :
					 r.prioridad === 'MEDIA' ? 'MEDIUM' :
					 r.prioridad === 'BAJA' ? 'LOW' : r.prioridad,
			estimatedCost: r.costoEstimado,
			finalCost: r.costoFinal,
			receivedDate: r.fechaRecibido,
			estimatedDate: r.fechaEstimada,
			deliveryDate: r.fechaEntrega,
			progress: r.progreso,
			purchaseLink: r.enlaceCompra,
			partsDescription: r.descripcionPartes,
			partsStatus: r.estadoPartes,
			estimatedArrival: r.llegadaEstimada,
			laborCost: r.costoManoObra,
			partsCost: r.costoPartes,
			workPerformed: r.trabajoRealizado,
			finalObservations: r.observacionesFinales,
			cancellationReason: r.motivoCancelacion,
			createdAt: r.creadoEn,
			updatedAt: r.actualizadoEn
		}))

		// Obtener lista de técnicos para el filtro (solo para admin y manager)
		let technicians: any[] = [];

		if (['ADMIN', 'MANAGER'].includes(locals.user.role)) {
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
			
			// Mapear los técnicos al formato esperado por el frontend
			technicians = rawTechnicians.map(t => ({
				id: t.id,
				name: t.nombre
			}));
		}

		return {
			user: locals.user,
			repairs,
			technicians
		};
	} catch (error) {
		console.error('Error cargando reparaciones:', error);
		return {
			user: locals.user,
			repairs: [],
			technicians: []
		};
	}
};