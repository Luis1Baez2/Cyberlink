import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const rawRepair = await db.reparacion.findUnique({
			where: {
				id: params.id
			},
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
			notes: rawRepair.notas ? rawRepair.notas.map((n: any) => ({
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

		// Debug log
		console.log('🖨️ Datos de impresión:', {
			id: repair.id,
			repairNumber: repair.repairNumber,
			status: repair.status,
			workPerformed: repair.workPerformed,
			finalObservations: repair.finalObservations,
			cancellationReason: repair.cancellationReason
		});

		return {
			repair
		};
	} catch (err) {
		console.error('Error cargando reparación para imprimir:', err);
		throw error(500, 'Error al cargar la reparación');
	}
};