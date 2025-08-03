<script lang="ts">
	export let isOpen = false;
	export let onClose = () => {};
	export let onSelectProduct = (product: any) => {};
	
	let searchTerm = '';
	let products = [];
	let categories = [];
	let loading = false;
	let selectedCategory = 'all';
	let lowStockLimit = null;
	let showLowStockFilter = false;
	let categoryStats = {};
	
	// Cargar datos iniciales
	async function loadData() {
		loading = true;
		try {
			// Construir URL con parámetros
			const params = new URLSearchParams();
			if (selectedCategory !== 'all') {
				params.set('category', selectedCategory);
			}
			if (searchTerm.length >= 2) {
				params.set('search', searchTerm);
			}
			if (lowStockLimit !== null && lowStockLimit >= 0) {
				params.set('lowStock', lowStockLimit.toString());
			}
			
			const response = await fetch(`/api/inventory/full?${params}`);
			if (response.ok) {
				const data = await response.json();
				products = data.products;
				categories = data.categories;
				categoryStats = data.categoryStats;
			}
		} catch (error) {
			console.error('Error cargando inventario:', error);
		} finally {
			loading = false;
		}
	}
	
	// Cargar datos cuando se abre el modal
	$: if (isOpen) {
		loadData();
	}
	
	function filterByCategory(categoryId) {
		selectedCategory = categoryId;
		loadData();
	}
	
	function handleSearch() {
		loadData();
	}
	
	function filterByLowStock() {
		loadData();
	}
	
	function clearLowStockFilter() {
		lowStockLimit = null;
		showLowStockFilter = false;
		loadData();
	}
	
	function handleSelect(product) {
		onSelectProduct(product);
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<!-- Overlay -->
		<div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={onClose}></div>
		
		<!-- Modal -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
				<!-- Header con gradiente -->
				<div class="relative overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
					<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
					
					<div class="relative z-10">
						<div class="px-6 py-4 flex items-center justify-between">
							<div>
								<h3 class="text-2xl font-light text-white">Inventario</h3>
								<p class="text-white/80 text-sm">Selecciona productos para facturar</p>
							</div>
							<button
								on:click={onClose}
								class="text-white/80 hover:text-white bg-white/20 rounded-lg p-2"
							>
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				</div>
				
				<!-- Contenido -->
				<div class="overflow-y-auto" style="max-height: calc(90vh - 100px);">
					<!-- Filtros por categoría -->
					<div class="p-6 border-b border-gray-200">
						<h4 class="text-sm font-medium text-gray-700 mb-3">Filtrar por Categoría</h4>
						<div class="flex flex-wrap gap-2">
							<!-- Filtro "Todos" -->
							<button
								on:click={() => filterByCategory('all')}
								class="px-4 py-2 rounded-lg border-2 transition-all text-sm {selectedCategory === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
							>
								Todos ({products.length})
							</button>

							<!-- Filtros por categoría -->
							{#each categories as category}
								<div class="relative group">
									<button
										on:click={() => filterByCategory(category.id)}
										class="px-4 py-2 rounded-lg border-2 transition-all text-sm flex items-center gap-2 
											{selectedCategory == category.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
									>
										<span>{category.name}</span>
										<span class="text-xs">({categoryStats[category.id] || 0})</span>
										{#if category.children && category.children.length > 0}
											<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
											</svg>
										{/if}
									</button>
									
									<!-- Submenú desplegable -->
									{#if category.children && category.children.length > 0}
										<div class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 
											opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
											<div class="py-1">
												{#each category.children as subcategory}
													<button
														on:click={() => filterByCategory(subcategory.id)}
														class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between
															{selectedCategory == subcategory.id ? 'bg-blue-50 text-blue-700' : ''}"
													>
														<span>{subcategory.name}</span>
														<span class="text-xs text-gray-500">({categoryStats[subcategory.id] || 0})</span>
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
									class="px-4 py-2 rounded-lg border-2 transition-all text-sm flex items-center gap-2 {lowStockLimit !== null ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									<span>Stock Bajo</span>
									{#if lowStockLimit !== null}
										<span>(≤ {lowStockLimit})</span>
									{/if}
								</button>
								
								{#if showLowStockFilter}
									<div class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-3">
										<label class="block text-xs font-medium text-gray-700 mb-2">
											Mostrar productos con stock ≤
										</label>
										<div class="flex gap-2">
											<input
												type="number"
												min="0"
												bind:value={lowStockLimit}
												placeholder="Cantidad"
												class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
											/>
											<button
												on:click={filterByLowStock}
												class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
											>
												Filtrar
											</button>
										</div>
										{#if lowStockLimit !== null}
											<button
												on:click={clearLowStockFilter}
												class="mt-2 text-xs text-red-600 hover:text-red-800"
											>
												Limpiar filtro
											</button>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Búsqueda -->
					<div class="px-6 py-4 border-b border-gray-200">
						<label class="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>
						<div class="relative">
							<input
								type="text"
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
					
					<!-- Lista de productos -->
					<div class="px-6 py-4">
						{#if loading}
							<div class="text-center py-8">
								<div class="inline-flex items-center">
									<svg class="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Cargando...
								</div>
							</div>
						{:else if products.length === 0}
							<div class="text-center py-8">
								<p class="text-gray-500">No se encontraron productos</p>
							</div>
						{:else}
							<div class="space-y-2">
								{#each products as product}
									<div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
										<div class="flex justify-between items-start">
											<div class="flex-1">
												<div class="flex items-center space-x-3">
													<p class="font-medium text-gray-900">{product.code}</p>
													<p class="text-gray-600">{product.name}</p>
													<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
														{product.category.name}
													</span>
												</div>
												<div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
													<span class="text-green-600 font-medium">Precio: ${product.price}</span>
													<span>Costo: ${product.cost}</span>
													<span class="{product.stock <= product.minStock ? 'text-red-600 font-semibold' : ''}">
														Stock: {product.stock}
														{#if product.stock <= product.minStock}
															⚠️
														{/if}
													</span>
												</div>
											</div>
											<button
												on:click={() => handleSelect(product)}
												class="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
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
		</div>
	</div>
{/if}