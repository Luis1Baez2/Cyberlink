export const roleTranslations: Record<string, string> = {
	ADMIN: 'Administrador',
	EMPLOYEE: 'Vendedor',
	TECHNICIAN: 'Técnico',
	MANAGER: 'Gerente',
	OWNER: 'Dueño',
	CASHIER: 'Cajero'
};

export function translateRole(role: string): string {
	return roleTranslations[role] || role;
}