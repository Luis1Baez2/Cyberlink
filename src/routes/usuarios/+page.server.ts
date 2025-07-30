import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { SECURE_USERS, simpleHash } from '$lib/server/simple-auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo admin o dueño puede ver esta página
	if (locals.user.role !== 'ADMIN' && locals.user.username !== 'dueño') {
		throw redirect(302, '/');
	}

	// Convertir el objeto de usuarios a array
	const users = Object.entries(SECURE_USERS).map(([username, userData]) => ({
		id: username, // Usar username como ID
		username,
		name: userData.name,
		role: userData.role,
		workShift: userData.workShift || 'FULL_TIME',
		createdAt: new Date().toISOString() // Fecha simulada
	}));

	return {
		user: locals.user,
		users
	};
};

export const actions: Actions = {
	updateUser: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN' && locals.user?.username !== 'dueño') {
			return fail(403, { message: 'No autorizado' });
		}

		const data = await request.formData();
		const userId = data.get('userId') as string; // En realidad es el username
		const role = data.get('role') as string;
		const workShift = data.get('workShift') as string;

		console.log('Actualizando usuario:', { userId, role, workShift });

		// Evitar que un admin se quite sus propios permisos
		if (userId === locals.user.username && role !== 'ADMIN') {
			return fail(400, { message: 'No puedes quitarte tus propios permisos de administrador' });
		}

		try {
			// Actualizar usuario en memoria
			const user = SECURE_USERS[userId];
			if (user) {
				user.role = role;
				user.workShift = workShift;
				return { success: true };
			} else {
				return fail(404, { message: 'Usuario no encontrado' });
			}
		} catch (error) {
			console.error('Error actualizando usuario:', error);
			return fail(500, { message: 'Error al actualizar usuario' });
		}
	},

	createUser: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN' && locals.user?.username !== 'dueño') {
			return fail(403, { message: 'No autorizado' });
		}

		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;
		const name = data.get('name') as string;
		const role = data.get('role') as string;
		const workShift = data.get('workShift') as string || 'FULL_TIME';

		try {
			// Verificar si el usuario ya existe
			if (SECURE_USERS[username]) {
				return fail(400, { message: 'El usuario ya existe' });
			}

			// Crear usuario
			SECURE_USERS[username] = {
				password: simpleHash(password),
				role: role,
				name: name,
				workShift: workShift,
				recoveryEmail: ''
			};

			return { success: true };
		} catch (error) {
			console.error('Error creando usuario:', error);
			return fail(500, { message: 'Error al crear usuario' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN' && locals.user?.username !== 'dueño') {
			return fail(403, { message: 'No autorizado' });
		}

		const data = await request.formData();
		const userId = data.get('userId') as string; // En realidad es el username

		// No permitir eliminar usuarios predefinidos importantes
		const protectedUsers = ['admin', 'dueño'];
		if (protectedUsers.includes(userId)) {
			return fail(400, { message: 'No se puede eliminar este usuario del sistema' });
		}

		// No permitir que un usuario se elimine a sí mismo
		if (userId === locals.user.username) {
			return fail(400, { message: 'No puedes eliminarte a ti mismo' });
		}

		try {
			if (SECURE_USERS[userId]) {
				delete SECURE_USERS[userId];
				return { success: true };
			} else {
				return fail(404, { message: 'Usuario no encontrado' });
			}
		} catch (error) {
			console.error('Error eliminando usuario:', error);
			return fail(500, { message: 'Error al eliminar usuario' });
		}
	}
};