<script lang="ts">
	export let isOpen = false;
	export let onClose = () => {};
	export let onSelectRepair = (repair: any) => {};
	
	let searchTerm = '';
	let repairs = [];
	let loading = false;
	let selectedStatus = 'all';
	let stats = {
		unassigned: 0,
		inRepair: 0,
		waitingParts: 0,
		completed: 0
	};
	
	// Mapeo de estados mejorado
	const statusMap = {
		UNASSIGNED: { label: 'Sin asignar', color: 'bg-gray-100 text-gray-800', icon: '📋' },
		IN_REVIEW: { label: 'En revisión', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
		IN_REPAIR: { label: 'En reparación', color: 'bg-indigo-100 text-indigo-800', icon: '🔧' },
		WAITING_PARTS: { label: 'Espera de repuesto', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
		COMPLETED: { label: 'Terminado', color: 'bg-green-100 text-green-800', icon: '✅' },
		DELIVERED: { label: 'Entregado', color: 'bg-purple-100 text-purple-800', icon: '🏠' },
		CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
		RETIRADO: { label: 'Retirado', color: 'bg-purple-100 text-purple-800', icon: '🏠' }
	};

	// Función helper para obtener estado seguro
	function getStatusInfo(status) {
		return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
	}
	
	// Cargar datos
	async function loadData() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (selectedStatus !== 'all') {
				params.set('status', selectedStatus);
			}
			if (searchTerm.length >= 2) {
				params.set('search', searchTerm);
			}
			
			const response = await fetch(`/api/repairs/full?${params}`);
			if (response.ok) {
				const data = await response.json();
				repairs = data.repairs || [];
				stats = data.stats || {
					unassigned: 0,
					inRepair: 0,
					waitingParts: 0,
					completed: 0
				};
			}
		} catch (error) {
			console.error('Error cargando reparaciones:', error);
		} finally {
			loading = false;
		}
	}
	
	// Cargar datos cuando se abre el modal
	$: if (isOpen) {
		loadData();
	}
	
	function filterByStatus(status) {
		selectedStatus = status;
		loadData();
	}
	
	function handleSearch() {
		loadData();
	}
	
	function handleSelect(repair) {
		// Solo permitir seleccionar reparaciones completadas o entregadas
		if (repair.status === 'COMPLETED' || repair.status === 'DELIVERED') {
			onSelectRepair(repair);
			onClose();
		}
	}
	
	// Función para calcular días en taller
	function getDaysInWorkshop(receivedDate) {
		const received = new Date(receivedDate);
		const today = new Date();
		const diffTime = Math.abs(today - received);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<!-- Overlay -->
		<div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={onClose}></div>
		
		<!-- Modal -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
				<!-- Header con gradiente -->
				<div class="relative overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
					<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
					
					<div class="relative z-10">
						<div class="px-6 py-4 flex items-center justify-between">
							<div>
								<h3 class="text-2xl font-light text-white">Gestión de Reparaciones</h3>
								<p class="text-white/80 text-sm">Selecciona reparaciones completadas para facturar</p>
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
				<div class="overflow-y-auto" style="max-height: calc(95vh - 100px);">
					<!-- Tarjetas de estadísticas -->
					<div class="p-6 pb-4">
						<div class="grid grid-cols-4 gap-3">
							<button
								on:click={() => filterByStatus(selectedStatus === 'unassigned' ? 'all' : 'unassigned')}
								class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all cursor-pointer text-left {selectedStatus === 'unassigned' ? 'ring-2 ring-gray-600' : ''}"
							>
								<div class="p-4">
									<div class="flex items-center">
										<div class="flex-shrink-0 bg-gray-100 rounded-md p-2">
											<svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div class="ml-4 flex-1">
											<p class="text-sm font-medium text-gray-500">Sin asignar</p>
											<p class="text-2xl font-semibold text-gray-900">{stats.unassigned}</p>
										</div>
									</div>
								</div>
							</button>

							<button
								on:click={() => filterByStatus(selectedStatus === 'inRepair' ? 'all' : 'inRepair')}
								class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer text-left {selectedStatus === 'inRepair' ? 'ring-2 ring-blue-600' : ''}"
							>
								<div class="p-4">
									<div class="flex items-center">
										<div class="flex-shrink-0 bg-blue-100 rounded-md p-2">
											<svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</div>
										<div class="ml-4 flex-1">
											<p class="text-sm font-medium text-gray-500">En reparación</p>
											<p class="text-2xl font-semibold text-gray-900">{stats.inRepair}</p>
										</div>
									</div>
								</div>
							</button>

							<button
								on:click={() => filterByStatus(selectedStatus === 'WAITING_PARTS' ? 'all' : 'WAITING_PARTS')}
								class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer text-left {selectedStatus === 'WAITING_PARTS' ? 'ring-2 ring-yellow-600' : ''}"
							>
								<div class="p-4">
									<div class="flex items-center">
										<div class="flex-shrink-0 bg-yellow-100 rounded-md p-2">
											<svg class="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
											</svg>
										</div>
										<div class="ml-4 flex-1">
											<p class="text-sm font-medium text-gray-500">Espera repuestos</p>
											<p class="text-2xl font-semibold text-gray-900">{stats.waitingParts}</p>
										</div>
									</div>
								</div>
							</button>

							<button
								on:click={() => filterByStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
								class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer text-left {selectedStatus === 'completed' ? 'ring-2 ring-green-600' : ''}"
							>
								<div class="p-4">
									<div class="flex items-center">
										<div class="flex-shrink-0 bg-green-100 rounded-md p-2">
											<svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div class="ml-4 flex-1">
											<p class="text-sm font-medium text-gray-500">Terminados</p>
											<p class="text-2xl font-semibold text-gray-900">{stats.completed}</p>
										</div>
									</div>
								</div>
							</button>
						</div>
					</div>
					
					<!-- Barra de filtros -->
					<div class="px-6 pb-4">
						<div class="bg-white shadow-lg rounded-lg p-4">
							<h3 class="text-sm font-medium text-gray-900 mb-3">Filtros y búsqueda</h3>
							<div class="relative">
								<input
									type="text"
									bind:value={searchTerm}
									on:input={handleSearch}
									placeholder="Buscar por número, cliente o equipo..."
									class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
								/>
								<svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>
					</div>
					
					<!-- Lista de reparaciones -->
					<div class="px-6 pb-6">
						{#if loading}
							<div class="text-center py-8">
								<div class="inline-flex items-center">
									<svg class="animate-spin h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Cargando...
								</div>
							</div>
						{:else if repairs.length === 0}
							<div class="text-center py-8">
								<p class="text-gray-500">No se encontraron reparaciones</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								{#each repairs as repair}
									<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
										<!-- Header de la tarjeta -->
										<div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
											<div class="flex items-center justify-between">
												<div class="flex items-center space-x-3">
													<h3 class="text-lg font-semibold text-gray-900">#{repair.repairNumber}</h3>
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusInfo(repair.status).color}">
														{getStatusInfo(repair.status).icon} {getStatusInfo(repair.status).label}
													</span>
												</div>
												<div class="text-sm text-gray-500">
													{getDaysInWorkshop(repair.receivedDate)} días
												</div>
											</div>
										</div>
										
										<!-- Contenido de la tarjeta -->
										<div class="px-5 py-4">
											<div class="grid grid-cols-2 gap-4 text-sm">
												<div>
													<p class="text-gray-600">Cliente</p>
													<p class="font-medium text-gray-900">{repair.customer.name}</p>
													<p class="text-gray-500">{repair.customer.phone}</p>
												</div>
												<div>
													<p class="text-gray-600">Equipo</p>
													<p class="font-medium text-gray-900">{repair.brand} {repair.model}</p>
													<p class="text-gray-500">{repair.deviceType}</p>
												</div>
											</div>
											
											{#if repair.technician}
												<div class="mt-3 pt-3 border-t border-gray-100">
													<p class="text-sm text-gray-600">Técnico: <span class="font-medium text-gray-900">{repair.technician.name}</span></p>
												</div>
											{/if}
											
											<div class="mt-4 flex items-center justify-between">
												<div class="text-lg font-semibold text-purple-600">
													${repair.finalCost || repair.estimatedCost || 0}
												</div>
												{#if repair.status === 'COMPLETED' || repair.status === 'DELIVERED'}
													<button
														on:click={() => handleSelect(repair)}
														class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
													>
														Facturar
													</button>
												{:else}
													<span class="text-sm text-gray-500">No facturable</span>
												{/if}
											</div>
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