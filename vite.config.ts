import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0', // Permite acceso desde otras PCs
		port: 3000       // Puerto fijo
	},
	preview: {
		host: '0.0.0.0', // Para modo producción
		port: 3000
	}
});