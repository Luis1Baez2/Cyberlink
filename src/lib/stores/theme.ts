import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Crear store para el tema
function createThemeStore() {
	// Obtener tema inicial del localStorage o usar 'light' por defecto
	const initialTheme = browser ? localStorage.getItem('theme') || 'light' : 'light';
	
	const { subscribe, set, update } = writable(initialTheme);
	
	return {
		subscribe,
		toggle: () => {
			update(theme => {
				const newTheme = theme === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					// Actualizar clase en el documento
					if (newTheme === 'dark') {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				}
				return newTheme;
			});
		},
		set: (theme: string) => {
			set(theme);
			if (browser) {
				localStorage.setItem('theme', theme);
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
		}
	};
}

export const theme = createThemeStore();