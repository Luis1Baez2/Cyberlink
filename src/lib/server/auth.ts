import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
	return jwt.sign(
		{ 
			id: user.id, 
			username: user.username,
			name: user.name,
			role: user.role 
		}, 
		JWT_SECRET, 
		{ expiresIn: '7d' }
	);
}

export function verifyToken(token: string): any {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}