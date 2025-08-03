<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import InventoryModal from '$lib/components/InventoryModal.svelte';
	import RepairsModal from '$lib/components/RepairsModal.svelte';
	export let data;
	export let form;

	let productSearchTerm = data.productSearch || '';
	let repairSearchTerm = data.repairSearch || '';
	let cart = [];
	let showInventoryModal = false;
	let showRepairsModal = false;

	// Debounce para las búsquedas
	let productSearchTimeout;
	let repairSearchTimeout;

	function searchProducts() {
		clearTimeout(productSearchTimeout);
		productSearchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (productSearchTerm.length >= 2) {
				url.searchParams.set('productSearch', productSearchTerm);
			} else {
				url.searchParams.delete('productSearch');
			}
			goto(url.toString(), { replaceState: true });
		}, 500);
	}

	function searchRepairs() {
		clearTimeout(repairSearchTimeout);
		repairSearchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (repairSearchTerm.length >= 2) {
				url.searchParams.set('repairSearch', repairSearchTerm);
			} else {
				url.searchParams.delete('repairSearch');
			}
			goto(url.toString(), { replaceState: true });
		}, 500);
	}

	function addToCart(type, item) {
		const cartItem = {
			id: item.id,
			type,
			name: type === 'product' ? item.name : `${item.brand} ${item.model}`,
			price: type === 'product' ? item.price : item.finalCost || item.estimatedCost || 0,
			quantity: 1,
			data: item
		};
		
		const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id && cartItem.type === type);
		if (existingIndex >= 0) {
			cart[existingIndex].quantity += 1;
		} else {
			cart = [...cart, cartItem];
		}
	}

	function removeFromCart(index) {
		cart = cart.filter((_, i) => i !== index);
	}

	function updateQuantity(index, quantity) {
		if (quantity <= 0) {
			removeFromCart(index);
		} else {
			cart[index].quantity = quantity;
			cart = [...cart];
		}
	}

	function handleInventorySelect(product) {
		addToCart('product', product);
		productSearchTerm = product.code;
		searchProducts();
	}

	function handleRepairSelect(repair) {
		addToCart('repair', repair);
		repairSearchTerm = repair.repairNumber;
		searchRepairs();
	}

	$: total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
	<!-- Header con gradiente mejorado -->
	<div class="relative overflow-hidden">
		<!-- Gradiente de fondo con transición más suave y un poco más oscuro -->
		<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
		
		<div class="relative z-10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 class="text-3xl sm:text-4xl font-light text-white mb-2">
							Facturación
						</h1>
						<p class="text-white/80 text-lg font-light">
							Sistema de facturación y ventas • {cart.length} items en el carrito
						</p>
					</div>
					
					<div class="mt-6 sm:mt-0 flex items-center space-x-3">
						<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-1 flex space-x-2 relative z-20">
							<button
								type="button"
								disabled={cart.length === 0}
								class="bg-transparent text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Generar Factura
							</button>
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

	<!-- Contenido principal con margen negativo para superponer -->
	<div class="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-8 pb-12">
		
		{#if form?.error}
			<div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
				{form.message}
			</div>
		{/if}

		<!-- Áreas de búsqueda lado a lado -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Área de productos -->
			<div class="bg-white rounded-lg shadow">
				<div class="p-4 border-b border-gray-200">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-gray-900 flex items-center">
							<svg class="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
							</svg>
							Productos/Inventario
						</h3>
						<button
							on:click={() => showInventoryModal = true}
							class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-1"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
							Ver Inventario
						</button>
					</div>
				</div>
				<div class="p-4">
					<input
						type="text"
						bind:value={productSearchTerm}
						on:input={searchProducts}
						placeholder="Buscar productos (código, nombre, marca)..."
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
					/>
					
					<div class="mt-4 max-h-64 overflow-y-auto">
						{#if productSearchTerm.length < 2}
							<p class="text-gray-500 text-sm">Escriba al menos 2 caracteres para buscar</p>
						{:else if data.products.length === 0}
							<p class="text-gray-500 text-sm">No se encontraron productos</p>
						{:else}
							<div class="space-y-2">
								{#each data.products as product}
									<div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
										<div class="flex justify-between items-start">
											<div class="flex-1">
												<h4 class="font-medium text-gray-900">{product.code}</h4>
												<p class="text-sm text-gray-600">{product.name}</p>
												<p class="text-sm text-gray-500">{product.category.name} • Stock: {product.stock}</p>
												<p class="text-sm font-medium text-green-600">${product.price}</p>
											</div>
											<button
												on:click={() => addToCart('product', product)}
												class="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
											>
												Agregar
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Área de reparaciones -->
			<div class="bg-white rounded-lg shadow">
				<div class="p-4 border-b border-gray-200">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-gray-900 flex items-center">
							<svg class="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Reparaciones Completadas
						</h3>
						<button
							on:click={() => showRepairsModal = true}
							class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-1"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
							Ver Reparaciones
						</button>
					</div>
				</div>
				<div class="p-4">
					<input
						type="text"
						bind:value={repairSearchTerm}
						on:input={searchRepairs}
						placeholder="Buscar reparaciones (número, cliente, equipo)..."
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
					/>
					
					<div class="mt-4 max-h-64 overflow-y-auto">
						{#if repairSearchTerm.length < 2}
							<p class="text-gray-500 text-sm">Escriba al menos 2 caracteres para buscar</p>
						{:else if data.repairs.length === 0}
							<p class="text-gray-500 text-sm">No se encontraron reparaciones</p>
						{:else}
							<div class="space-y-2">
								{#each data.repairs as repair}
									<div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
										<div class="flex justify-between items-start">
											<div class="flex-1">
												<h4 class="font-medium text-gray-900">#{repair.repairNumber}</h4>
												<p class="text-sm text-gray-600">{repair.customer.name}</p>
												<p class="text-sm text-gray-500">{repair.brand} {repair.model}</p>
												<p class="text-sm font-medium text-purple-600">${repair.finalCost || repair.estimatedCost || 0}</p>
											</div>
											<button
												on:click={() => addToCart('repair', repair)}
												class="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
											>
												Facturar
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Carrito de facturación -->
		{#if cart.length > 0}
			<div class="bg-white rounded-lg shadow">
				<div class="p-4 border-b border-gray-200">
					<h3 class="text-lg font-medium text-gray-900 flex items-center">
						<svg class="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2-2v4" />
						</svg>
						Carrito de Facturación ({cart.length} items)
					</h3>
				</div>
				<div class="p-4">
					<div class="space-y-3">
						{#each cart as item, index}
							<div class="flex items-center justify-between border border-gray-200 rounded-lg p-3">
								<div class="flex-1">
									<h4 class="font-medium text-gray-900">
										{item.name}
										{#if item.type === 'product'}
											<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Producto</span>
										{:else}
											<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Reparación</span>
										{/if}
									</h4>
									<p class="text-sm text-gray-600">${item.price} c/u</p>
								</div>
								<div class="flex items-center space-x-2">
									<input
										type="number"
										min="1"
										bind:value={item.quantity}
										on:change={() => updateQuantity(index, item.quantity)}
										class="w-16 px-2 py-1 border border-gray-300 rounded text-center"
									/>
									<span class="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
									<button
										on:click={() => removeFromCart(index)}
										class="text-red-500 hover:text-red-700"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
					
					<div class="mt-6 border-t pt-4">
						<div class="flex justify-between items-center text-lg font-bold">
							<span>Total:</span>
							<span>${total.toFixed(2)}</span>
						</div>
						<button
							class="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
						>
							Generar Factura - ${total.toFixed(2)}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Modales -->
<InventoryModal 
	isOpen={showInventoryModal}
	onClose={() => showInventoryModal = false}
	onSelectProduct={handleInventorySelect}
/>

<RepairsModal
	isOpen={showRepairsModal}
	onClose={() => showRepairsModal = false}
	onSelectRepair={handleRepairSelect}
/>