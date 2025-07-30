import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Hash simple
function simpleHash(text: string): string {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16);
}

// Usuarios hardcodeados
const USERS = {
	'dueño': { password: '170842', role: 'ADMIN', name: 'Dueño' },
	'admin': { password: '170842', role: 'ADMIN', name: 'Admin' },
	'juan': { password: '170842', role: 'TECHNICIAN', name: 'Juan' },
	'rodrigo': { password: '170842', role: 'TECHNICIAN', name: 'Rodrigo' },
	'franco': { password: '170842', role: 'TECHNICIAN', name: 'Franco' },
	'vendedor': { password: '170842', role: 'EMPLOYEE', name: 'Vendedor' },
	'cajero': { password: '170842', role: 'EMPLOYEE', name: 'Cajero' }
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		console.log('=== SIMPLE LOGIN ATTEMPT ===');
		
		const data = await request.formData();
		const username = data.get('username')?.toString() || '';
		const password = data.get('password')?.toString() || '';
		
		console.log('Username:', username);
		console.log('Password received:', password);
		console.log('Password hash:', simpleHash(password));
		console.log('Expected hash:', USERS[username]?.password);
		
		// Verificar usuario
		const user = USERS[username];
		if (!user) {
			console.log('Usuario no encontrado');
			return { error: 'Usuario no encontrado' };
		}
		
		// Verificar contraseña
		const passwordHash = simpleHash(password);
		if (passwordHash !== user.password) {
			console.log('Contraseña incorrecta');
			return { error: `Contraseña incorrecta. Hash recibido: ${passwordHash}, Esperado: ${user.password}` };
		}
		
		console.log('Login exitoso para:', username);
		
		// Crear token simple
		const token = JSON.stringify({
			username,
			role: user.role,
			name: user.name,
			loginTime: new Date().toISOString()
		});
		
		// Guardar en cookie
		cookies.set('auth-token', token, {
			path: '/',
			maxAge: 60 * 60 * 24 // 24 horas
		});
		
		console.log('Redirigiendo a página principal');
		
		// Redirigir
		throw redirect(302, '/');
	}
};