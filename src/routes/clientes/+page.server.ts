import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo admin, manager y employee pueden ver clientes
	if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(locals.user.role)) {
		throw redirect(302, '/');
	}

	const customers = await prisma.customer.findMany({
		include: {
			_count: {
				select: {
					repairs: true,
					orders: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

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
			await prisma.customer.delete({
				where: { id: customerId }
			});
			return { success: true };
		} catch (error) {
			return { error: 'No se puede eliminar el cliente porque tiene reparaciones asociadas' };
		}
	}
};