import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo admin, manager y employee pueden ver clientes
	if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(locals.user.role)) {
		throw redirect(302, '/');
	}

	const rawCustomers = await db.cliente.findMany({
		include: {
			_count: {
				select: {
					reparaciones: true,
					ordenes: true
				}
			}
		},
		orderBy: {
			creadoEn: 'desc'
		}
	});

	// Mapear los datos del español al inglés para el frontend
	const customers = rawCustomers.map(c => ({
		id: c.id,
		name: c.nombre,
		phone: c.telefono,
		email: c.correo,
		address: c.direccion,
		createdAt: c.creadoEn,
		updatedAt: c.actualizadoEn,
		_count: c._count
	}));

	return {
		customers
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (!['ADMIN', 'MANAGER'].includes(locals.user.role)) {
			return { error: 'No tienes permisos para eliminar clientes' };
		}

		const formData = await request.formData();
		const customerId = formData.get('customerId') as string;

		try {
			await db.cliente.delete({
				where: { id: customerId }
			});
			return { success: true };
		} catch (error) {
			return { error: 'No se puede eliminar el cliente porque tiene reparaciones asociadas' };
		}
	}
};