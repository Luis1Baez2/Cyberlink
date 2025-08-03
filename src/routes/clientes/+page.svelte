<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	export let data;
	
	let searchTerm = '';
	let showDeleteModal = false;
	let customerToDelete: any = null;
	let copiedPhone: string | null = null;
	
	// Filtrar clientes por búsqueda
	$: filteredCustomers = data.customers.filter(customer => 
		customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		customer.phone.includes(searchTerm) ||
		customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);
	
	// Formatear fecha
	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('es-AR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
	
	// Función mejorada para copiar teléfono
	async function copyPhone(phone: string) {
		try {
			// Método moderno
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(phone);
			} else {
				// Método alternativo para navegadores antiguos o contextos no seguros
				const textArea = document.createElement("textarea");
				textArea.value = phone;
				textArea.style.position = "fixed";
				textArea.style.left = "-999999px";
				textArea.style.top = "-999999px";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				textArea.remove();
			}
			
			// Mostrar feedback visual
			copiedPhone = phone;
			setTimeout(() => {
				copiedPhone = null;
			}, 2000);
		} catch (error) {
			console.error('Error al copiar:', error);
			// Intentar método alternativo si falla
			const textArea = document.createElement("textarea");
			textArea.value = phone;
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
				copiedPhone = phone;
				setTimeout(() => {
					copiedPhone = null;
				}, 2000);
			} catch (err) {
				console.error('Error con método alternativo:', err);
			}
			textArea.remove();
		}
	}
	
	// Abrir modal de eliminar
	function openDeleteModal(customer: any) {
		customerToDelete = customer;
		showDeleteModal = true;
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header con gradiente mejorado -->
	<div class="relative overflow-hidden">
		<!-- Gradiente de fondo con transición más suave y un poco más oscuro -->
		<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
		
		<div class="relative z-10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div in:fly={{ y: 20, duration: 600, delay: 100 }}>
						<h1 class="text-3xl sm:text-4xl font-light text-white mb-2">
							Gestión de Clientes
						</h1>
						<p class="text-white/80 text-lg font-light">
							{data.customers.length} clientes registrados
						</p>
					</div>
					
					<div in:fly={{ y: 20, duration: 600, delay: 200 }} class="mt-6 sm:mt-0 flex items-center space-x-3">
						<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-1 flex space-x-2">
							<a href="/clientes/nuevo" 
								class="bg-transparent text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 flex items-center">
								<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
								</svg>
								Nuevo Cliente
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Curva suave en la parte inferior -->
		<div class="absolute bottom-0 left-0 right-0">
			<svg class="w-full h-16 sm:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
				<path d="M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z" fill="currentColor" class="text-gray-50 dark:text-gray-900" />
			</svg>
		</div>
	</div>
	
	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative z-10">
		<!-- Barra de búsqueda -->
		<div in:scale={{ duration: 500, delay: 300 }} 
			class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-all duration-500">
			<div class="relative">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Buscar por nombre, teléfono o email..."
					class="w-full px-12 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300"
				/>
				<svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</div>
		</div>
		
		<!-- Grid de clientes -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredCustomers as customer, index}
				<div in:scale={{ duration: 500, delay: 400 + index * 50 }} 
					class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex items-start justify-between mb-4">
						<div class="flex items-center space-x-3">
							<div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-300 rounded-full flex items-center justify-center text-white text-xl font-medium shadow-md">
								{customer.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{customer.name}</h3>
								<p class="text-sm text-gray-500 dark:text-gray-400">Cliente desde {formatDate(customer.createdAt)}</p>
							</div>
						</div>
						{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER'}
							<button
								on:click={() => openDeleteModal(customer)}
								class="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
								</svg>
							</button>
						{/if}
					</div>
					
					<div class="space-y-3">
						<!-- Teléfono -->
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
								</svg>
								<a href="tel:{customer.phone}" class="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
									{customer.phone}
								</a>
							</div>
							<button
								on:click={() => copyPhone(customer.phone)}
								class="relative text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
								title={copiedPhone === customer.phone ? "¡Copiado!" : "Copiar teléfono"}
							>
								{#if copiedPhone === customer.phone}
									<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
								{:else}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
									</svg>
								{/if}
							</button>
						</div>
						
						<!-- Email -->
						{#if customer.email}
							<div class="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
								</svg>
								<a href="mailto:{customer.email}" class="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 truncate">
									{customer.email}
								</a>
							</div>
						{/if}
						
						<!-- Dirección -->
						{#if customer.address}
							<div class="flex items-start space-x-2 text-gray-600">
								<svg class="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
								</svg>
								<span class="text-sm">{customer.address}</span>
							</div>
						{/if}
						
						<!-- Estadísticas -->
						<div class="flex items-center justify-between pt-3 border-t dark:border-gray-700">
							<div class="text-center">
								<p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{customer._count.repairs}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">Reparaciones</p>
							</div>
							<div class="text-center">
								<p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{customer._count.orders}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">Compras</p>
							</div>
							<a href="/clientes/{customer.id}" 
								class="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-300 text-white rounded-xl text-sm font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
								Ver detalles
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		{#if filteredCustomers.length === 0}
			<div in:fade={{ duration: 300 }} 
				class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-12 text-center">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron clientes</h3>
				<p class="text-gray-500 dark:text-gray-400">
					{#if searchTerm}
						No hay clientes que coincidan con "{searchTerm}"
					{:else}
						Aún no hay clientes registrados
					{/if}
				</p>
			</div>
		{/if}
	</div>
</div>

<!-- Modal de confirmación de eliminación -->
{#if showDeleteModal}
<div class="fixed z-50 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showDeleteModal = false}></div>
		
		<div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
				<div class="sm:flex sm:items-start">
					<div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
						<svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
							Eliminar cliente
						</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500 dark:text-gray-400">
								¿Estás seguro de que deseas eliminar a <strong>{customerToDelete?.name}</strong>? 
								Esta acción no se puede deshacer.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div class="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="customerId" value={customerToDelete?.id} />
					<button
						type="submit"
						class="w-full inline-flex justify-center rounded-2xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
					>
						Eliminar
					</button>
				</form>
				<button
					type="button"
					on:click={() => showDeleteModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
</div>
{/if}