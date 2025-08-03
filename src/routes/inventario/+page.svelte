<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	export let data;
	export let form;

	let showCreateForm = false;
	let editingProduct: any = null;
	let searchTerm = data.searchTerm || '';
	let searchTimeout: NodeJS.Timeout;
	let lowStockLimit = data.lowStockLimit;
	let showLowStockFilter = false;
	
	// Modal de notificación
	let showNotificationModal = false;
	let notificationProduct: any = null;
	let notificationData = {
		quantity: 1,
		purchaseLink: '',
		observations: ''
	};

	function showCreate() {
		showCreateForm = true;
		editingProduct = null;
	}

	function editProduct(product: any) {
		editingProduct = product;
		showCreateForm = true;
	}

	function cancelForm() {
		showCreateForm = false;
		editingProduct = null;
	}

	function filterByCategory(categoryId: string | number) {
		const url = new URL($page.url);
		if (categoryId === 'all') {
			url.searchParams.delete('category');
		} else {
			url.searchParams.set('category', categoryId.toString());
		}
		goto(url.toString());
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (searchTerm) {
				url.searchParams.set('search', searchTerm);
			} else {
				url.searchParams.delete('search');
			}
			goto(url.toString());
		}, 500); // Debounce de 500ms
	}

	function filterByLowStock() {
		const url = new URL($page.url);
		if (lowStockLimit !== null && lowStockLimit >= 0) {
			url.searchParams.set('lowStock', lowStockLimit.toString());
		} else {
			url.searchParams.delete('lowStock');
		}
		goto(url.toString());
	}

	function clearLowStockFilter() {
		lowStockLimit = null;
		showLowStockFilter = false;
		const url = new URL($page.url);
		url.searchParams.delete('lowStock');
		goto(url.toString());
	}
	
	function openNotificationModal(product: any) {
		notificationProduct = product;
		// Sugerir cantidad basada en stock mínimo
		const suggestedQuantity = Math.max(product.minStock - product.stock + 5, 5);
		notificationData = {
			quantity: suggestedQuantity,
			purchaseLink: '',
			observations: ''
		};
		showNotificationModal = true;
	}
	
	function closeNotificationModal() {
		showNotificationModal = false;
		notificationProduct = null;
	}


	// Iconos SVG minimalistas para cada categoría de hardware
	const categoryIcons = {
		'Notebooks': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<rect x="2" y="6" width="20" height="12" rx="2"/>
			<path d="M6 10h4M6 14h4"/>
		</svg>`,
		'RAM': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<rect x="3" y="8" width="18" height="8" rx="1"/>
			<path d="M7 8V6M11 8V6M13 8V6M17 8V6"/>
			<path d="M3 12h18"/>
		</svg>`,
		'Tarjetas Gráficas': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<rect x="2" y="8" width="20" height="10" rx="2"/>
			<path d="M6 12h4M14 12h4"/>
			<path d="M2 14h2M20 14h2"/>
			<circle cx="18" cy="10" r="1"/>
		</svg>`,
		'Discos': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<circle cx="12" cy="12" r="8"/>
			<circle cx="12" cy="12" r="3"/>
			<circle cx="12" cy="12" r="1"/>
		</svg>`,
		'Procesadores': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<rect x="6" y="6" width="12" height="12" rx="1"/>
			<path d="M9 2v4M15 2v4M9 18v4M15 18v4"/>
			<path d="M2 9h4M18 9h4M2 15h4M18 15h4"/>
		</svg>`,
		'Placas Madre': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
			<rect x="3" y="3" width="18" height="18" rx="2"/>
			<rect x="7" y="7" width="4" height="4" rx="1"/>
			<rect x="13" y="7" width="4" height="4" rx="1"/>
			<rect x="7" y="13" width="10" height="2" rx="1"/>
			<circle cx="5" cy="5" r="1"/>
			<circle cx="19" cy="5" r="1"/>
			<circle cx="5" cy="19" r="1"/>
			<circle cx="19" cy="19" r="1"/>
		</svg>`
	};
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
							Inventario
						</h1>
						<p class="text-white/80 text-lg font-light">
							Gestiona tus productos y stock
						</p>
					</div>
					
					<div class="mt-6 sm:mt-0 flex items-center space-x-3">
						<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-1 flex space-x-2 relative z-20">
							<button
								type="button"
								on:click={showCreate}
								class="bg-transparent text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 flex items-center"
							>
								<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Nuevo Producto
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
		<!-- Filtros por categoría con menú desplegable -->
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Filtrar por Categoría</h3>
			<div class="flex flex-wrap gap-3">
				<!-- Filtro "Todos" -->
				<button
					on:click={() => filterByCategory('all')}
					class="px-6 py-3 rounded-lg border-2 transition-all flex items-center gap-2 {data.selectedCategory === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
						<rect x="3" y="3" width="18" height="18" rx="2"/>
						<path d="M9 9h6M9 13h6"/>
					</svg>
					<span class="font-medium">Todos</span>
					<span class="text-sm">({data.products.length})</span>
				</button>

				<!-- Filtros por categoría principal con submenú -->
				{#each data.categories as category}
					<div class="relative group">
						<button
							on:click={() => filterByCategory(category.id)}
							class="px-6 py-3 rounded-lg border-2 transition-all flex items-center gap-2 
								{data.selectedCategory == category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
						>
							<span class="font-medium">{category.name}</span>
							<span class="text-sm">({data.categoryStats[category.id] || 0})</span>
							{#if category.children && category.children.length > 0}
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							{/if}
						</button>
						
						<!-- Submenú desplegable -->
						{#if category.children && category.children.length > 0}
							<div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 
								opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
								<div class="py-2">
									{#each category.children as subcategory}
										<button
											on:click={() => filterByCategory(subcategory.id)}
											class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between
												{data.selectedCategory == subcategory.id ? 'bg-blue-50 text-blue-700' : ''}"
										>
											<span class="text-sm">{subcategory.name}</span>
											<span class="text-xs text-gray-500">({data.categoryStats[subcategory.id] || 0})</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}

				<!-- Filtro de stock bajo -->
				<div class="relative">
					<button
						on:click={() => showLowStockFilter = !showLowStockFilter}
						class="px-6 py-3 rounded-lg border-2 transition-all flex items-center gap-2 {lowStockLimit !== null ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<span class="font-medium">Stock Bajo</span>
						{#if lowStockLimit !== null}
							<span class="text-sm">(≤ {lowStockLimit})</span>
						{/if}
					</button>
					
					{#if showLowStockFilter}
						<div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Mostrar productos con stock menor o igual a:
							</label>
							<div class="flex gap-2">
								<input
									type="number"
									min="0"
									bind:value={lowStockLimit}
									placeholder="Cantidad"
									class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
								/>
								<button
									on:click={filterByLowStock}
									class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
								>
									Filtrar
								</button>
							</div>
							{#if lowStockLimit !== null}
								<button
									on:click={clearLowStockFilter}
									class="mt-2 text-sm text-red-600 hover:text-red-800"
								>
									Limpiar filtro
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Barra de búsqueda -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<div class="flex items-center gap-4">
				<div class="flex-1">
					<label for="search" class="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>
					<div class="relative">
						<input
							type="text"
							id="search"
							bind:value={searchTerm}
							on:input={handleSearch}
							placeholder="Buscar por código, nombre o categoría..."
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
						/>
						<svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					{#if searchTerm}
						<p class="mt-2 text-sm text-gray-600">
							Buscando: "<span class="font-medium">{searchTerm}</span>" 
							<button 
								on:click={() => { searchTerm = ''; handleSearch(); }}
								class="ml-2 text-blue-600 hover:text-blue-800"
							>
								Limpiar
							</button>
						</p>
					{/if}
				</div>
			</div>
		</div>

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

		<!-- Formulario crear/editar -->
		{#if showCreateForm}
			<div class="bg-white shadow sm:rounded-lg mb-8">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
					</h3>
					
					<form method="POST" action="?/{editingProduct ? 'update' : 'create'}" use:enhance>
						{#if editingProduct}
							<input type="hidden" name="id" value={editingProduct.id} />
						{/if}
						
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{#if editingProduct}
							<div>
								<label for="code" class="block text-sm font-medium text-gray-700">Código</label>
								<input
									type="text"
									value={editingProduct.code}
									disabled
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
								/>
								<p class="mt-1 text-sm text-gray-500">El código se genera automáticamente</p>
							</div>
							{/if}

							<div class="{editingProduct ? '' : 'sm:col-span-2'}">
								<label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
								<input
									type="text"
									name="name"
									id="name"
									value={editingProduct?.name || ''}
									required
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label for="categoryId" class="block text-sm font-medium text-gray-700">Categoría</label>
								<select
									name="categoryId"
									id="categoryId"
									required
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								>
									<option value="">Seleccionar categoría</option>
									{#each data.categories as category}
										<optgroup label={category.name}>
											{#if category.children && category.children.length > 0}
												{#each category.children as subcategory}
													<option
														value={subcategory.id}
														selected={editingProduct?.categoryId === subcategory.id}
													>
														{subcategory.name}
													</option>
												{/each}
											{:else}
												<option
													value={category.id}
													selected={editingProduct?.categoryId === category.id}
												>
													{category.name}
												</option>
											{/if}
										</optgroup>
									{/each}
								</select>
							</div>

							<div>
								<label for="price" class="block text-sm font-medium text-gray-700">Precio</label>
								<input
									type="number"
									name="price"
									id="price"
									step="0.01"
									value={editingProduct?.price || ''}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label for="cost" class="block text-sm font-medium text-gray-700">Costo</label>
								<input
									type="number"
									name="cost"
									id="cost"
									step="0.01"
									value={editingProduct?.cost || ''}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label for="stock" class="block text-sm font-medium text-gray-700">Stock Actual</label>
								<input
									type="number"
									name="stock"
									id="stock"
									value={editingProduct?.stock || ''}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label for="minStock" class="block text-sm font-medium text-gray-700">Stock Mínimo</label>
								<input
									type="number"
									name="minStock"
									id="minStock"
									value={editingProduct?.minStock || ''}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>
						</div>

						<div class="mt-6 flex justify-end space-x-3">
							<button
								type="button"
								on:click={cancelForm}
								class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Cancelar
							</button>
							<button
								type="submit"
								class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								{editingProduct ? 'Actualizar' : 'Crear'}
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}

		<!-- Lista de productos -->
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
				<h3 class="text-lg leading-6 font-medium text-gray-900">
					Productos ({data.products.length})
				</h3>
			</div>
			
			{#if data.products.length === 0}
				<div class="text-center py-12">
					{#if searchTerm}
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<p class="mt-2 text-sm text-gray-500">No se encontraron productos para "<span class="font-medium">{searchTerm}</span>"</p>
						<button
							type="button"
							on:click={() => { searchTerm = ''; handleSearch(); }}
							class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
						>
							Limpiar búsqueda
						</button>
					{:else}
						<p class="text-sm text-gray-500">No hay productos registrados</p>
						<button
							type="button"
							on:click={showCreate}
							class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Crear tu primer producto
						</button>
					{/if}
				</div>
			{:else}
				<ul class="divide-y divide-gray-200">
					{#each data.products as product}
						<li class="px-4 py-4 sm:px-6 hover:bg-gray-50">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<div class="flex items-center">
										<div class="flex-1">
											<div class="flex items-center space-x-3">
												<p class="text-sm font-medium text-gray-900">{product.code}</p>
												<p class="text-sm text-gray-500">{product.name}</p>
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													{product.category.name}
												</span>
											</div>
											<div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
												<span>Precio: ${product.price}</span>
												<span>Costo: ${product.cost}</span>
												<span class="{product.stock <= product.minStock ? 'text-red-600 font-semibold' : ''}">
													Stock: {product.stock}
													{#if product.stock <= product.minStock}
														⚠️
													{/if}
												</span>
											</div>
										</div>
									</div>
								</div>
								<div class="flex items-center space-x-2">
									<button
										type="button"
										on:click={() => openNotificationModal(product)}
										class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
										title="Notificar compra al dueño"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
										</svg>
										Notificar
									</button>
									<button
										type="button"
										on:click={() => editProduct(product)}
										class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
									>
										Editar
									</button>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="id" value={product.id} />
										<button
											type="submit"
											on:click={(e) => {
												if (!confirm('¿Estás seguro de eliminar este producto?')) {
													e.preventDefault();
												}
											}}
											class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
										>
											Eliminar
										</button>
									</form>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

<!-- Modal de Notificación -->
{#if showNotificationModal && notificationProduct}
<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
	<div class="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 p-6">
		<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
			Solicitar Compra de Repuesto
		</h3>
		
		<div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
			<p class="text-sm text-gray-700 dark:text-gray-300">
				<strong>Producto:</strong> {notificationProduct.name} ({notificationProduct.code})
			</p>
			<p class="text-sm text-gray-700 dark:text-gray-300">
				<strong>Stock actual:</strong> {notificationProduct.stock} | 
				<strong>Stock mínimo:</strong> {notificationProduct.minStock}
			</p>
		</div>

		<form method="POST" action="?/notify" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					closeNotificationModal();
				}
			};
		}}>
			<input type="hidden" name="productId" value={notificationProduct.id} />
			<input type="hidden" name="productName" value={notificationProduct.name} />
			<input type="hidden" name="productCode" value={notificationProduct.code} />
			<input type="hidden" name="currentStock" value={notificationProduct.stock} />
			<input type="hidden" name="minStock" value={notificationProduct.minStock} />

			<div class="space-y-4">
				<div>
					<label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Cantidad a comprar
					</label>
					<input
						type="number"
						id="quantity"
						name="quantity"
						min="1"
						bind:value={notificationData.quantity}
						required
						class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
					/>
				</div>

				<div>
					<label for="purchaseLink" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Link de compra (opcional)
					</label>
					<input
						type="url"
						id="purchaseLink"
						name="purchaseLink"
						bind:value={notificationData.purchaseLink}
						placeholder="https://..."
						class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
					/>
				</div>

				<div>
					<label for="observations" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Observaciones
					</label>
					<textarea
						id="observations"
						name="observations"
						bind:value={notificationData.observations}
						rows="3"
						class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
						placeholder="Detalles adicionales sobre la compra..."
					></textarea>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={closeNotificationModal}
					class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
				>
					<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					Enviar Notificación
				</button>
			</div>
		</form>
	</div>
</div>
{/if}

