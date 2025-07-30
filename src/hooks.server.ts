import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { verifySignedToken, shouldRenewToken, createSignedToken } from '$lib/server/simple-auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Obtener token de la cookie
	const token = event.cookies.get('auth-token');
	
	if (token) {
		// Verificar token firmado
		let user = verifySignedToken(token);
		
		// Si no es un token firmado, intentar como token simple (para debug)
		if (!user) {
			try {
				const simpleUser = JSON.parse(token);
				if (simpleUser.username && simpleUser.role) {
					user = simpleUser;
					console.log('Usando token simple para debug:', simpleUser.username);
				}
			} catch (e) {
				// No es un JSON válido
			}
		}
		
		if (user) {
			// Eliminar campos de control del token
			const { createdAt, expiresAt, ...userData } = user;
			event.locals.user = userData;
			
			// Renovar token si es necesario (más de 1 día) - solo para tokens firmados
			if (user.createdAt && shouldRenewToken(user)) {
				const newToken = createSignedToken(userData);
				event.cookies.set('auth-token', newToken, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7 // 7 días
				});
				console.log('Token renovado automáticamente');
			}
		} else {
			// Token inválido, expirado o manipulado
			event.cookies.delete('auth-token', { path: '/' });
			event.locals.user = null;
		}
	}

	// Rutas protegidas (todas excepto login y recuperar-password)
	const publicRoutes = ['/login', '/recuperar-password', '/simple-login', '/debug', '/test-login'];
	const isPublicRoute = publicRoutes.some(route => 
		event.url.pathname === route || event.url.pathname.startsWith(route + '/')
	);
	const isProtectedRoute = !isPublicRoute;

	// Si es una ruta protegida y no hay usuario, redirigir a login
	if (isProtectedRoute && !event.locals.user && event.url.pathname !== '/login') {
		// Si es una llamada API o espera JSON, devolver error JSON
		const acceptHeader = event.request.headers.get('accept') || '';
		const contentType = event.request.headers.get('content-type') || '';
		
		if (acceptHeader.includes('application/json') || contentType.includes('application/json')) {
			return new Response(JSON.stringify({ error: 'Not authenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		throw redirect(302, '/login');
	}

	// Si está en login y ya está autenticado, redirigir según rol
	if (event.url.pathname === '/login' && event.locals.user) {
		if (event.locals.user.role === 'TECHNICIAN') {
			throw redirect(302, '/reparaciones');
		} else if (event.locals.user.role === 'EMPLOYEE') {
			throw redirect(302, '/inventario');
		} else {
			throw redirect(302, '/');
		}
	}

	return resolve(event);
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	
	// Log del error en el servidor
	console.error(`Error ${errorId}:`, {
		status,
		message,
		url: event.url.pathname,
		method: event.request.method,
		headers: Object.fromEntries(event.request.headers.entries()),
		error: error instanceof Error ? {
			message: error.message,
			stack: error.stack
		} : error
	});
	
	// Verificar si el cliente espera JSON
	const acceptHeader = event.request.headers.get('accept') || '';
	const contentType = event.request.headers.get('content-type') || '';
	const isJsonRequest = acceptHeader.includes('application/json') || 
		contentType.includes('application/json') ||
		event.url.pathname.includes('.json');
	
	// Si es una petición AJAX o espera JSON
	if (isJsonRequest || event.request.headers.get('x-requested-with') === 'XMLHttpRequest') {
		// Devolver error como JSON
		const errorResponse = {
			error: true,
			message: import.meta.env.DEV 
				? (error instanceof Error ? error.message : 'Error desconocido')
				: 'Ha ocurrido un error en el servidor',
			errorId,
			status: status || 500
		};
		
		return new Response(JSON.stringify(errorResponse), {
			status: status || 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	// En desarrollo, mostrar más detalles
	if (import.meta.env.DEV) {
		return {
			message: error instanceof Error ? error.message : 'Error desconocido',
			errorId
		};
	}
	
	// En producción, mensajes genéricos
	return {
		message: 'Ha ocurrido un error en el servidor',
		errorId
	};
};