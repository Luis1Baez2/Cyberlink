import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { 
	checkLogin, 
	SECURE_USERS, 
	createSignedToken,
	isUserBlocked,
	recordFailedAttempt,
	clearLoginAttempts
} from '$lib/server/simple-auth';
import { db } from '$lib/server/db';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString() || '';
		const password = data.get('password')?.toString() || '';

		// Verificar si el usuario está bloqueado
		if (isUserBlocked(username)) {
			return fail(429, { 
				error: 'Demasiados intentos fallidos. Por favor espere 15 minutos.',
				blocked: true 
			});
		}

		// Verificación con contraseña hasheada
		if (checkLogin(username, password)) {
			const user = SECURE_USERS[username];
			
			// Limpiar intentos fallidos
			clearLoginAttempts(username);
			
			// Obtener el ID del usuario de la base de datos
			const dbUser = await db.usuario.findUnique({
  				where: { nombreUsuario: username },
  				select: { id: true }
		});

			
			// Crear token firmado con ID de la base de datos
			const token = createSignedToken({
				username,
				role: user.role,
				name: user.name,
				id: dbUser?.id
			});
			
			// Guardar token en cookie
			cookies.set('auth-token', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 días
			});

			// Redirigir según el rol
			if (user.role === 'TECHNICIAN') {
				throw redirect(302, '/reparaciones');
			} else if (user.role === 'EMPLOYEE') {
				throw redirect(302, '/inventario');
			} else {
				throw redirect(302, '/');
			}
		}

		// Registrar intento fallido
		const attemptsLeft = recordFailedAttempt(username);
		
		// Si no coincide, volver al login con mensaje
		if (attemptsLeft <= 0) {
			return fail(401, { 
				error: 'Usuario o contraseña incorrectos. Cuenta bloqueada temporalmente.',
				blocked: true 
			});
		} else if (attemptsLeft <= 2) {
			return fail(401, { 
				error: `Usuario o contraseña incorrectos. ${attemptsLeft} intentos restantes.`,
				warning: true 
			});
		}
		
		return fail(401, { error: 'Usuario o contraseña incorrectos' });
	}
};