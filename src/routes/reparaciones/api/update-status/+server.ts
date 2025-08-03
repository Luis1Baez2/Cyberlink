import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Verificar autenticación
	const user = locals.user;
	if (!user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const repairId = formData.get('id') as string;
		const newStatus = formData.get('status') as string;

		if (!repairId || !newStatus) {
			return json({ error: 'Datos faltantes' }, { status: 400 });
		}

		// Obtener la reparación actual
		const repair = await prisma.repair.findUnique({
			where: { id: repairId },
			include: { technician: true }
		});

		if (!repair) {
			return json({ error: 'Reparación no encontrada' }, { status: 404 });
		}

		// Verificar permisos
		const canUpdate = user.role === 'ADMIN' || 
						  user.role === 'MANAGER' || 
						  (user.role === 'TECHNICIAN' && repair.technicianId === user.id);

		if (!canUpdate) {
			return json({ error: 'Sin permisos para actualizar' }, { status: 403 });
		}

		// Actualizar el estado
		const updatedRepair = await prisma.repair.update({
			where: { id: repairId },
			data: { 
				status: newStatus,
				updatedAt: new Date()
			}
		});

		// Crear nota en el historial
		await prisma.repairNote.create({
			data: {
				text: `Estado cambiado a: ${newStatus}`,
				repairId: repairId,
				authorId: user.id
			}
		});

		return json({ success: true, repair: updatedRepair });
	} catch (error) {
		console.error('Error al actualizar estado:', error);
		return json({ error: 'Error al actualizar estado' }, { status: 500 });
	}
};