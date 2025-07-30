import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Hash simple (mismo del sistema principal)
function simpleHash(text: string): string {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16);
}

// Usuarios (mismos que el sistema principal)
const USERS = {
	'dueño': { password: '170842', role: 'ADMIN', name: 'Dueño del Negocio' },
	'admin': { password: '170842', role: 'ADMIN', name: 'Administrador' },
	'juan': { password: '170842', role: 'TECHNICIAN', name: 'Juan' },
	'rodrigo': { password: '170842', role: 'TECHNICIAN', name: 'Rodrigo' },
	'franco': { password: '170842', role: 'TECHNICIAN', name: 'Franco' },
	'vendedor': { password: '170842', role: 'EMPLOYEE', name: 'Vendedor' },
	'cajero': { password: '170842', role: 'EMPLOYEE', name: 'Cajero' }
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const startTime = Date.now();
		console.log('\n=== 🚀 TEST LOGIN INICIADO ===');
		console.log('Timestamp:', new Date().toISOString());
		
		try {
			// Obtener datos del formulario
			const data = await request.formData();
			const username = data.get('username')?.toString() || '';
			const password = data.get('password')?.toString() || '';
			
			console.log('📝 Datos recibidos:');
			console.log('  Usuario:', username);
			console.log('  Password length:', password.length);
			console.log('  Password:', password); // Solo para debug
			
			// Verificar que llegaron los datos
			if (!username || !password) {
				console.log('❌ Datos faltantes');
				return { error: 'Usuario y contraseña son requeridos' };
			}
			
			// Verificar usuario
			const user = USERS[username];
			if (!user) {
				console.log('❌ Usuario no encontrado:', username);
				console.log('   Usuarios disponibles:', Object.keys(USERS));
				return { error: `Usuario "${username}" no encontrado` };
			}
			
			console.log('✅ Usuario encontrado:', user.name);
			
			// Calcular hash de la contraseña
			const passwordHash = simpleHash(password);
			console.log('🔐 Verificación de contraseña:');
			console.log('  Hash calculado:', passwordHash);
			console.log('  Hash esperado:', user.password);
			console.log('  Match:', passwordHash === user.password);
			
			// Verificar contraseña
			if (passwordHash !== user.password) {
				console.log('❌ Contraseña incorrecta');
				return { 
					error: `Contraseña incorrecta para ${username}. Hash: ${passwordHash}, Esperado: ${user.password}` 
				};
			}
			
			console.log('✅ Login exitoso para:', username, '(' + user.name + ')');
			
			// Crear token simple compatible con el sistema principal
			const tokenData = {
				username,
				role: user.role,
				name: user.name,
				id: 1, // ID dummy para compatibilidad
				loginTime: new Date().toISOString(),
				source: 'test-login'
			};
			
			const token = JSON.stringify(tokenData);
			console.log('🎫 Token creado:', token.substring(0, 100) + '...');
			
			// Guardar cookie
			cookies.set('auth-token', token, {
				path: '/',
				maxAge: 60 * 60 * 24, // 24 horas
				httpOnly: false // Para debug, permitir acceso desde JS
			});
			
			console.log('🍪 Cookie guardada');
			
			// Determinar redirección según rol
			let redirectUrl = '/';
			if (user.role === 'TECHNICIAN') {
				redirectUrl = '/reparaciones';
			} else if (user.role === 'EMPLOYEE') {
				redirectUrl = '/inventario';
			}
			
			const elapsed = Date.now() - startTime;
			console.log('⏱️ Proceso completado en:', elapsed + 'ms');
			console.log('🔄 Redirigiendo a:', redirectUrl);
			console.log('=== TEST LOGIN COMPLETADO ===\n');
			
			// Redireccionar
			throw redirect(302, redirectUrl);
			
		} catch (error) {
			console.log('💥 Error en test login:', error);
			
			// Si es un redirect, dejarlo pasar
			if (error instanceof Response) {
				throw error;
			}
			
			return { error: 'Error interno del servidor: ' + error.message };
		}
	}
};