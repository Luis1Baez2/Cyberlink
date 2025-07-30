// Función simple para hashear contraseñas (sin dependencias)
export function simpleHash(text: string): string {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convertir a 32bit integer
	}
	return Math.abs(hash).toString(16);
}

// Usuarios con contraseñas hasheadas
export const SECURE_USERS = {
	'admin': {
		password: simpleHash('1234'),
		role: 'ADMIN',
		name: 'Administrador',
		recoveryEmail: ''
	},
	'dueño': {
		password: simpleHash('1234'),
		role: 'ADMIN',
		name: 'Dueño',
		recoveryEmail: ''
	},
	'vendedor': {
		password: simpleHash('1234'),
		role: 'EMPLOYEE',
		name: 'Vendedor',
		recoveryEmail: ''
	},
	'cajero': {
		password: simpleHash('1234'),
		role: 'EMPLOYEE',
		name: 'Cajero',
		recoveryEmail: ''
	},
	'juan': {
		password: simpleHash('1234'),
		role: 'TECHNICIAN',
		name: 'Juan',
		recoveryEmail: ''
	},
	'rodrigo': {
		password: simpleHash('1234'),
		role: 'TECHNICIAN',
		name: 'Rodrigo',
		recoveryEmail: ''
	},
	'franco': {
		password: simpleHash('1234'),
		role: 'TECHNICIAN',
		name: 'Franco',
		recoveryEmail: ''
	}
};

// Verificar usuario y contraseña
export function checkLogin(username: string, password: string): boolean {
	const user = SECURE_USERS[username];
	if (!user) return false;
	
	return user.password === simpleHash(password);
}

// Clave secreta para firmar tokens (en producción usar variable de entorno)
const SECRET = 'promanager-secret-2024';

// Almacenar intentos fallidos (en producción usar Redis o base de datos)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Verificar si el usuario está bloqueado
export function isUserBlocked(username: string): boolean {
	const attempts = loginAttempts.get(username);
	if (!attempts) return false;
	
	// Bloquear por 15 minutos después de 5 intentos
	const BLOCK_TIME = 15 * 60 * 1000; // 15 minutos
	const MAX_ATTEMPTS = 5;
	
	if (attempts.count >= MAX_ATTEMPTS) {
		const timePassed = Date.now() - attempts.lastAttempt;
		if (timePassed < BLOCK_TIME) {
			const minutesLeft = Math.ceil((BLOCK_TIME - timePassed) / 60000);
			console.log(`Usuario ${username} bloqueado. Tiempo restante: ${minutesLeft} minutos`);
			return true;
		} else {
			// Resetear intentos después del tiempo de bloqueo
			loginAttempts.delete(username);
			return false;
		}
	}
	
	return false;
}

// Registrar intento fallido
export function recordFailedAttempt(username: string): number {
	const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
	attempts.count++;
	attempts.lastAttempt = Date.now();
	loginAttempts.set(username, attempts);
	
	return 5 - attempts.count; // Intentos restantes
}

// Limpiar intentos al login exitoso
export function clearLoginAttempts(username: string): void {
	loginAttempts.delete(username);
}

// Crear token firmado con tiempo de expiración
export function createSignedToken(data: any): string {
	const tokenData = {
		...data,
		createdAt: Date.now(),
		expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
	};
	const payload = JSON.stringify(tokenData);
	const signature = simpleHash(payload + SECRET);
	return Buffer.from(payload).toString('base64') + '|' + signature;
}

// Verificar token firmado
export function verifySignedToken(token: string): any {
	try {
		const [payloadBase64, signature] = token.split('|');
		if (!payloadBase64 || !signature) return null;
		
		// Decodificar payload
		const payload = Buffer.from(payloadBase64, 'base64').toString();
		
		// Verificar que la firma sea correcta
		const expectedSignature = simpleHash(payload + SECRET);
		if (signature !== expectedSignature) {
			console.log('Token manipulado detectado!');
			return null;
		}
		
		const data = JSON.parse(payload);
		
		// Verificar expiración
		if (data.expiresAt && data.expiresAt < Date.now()) {
			console.log('Token expirado');
			return null;
		}
		
		// Verificar que el token no sea muy viejo (prevenir replay attacks)
		if (data.createdAt && Date.now() - data.createdAt > 30 * 24 * 60 * 60 * 1000) {
			console.log('Token demasiado antiguo');
			return null;
		}
		
		return data;
	} catch (error) {
		return null;
	}
}

// Verificar si la sesión necesita renovarse (más de 1 día)
export function shouldRenewToken(user: any): boolean {
	if (!user.createdAt) return true;
	const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
	return user.createdAt < oneDayAgo;
}