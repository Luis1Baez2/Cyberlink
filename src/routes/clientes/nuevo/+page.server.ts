import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo admin, manager y employee pueden crear clientes
	if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(locals.user.role)) {
		throw redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(locals.user.role)) {
			return { error: 'No tienes permisos para crear clientes' };
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const phone = formData.get('phone') as string;
		const email = formData.get('email') as string;
		const address = formData.get('address') as string;
		const taxId = formData.get('taxId') as string;

		if (!name || !phone) {
			return { error: 'Nombre y teléfono son requeridos' };
		}

		try {
			const customer = await prisma.customer.create({
				data: {
					name,
					phone,
					email: email || null,
					address: address || null,
					taxId: taxId || null
				}
			});

			throw redirect(302, `/clientes`);
		} catch (error) {
			console.error('Error creando cliente:', error);
			if (error.code === 'P2002') {
				return { error: 'Ya existe un cliente con ese teléfono o CUIT' };
			}
			return { error: 'Error al crear el cliente' };
		}
	}
};