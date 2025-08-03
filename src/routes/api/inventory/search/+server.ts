import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';
	
	if (searchTerm.length < 2) {
		return json([]);
	}
	
	try {
		const products = await db.product.findMany({
			where: {
				AND: [
					{ stock: { gt: 0 } }, // Solo productos con stock
					{
						OR: [
							{ code: { contains: searchTerm } },
							{ name: { contains: searchTerm } },
							{ category: { name: { contains: searchTerm } } }
						]
					}
				]
			},
			include: {
				category: true
			},
			take: 20,
			orderBy: {
				name: 'asc'
			}
		});
		
		return json(products);
	} catch (error) {
		console.error('Error buscando productos:', error);
		return json([]);
	}
};