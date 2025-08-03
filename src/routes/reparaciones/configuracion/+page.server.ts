import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	
	// Solo administradores y managers pueden editar impresión
	if (!['ADMIN', 'MANAGER'].includes(locals.user.role)) {
		throw redirect(302, '/reparaciones');
	}
	
	return {};
};