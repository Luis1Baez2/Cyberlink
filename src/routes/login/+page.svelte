<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	
	export let form;
	let loading = false;
	let showPassword = false;
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
	<!-- Círculos decorativos animados más suaves -->
	<div class="absolute top-0 -left-4 w-72 h-72 bg-gray-200 dark:bg-gray-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-20 animate-blob"></div>
	<div class="absolute top-0 -right-4 w-72 h-72 bg-slate-200 dark:bg-slate-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-20 animate-blob animation-delay-2000"></div>
	<div class="absolute -bottom-8 left-20 w-72 h-72 bg-zinc-200 dark:bg-zinc-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-20 animate-blob animation-delay-4000"></div>
	<div class="absolute bottom-0 right-20 w-72 h-72 bg-neutral-200 dark:bg-neutral-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-20 animate-blob animation-delay-6000"></div>
	
	<div class="min-h-screen flex items-center justify-center px-4 relative z-10">
		{#if mounted}
			<div in:fly={{ y: 50, duration: 800, delay: 200 }} 
				class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-500 hover:shadow-3xl">
				
				<!-- Logo y título -->
				<div class="text-center mb-8">
					<div in:fade={{ duration: 600, delay: 400 }} 
						class="w-20 h-20 bg-gradient-to-br from-purple-400 via-purple-500 to-green-400 rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
						🛠️
					</div>
					<h1 in:fly={{ y: 20, duration: 600, delay: 600 }} 
						class="text-4xl font-light text-gray-800 dark:text-gray-100 mb-2">
						ProManager
					</h1>
					<p in:fade={{ duration: 600, delay: 800 }} 
						class="text-gray-600 dark:text-gray-400 text-sm">Sistema de Gestión Integral</p>
				</div>
				
				<form method="POST" use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}} class="space-y-6">
					<!-- Campo de usuario -->
					<div in:fly={{ x: -30, duration: 600, delay: 1000 }}>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuario</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
								👤
							</span>
							<input
								name="username"
								type="text"
								required
								placeholder="Ingresa tu usuario"
								class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
							/>
						</div>
					</div>
					
					<!-- Campo de contraseña -->
					<div in:fly={{ x: -30, duration: 600, delay: 1200 }}>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
								🔒
							</span>
							<input
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								placeholder="Ingresa tu contraseña"
								class="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
							/>
							<button
								type="button"
								on:click={() => showPassword = !showPassword}
								class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
							>
								{#if showPassword}
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
									</svg>
								{:else}
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								{/if}
							</button>
						</div>
					</div>
					
					<!-- Botón de inicio de sesión -->
					<div in:fly={{ y: 30, duration: 600, delay: 1400 }}>
						<button
							type="submit"
							disabled={loading}
							class="w-full bg-gradient-to-r from-purple-400 via-purple-500 to-green-400 text-white py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
						>
							{#if loading}
								<span class="inline-flex items-center">
									<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Iniciando sesión...
								</span>
							{:else}
								Iniciar Sesión
							{/if}
						</button>
					</div>
					
					<!-- Mensaje de error -->
					{#if form?.error}
						<div in:fade={{ duration: 300 }} 
							class="p-4 rounded-2xl text-center text-sm
								{form?.blocked ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 
								 form?.warning ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' : 
								 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900'}">
							{form.error}
						</div>
					{/if}
				</form>
				
				<!-- Link de recuperación -->
				<div in:fade={{ duration: 600, delay: 1600 }} class="mt-8 text-center">
					<a href="/recuperar-password" 
						class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200">
						¿Olvidaste tu contraseña?
					</a>
				</div>
				
				<!-- Footer -->
				<div in:fade={{ duration: 600, delay: 1800 }} class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
					<p class="text-center text-xs text-gray-500 dark:text-gray-400">
						© 2025 ProManager. Todos los derechos reservados.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes blob {
		0% {
			transform: translate(0px, 0px) scale(1);
		}
		33% {
			transform: translate(30px, -50px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
		100% {
			transform: translate(0px, 0px) scale(1);
		}
	}
	
	.animate-blob {
		animation: blob 7s infinite;
	}
	
	.animation-delay-2000 {
		animation-delay: 2s;
	}
	
	.animation-delay-4000 {
		animation-delay: 4s;
	}
	
	.animation-delay-6000 {
		animation-delay: 6s;
	}
</style>