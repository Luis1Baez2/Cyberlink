import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { name, phone, email, address } = data;

		// Validar campos requeridos
		if (!name || !phone) {
			return json(
				{ message: 'Nombre y teléfono son requeridos' },
				{ status: 400 }
			);
		}

		// Verificar si ya existe un cliente con ese teléfono
		const existingCustomer = await db.cliente.findFirst({
			where: {
				telefono: phone
			}
		});

		if (existingCustomer) {
			return json(
				{ message: 'Ya existe un cliente con ese número de teléfono' },
				{ status: 400 }
			);
		}

		// Crear el nuevo cliente
		const newCustomer = await db.cliente.create({
			data: {
				nombre: name,
				telefono: phone,
				correo: email || null,
				direccion: address || null
			}
		});

		// Retornar el cliente en el formato esperado por el frontend
		return json({
			id: newCustomer.id,
			name: newCustomer.nombre,
			phone: newCustomer.telefono,
			email: newCustomer.correo,
			address: newCustomer.direccion
		});

	} catch (error: any) {
		console.error('Error creando cliente:', error);
		
		if (error.code === 'P2002') {
			return json(
				{ message: 'Ya existe un cliente con esos datos' },
				{ status: 400 }
			);
		}

		return json(
			{ message: 'Error al crear el cliente' },
			{ status: 500 }
		);
	}
};