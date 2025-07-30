import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { 
	SECURE_USERS, 
	simpleHash, 
	checkLogin, 
	createSignedToken 
} from '$lib/server/simple-auth';
import { translateRole } from '$lib/utils/roles';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}
	
	// Obtener el usuario actual con su correo de recuperación
	const currentUser = SECURE_USERS[locals.user.username];
	
	return {
		user: {
			...locals.user,
			recoveryEmail: currentUser?.recoveryEmail || ''
		},
		roleTranslation: translateRole(locals.user.role)
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}
		
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const recoveryEmail = data.get('recoveryEmail')?.toString() || '';
		
		if (!name || name.trim().length < 3) {
			return fail(400, { 
				error: 'El nombre debe tener al menos 3 caracteres',
				name,
				recoveryEmail 
			});
		}
		
		// Validar formato de email si se proporciona
		if (recoveryEmail && !recoveryEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			return fail(400, { 
				error: 'El correo electrónico no es válido',
				name,
				recoveryEmail 
			});
		}
		
		// Actualizar nombre y correo en el usuario actual
		const user = SECURE_USERS[locals.user.username];
		if (user) {
			user.name = name;
			user.recoveryEmail = recoveryEmail;
			
			// Actualizar token con nuevo nombre
			const newToken = createSignedToken({
				username: locals.user.username,
				role: locals.user.role,
				name: name
			});
			
			cookies.set('auth-token', newToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7
			});
			
			return { success: true, name, recoveryEmail };
		}
		
		return fail(500, { error: 'Error al actualizar el perfil' });
	},
	
	updatePassword: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}
		
		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString() || '';
		const newPassword = data.get('newPassword')?.toString() || '';
		const confirmPassword = data.get('confirmPassword')?.toString() || '';
		
		// Validaciones
		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'Todos los campos son requeridos' });
		}
		
		if (newPassword.length < 4) {
			return fail(400, { error: 'La nueva contraseña debe tener al menos 4 caracteres' });
		}
		
		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'Las contraseñas no coinciden' });
		}
		
		// Verificar contraseña actual
		if (!checkLogin(locals.user.username, currentPassword)) {
			return fail(401, { error: 'La contraseña actual es incorrecta' });
		}
		
		// Actualizar contraseña
		const user = SECURE_USERS[locals.user.username];
		if (user) {
			user.password = simpleHash(newPassword);
			return { success: true };
		}
		
		return fail(500, { error: 'Error al actualizar la contraseña' });
	}
};