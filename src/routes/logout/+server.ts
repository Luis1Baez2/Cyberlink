import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Eliminar la cookie
	cookies.delete('auth-token', { path: '/' });
	
	// Devolver respuesta exitosa
	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};