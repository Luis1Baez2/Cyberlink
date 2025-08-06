import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};