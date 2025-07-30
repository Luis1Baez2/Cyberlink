<script lang="ts">
	export let data;
	
	// Filtros
	let searchTerm = '';
	let selectedStatus = 'all';
	let selectedTechnician = 'all';
	let viewMode = 'grid'; // 'grid' o 'list'
	
	// Usar datos reales del servidor
	$: repairs = data.repairs || [];
	
	// Mapeo de estados mejorado
	const statusMap = {
		UNASSIGNED: { label: 'Sin asignar', color: 'bg-gray-100 text-gray-800', icon: '📋' },
		IN_REVIEW: { label: 'En revisión', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
		IN_REPAIR: { label: 'En reparación', color: 'bg-indigo-100 text-indigo-800', icon: '🔧' },
		WAITING_PARTS: { label: 'Espera de repuesto', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
		COMPLETED: { label: 'Terminado', color: 'bg-green-100 text-green-800', icon: '✅' },
		CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
		DELIVERED: { label: 'Entregado', color: 'bg-teal-100 text-teal-800', icon: '📤' }
	};
	
	// Estadísticas
	$: stats = {
		unassigned: repairs.filter(r => r.status === 'UNASSIGNED').length,
		inRepair: repairs.filter(r => ['IN_REVIEW', 'IN_REPAIR'].includes(r.status)).length,
		waitingParts: repairs.filter(r => r.status === 'WAITING_PARTS').length,
		completed: repairs.filter(r => ['COMPLETED', 'DELIVERED'].includes(r.status)).length
	};
	
	$: filteredRepairs = repairs.filter(repair => {
		const matchesSearch = !searchTerm || 
			repair.repairNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			repair.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			repair.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
			repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(repair.purchaseLink && repair.purchaseLink.toLowerCase().includes(searchTerm.toLowerCase()));
			
		let matchesStatus = false;
		if (selectedStatus === 'all') {
			matchesStatus = true;
		} else if (selectedStatus === 'unassigned') {
			matchesStatus = repair.status === 'UNASSIGNED';
		} else if (selectedStatus === 'inRepair') {
			matchesStatus = ['IN_REVIEW', 'IN_REPAIR'].includes(repair.status);
		} else if (selectedStatus === 'completed') {
			matchesStatus = ['COMPLETED', 'DELIVERED'].includes(repair.status);
		} else {
			matchesStatus = repair.status === selectedStatus;
		}
		
		const matchesTechnician = selectedTechnician === 'all' || 
			(selectedTechnician === 'unassigned' && !repair.technicianId) ||
			(repair.technician?.id === selectedTechnician);
		
		return matchesSearch && matchesStatus && matchesTechnician;
	});
	
	// Iconos para dispositivos
	const deviceIcons = {
		'Laptop': '💻',
		'Celular': '📱',
		'Impresora': '🖨️',
		'Tablet': '📱',
		'PC': '🖥️',
		'Monitor': '🖥️'
	};
	
	function getDeviceIcon(type: string) {
		return deviceIcons[type] || '📦';
	}
	
	// Colores de prioridad
	const priorityColors = {
		HIGH: 'border-red-500',
		MEDIUM: 'border-yellow-500',
		LOW: 'border-green-500'
	};
	
	// Función para formatear fecha
	function formatDate(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('es-ES');
	}
	
	// Función para calcular días en taller
	function getDaysInWorkshop(receivedDate: Date | string): number {
		const received = typeof receivedDate === 'string' ? new Date(receivedDate) : receivedDate;
		const today = new Date();
		const diffTime = Math.abs(today.getTime() - received.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
	
	// Función para obtener el color del borde según los días en taller
	function getBorderColorByDays(receivedDate: Date | string): string {
		const days = getDaysInWorkshop(receivedDate);
		if (days >= 0 && days <= 1) {
			return 'border-green-500';
		} else if (days >= 2 && days <= 4) {
			return 'border-yellow-500';
		} else {
			return 'border-red-500';
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header con gradiente -->
	<div class="bg-gradient-to-r from-purple-600 to-green-600 pb-20 sm:pb-32">
		<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
			<div class="sm:flex sm:items-center sm:justify-between">
				<div>
					<h1 class="text-xl sm:text-3xl font-bold text-white">Gestión de Reparaciones</h1>
					<p class="mt-1 text-xs sm:text-base text-purple-100">
						<span class="hidden sm:inline">Bienvenido</span> {data.user?.name} • {filteredRepairs.length} activas
					</p>
				</div>
				{#if data.user?.role !== 'TECHNICIAN'}
				<div class="mt-3 sm:mt-0">
					<a
						href="/reparaciones/nueva"
						class="flex sm:inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all w-full sm:w-auto"
					>
						<svg class="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Nueva Reparación
					</a>
				</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Contenido principal con margen negativo para superponer -->
	<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-14 sm:-mt-24">
		<!-- Tarjetas de estadísticas -->
		<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 mb-4 sm:mb-8">
			<button
				on:click={() => selectedStatus = selectedStatus === 'unassigned' ? 'all' : 'unassigned'}
				class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'unassigned' ? 'ring-2 ring-gray-600' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-gray-100 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Sin asignar</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900">{stats.unassigned}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'inRepair' ? 'all' : 'inRepair'}
				class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'inRepair' ? 'ring-2 ring-blue-600' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-blue-100 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">En reparación</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900">{stats.inRepair}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'WAITING_APPROVAL' ? 'all' : 'WAITING_APPROVAL'}
				class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'WAITING_APPROVAL' ? 'ring-2 ring-yellow-600' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-yellow-100 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Espera repuestos</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900">{stats.waitingParts}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'completed' ? 'all' : 'completed'}
				class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'completed' ? 'ring-2 ring-green-600' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-green-100 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Terminados</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900">{stats.completed}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>
		</div>

		<!-- Barra de filtros mejorada -->
		<div class="bg-white shadow-lg rounded-lg p-6 mb-6">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
				<div class="sm:col-span-2">
					<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
					<div class="relative">
						<input
							type="text"
							id="search"
							bind:value={searchTerm}
							placeholder="Número, cliente, equipo, marca o link de compra..."
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md pl-10"
						/>
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					</div>
				</div>
				
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
					<select
						id="status"
						bind:value={selectedStatus}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md {selectedStatus !== 'all' ? 'bg-purple-50 border-purple-300' : ''}"
					>
						<option value="all">Todos los estados</option>
						{#each Object.entries(statusMap) as [value, { label, icon }]}
							<option value={value}>{icon} {label}</option>
						{/each}
					</select>
				</div>

				{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER'}
				<div>
					<label for="technician" class="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
					<select
						id="technician"
						bind:value={selectedTechnician}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md {selectedTechnician !== 'all' ? 'bg-purple-50 border-purple-300' : ''}"
					>
						<option value="all">Todos los técnicos</option>
						<option value="unassigned">Sin asignar</option>
						{#if data.technicians}
							{#each data.technicians as technician}
								<option value={technician.id}>{technician.name}</option>
							{/each}
						{/if}
					</select>
				</div>
				{/if}

				<div class="flex items-end justify-end space-x-2">
					<button
						on:click={() => viewMode = 'grid'}
						class="p-2 rounded-md {viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-500'}"
						title="Vista de tarjetas"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="p-2 rounded-md {viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-500'}"
						title="Vista de lista"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Vista de tarjetas o lista -->
		{#if viewMode === 'grid'}
			<!-- Vista de tarjetas -->
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredRepairs as repair}
					<a href="/reparaciones/{repair.id}" class="group">
						<div class="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow border-l-4 {getBorderColorByDays(repair.receivedDate)}">
							<div class="p-6">
								<div class="flex items-center justify-between mb-4">
									<span class="text-2xl">{getDeviceIcon(repair.deviceType)}</span>
									<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color}">
										{statusMap[repair.status].icon} {statusMap[repair.status].label}
									</span>
								</div>
								
								<h3 class="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
									Orden #{repair.repairNumber}
								</h3>
								
								<div class="mt-3 space-y-2">
									<p class="text-sm text-gray-600">
										<span class="font-medium">Cliente:</span> {repair.customer.name}
									</p>
									<p class="text-sm text-gray-600">
										<span class="font-medium">Equipo:</span> {repair.brand} {repair.model}
									</p>
									<p class="text-sm text-gray-600">
										<span class="font-medium">Técnico:</span> {repair.technician?.name || 'Sin asignar'}
									</p>
									<p class="text-sm text-gray-600">
										<span class="font-medium">Días en taller:</span> {getDaysInWorkshop(repair.receivedDate)}
									</p>
									<p class="text-sm text-gray-600 truncate">
										<span class="font-medium">Problema:</span> {repair.issue}
									</p>
								</div>

								<div class="mt-4 flex items-center justify-between">
									<p class="text-xs text-gray-500">
										{formatDate(repair.receivedDate)}
									</p>
									{#if repair.estimatedCost > 0}
									<p class="text-sm font-semibold text-gray-900">
										${repair.estimatedCost}
									</p>
									{/if}
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<!-- Vista de lista -->
			<div class="bg-white shadow-lg overflow-hidden rounded-lg">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
							<th class="relative px-6 py-3"><span class="sr-only">Ver</span></th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredRepairs as repair}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<span class="text-lg mr-3">{getDeviceIcon(repair.deviceType)}</span>
										<div>
											<div class="text-sm font-medium text-gray-900">Orden #{repair.repairNumber}</div>
											<div class="text-sm text-gray-500">{formatDate(repair.receivedDate)}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{repair.customer.name}</div>
									<div class="text-sm text-gray-500">{repair.customer.phone}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{repair.brand} {repair.model}</div>
									<div class="text-sm text-gray-500">{repair.issue}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color}">
										{statusMap[repair.status].label}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{repair.technician?.name || 'Sin asignar'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<span class="px-2 py-1 rounded-full text-xs font-semibold {getDaysInWorkshop(repair.receivedDate) <= 1 ? 'bg-green-100 text-green-800' : getDaysInWorkshop(repair.receivedDate) <= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
										{getDaysInWorkshop(repair.receivedDate)} días
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<a href="/reparaciones/{repair.id}" class="text-purple-600 hover:text-purple-900">Ver detalles</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if filteredRepairs.length === 0}
			<div class="text-center py-12 bg-white rounded-lg shadow">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron reparaciones</h3>
				<p class="mt-1 text-sm text-gray-500">Intenta cambiar los filtros o crea una nueva reparación.</p>
			</div>
		{/if}
	</div>
</div>