<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, scale } from 'svelte/transition';
	
	export let form;
	
	let loading = false;
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
	<!-- Header -->
	<div class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-green-400"></div>
		<div class="absolute inset-0 bg-black/10 backdrop-blur-3xl"></div>
		
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div in:fly={{ y: 20, duration: 600, delay: 100 }}>
				<h1 class="text-4xl font-light text-white mb-2">
					Nuevo Cliente
				</h1>
				<p class="text-white/80 text-lg font-light">
					Registrar un nuevo cliente en el sistema
				</p>
			</div>
		</div>
		
		<!-- Olas decorativas -->
		<div class="absolute bottom-0 left-0 right-0">
			<svg viewBox="0 0 1440 120" class="w-full h-16">
				<path fill="rgba(249, 250, 251, 1)" d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z" />
			</svg>
		</div>
	</div>
	
	<!-- Contenido principal -->
	<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative z-10">
		<div in:scale={{ duration: 500, delay: 300 }} 
			class="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500">
			
			{#if form?.error}
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
					<p class="text-red-800 text-sm">{form.error}</p>
				</div>
			{/if}
			
			<form method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}>
				<div class="space-y-6">
					<!-- Nombre -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
							Nombre completo *
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
							placeholder="Juan Pérez"
						/>
					</div>
					
					<!-- Teléfono -->
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
							Teléfono *
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							required
							class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
							placeholder="11-1234-5678"
						/>
					</div>
					
					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
							placeholder="cliente@email.com"
						/>
					</div>
					
					<!-- Dirección -->
					<div>
						<label for="address" class="block text-sm font-medium text-gray-700 mb-2">
							Dirección
						</label>
						<textarea
							id="address"
							name="address"
							rows="3"
							class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
							placeholder="Calle Falsa 123, Ciudad, Provincia"
						></textarea>
					</div>
					
					<!-- CUIT/DNI -->
					<div>
						<label for="taxId" class="block text-sm font-medium text-gray-700 mb-2">
							CUIT/DNI
						</label>
						<input
							type="text"
							id="taxId"
							name="taxId"
							class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
							placeholder="20-12345678-9"
						/>
					</div>
				</div>
				
				<!-- Botones -->
				<div class="flex gap-4 mt-8">
					<a href="/clientes" 
						class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium text-center hover:bg-gray-300 transition-colors duration-200">
						Cancelar
					</a>
					<button
						type="submit"
						disabled={loading}
						class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Guardando...' : 'Crear Cliente'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>