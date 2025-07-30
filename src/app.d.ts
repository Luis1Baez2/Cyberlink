declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				username: string;
				name: string;
				role: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	
	var __prismaPromise: Promise<void> | undefined;
}

export {};