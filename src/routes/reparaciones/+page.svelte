<script lang="ts">
	import { theme } from '$lib/stores/theme';
	export let data;
	
	// Filtros
	let searchTerm = '';
	let selectedStatus = 'all';
	let selectedTechnician = 'all';
	let viewMode = 'grid'; // 'grid' o 'list'
	let sortBy = 'recent'; // 'recent', 'oldest', 'mostDays'
	
	// Selección múltiple
	let selectedOrders = new Set();
	let selectAll = false;
	
	// Estado para cambio rápido
	let changingStatusFor = null;
	
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
		RETIRADO: { label: 'Retirado', color: 'bg-purple-100 text-purple-800', icon: '🏠' }
	};
	
	// Estadísticas (excluyendo retiradas y canceladas para técnicos)
	$: stats = {
		unassigned: repairs.filter(r => r.status === 'UNASSIGNED').length,
		inRepair: repairs.filter(r => ['IN_REVIEW', 'IN_REPAIR'].includes(r.status)).length,
		waitingParts: repairs.filter(r => r.status === 'WAITING_PARTS').length,
		completed: repairs.filter(r => {
			// Para técnicos, mostrar completadas pero no retiradas
			if (data.user?.role === 'TECHNICIAN') {
				return r.status === 'COMPLETED';
			}
			// Para admin/manager, mostrar solo completadas (no retiradas)
			return r.status === 'COMPLETED';
		}).length
	};
	
	$: filteredRepairs = repairs.filter(repair => {
		const matchesSearch = !searchTerm || 
			repair.repairNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			repair.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			repair.customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(repair.purchaseLink && repair.purchaseLink.toLowerCase().includes(searchTerm.toLowerCase()));
			
		let matchesStatus = false;
		if (selectedStatus === 'all') {
			// Para técnicos: no mostrar retiradas ni canceladas
			// Para admin/manager: mostrar todo excepto retiradas y canceladas (a menos que se busque específicamente)
			if (data.user?.role === 'TECHNICIAN') {
				matchesStatus = repair.status !== 'RETIRADO' && repair.status !== 'CANCELLED';
			} else {
				matchesStatus = repair.status !== 'RETIRADO' && repair.status !== 'CANCELLED';
			}
		} else if (selectedStatus === 'unassigned') {
			matchesStatus = repair.status === 'UNASSIGNED';
		} else if (selectedStatus === 'inRepair') {
			matchesStatus = ['IN_REVIEW', 'IN_REPAIR'].includes(repair.status);
		} else if (selectedStatus === 'completed') {
			matchesStatus = repair.status === 'COMPLETED';
		} else {
			matchesStatus = repair.status === selectedStatus;
		}
		
		const matchesTechnician = selectedTechnician === 'all' || 
			(selectedTechnician === 'unassigned' && !repair.technicianId) ||
			(repair.technician?.id === selectedTechnician);
		
		return matchesSearch && matchesStatus && matchesTechnician;
	}).sort((a, b) => {
		if (sortBy === 'recent') {
			// Más reciente primero
			return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
		} else if (sortBy === 'oldest') {
			// Más antiguo primero
			return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
		} else if (sortBy === 'mostDays') {
			// Más días en taller primero
			return getDaysInWorkshop(b.receivedDate) - getDaysInWorkshop(a.receivedDate);
		}
		return 0;
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
	
	// Funciones de selección
	function toggleSelectAll() {
		if (selectAll) {
			selectedOrders.clear();
		} else {
			filteredRepairs.forEach(repair => {
				selectedOrders.add(repair.id);
			});
		}
		selectedOrders = selectedOrders; // Trigger reactivity
	}
	
	function toggleOrderSelection(orderId: string) {
		if (selectedOrders.has(orderId)) {
			selectedOrders.delete(orderId);
		} else {
			selectedOrders.add(orderId);
		}
		selectedOrders = selectedOrders; // Trigger reactivity
	}
	
	// Actualizar selectAll cuando cambian las selecciones
	$: selectAll = filteredRepairs.length > 0 && filteredRepairs.every(repair => selectedOrders.has(repair.id));
	
	// Función para imprimir órdenes seleccionadas
	function printSelectedOrders() {
		if (selectedOrders.size === 0) return;
		
		// Abrir cada orden en una nueva ventana para imprimir
		selectedOrders.forEach(orderId => {
			window.open(`/reparaciones/${orderId}/imprimir`, '_blank');
		});
		
		// Limpiar selección después de imprimir
		selectedOrders.clear();
		selectedOrders = selectedOrders;
	}
	
	// Función para cambiar estado rápidamente
	async function quickChangeStatus(repairId: string, newStatus: string) {
		try {
			const formData = new FormData();
			formData.append('id', repairId);
			formData.append('status', newStatus);
			
			const response = await fetch('/reparaciones/api/update-status', {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				// Actualizar el estado localmente
				repairs = repairs.map(r => 
					r.id === repairId ? { ...r, status: newStatus } : r
				);
				changingStatusFor = null;
			}
		} catch (error) {
			console.error('Error al cambiar estado:', error);
		}
	}
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
							Gestión de Reparaciones
						</h1>
						<p class="text-white/80 text-lg font-light">
							Bienvenido {data.user?.name} • 
							<span class="font-medium">{filteredRepairs.length}</span> órdenes activas
						</p>
					</div>
					
					<div class="mt-6 sm:mt-0 flex items-center space-x-3">
						{#if data.user?.role !== 'TECHNICIAN'}
						<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-1 flex space-x-2 relative z-20">
							<a
								href="/reparaciones/nueva"
								class="bg-transparent text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 flex items-center"
							>
								<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Nueva Reparación
							</a>
							{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER'}
							<a
								href="/reparaciones/configuracion"
								class="bg-transparent text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 flex items-center"
							>
								<svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Configurar impresión
							</a>
							{/if}
						</div>
						{/if}
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
		<!-- Tarjetas de estadísticas -->
		<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 mb-4 sm:mb-8">
			<button
				on:click={() => selectedStatus = selectedStatus === 'unassigned' ? 'all' : 'unassigned'}
				class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all cursor-pointer w-full text-left {selectedStatus === 'unassigned' ? 'ring-2 ring-gray-600 dark:ring-gray-400' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Sin asignar</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.unassigned}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'inRepair' ? 'all' : 'inRepair'}
				class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'inRepair' ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">En reparación</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.inRepair}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'WAITING_APPROVAL' ? 'all' : 'WAITING_APPROVAL'}
				class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'WAITING_APPROVAL' ? 'ring-2 ring-yellow-600 dark:ring-yellow-400' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/50 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Espera repuestos</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.waitingParts}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>

			<button
				on:click={() => selectedStatus = selectedStatus === 'completed' ? 'all' : 'completed'}
				class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow cursor-pointer w-full text-left {selectedStatus === 'completed' ? 'ring-2 ring-green-600 dark:ring-green-400' : ''}"
			>
				<div class="p-3 sm:p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-md p-2 sm:p-3">
							<svg class="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<div class="ml-3 sm:ml-5 w-0 flex-1">
							<dl>
								<dt class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Terminados</dt>
								<dd class="text-lg sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.completed}</dd>
							</dl>
						</div>
					</div>
				</div>
			</button>
		</div>

		<!-- Barra de selección múltiple -->
		{#if selectedOrders.size > 0}
		<div class="bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded-lg p-4 mb-4 flex items-center justify-between">
			<div class="flex items-center">
				<svg class="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span class="text-sm font-medium text-purple-800 dark:text-purple-200">
					{selectedOrders.size} {selectedOrders.size === 1 ? 'orden seleccionada' : 'órdenes seleccionadas'}
				</span>
			</div>
			<div class="flex items-center space-x-2">
				<button
					on:click={printSelectedOrders}
					class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
				>
					<svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					Imprimir seleccionadas
				</button>
				<button
					on:click={() => { selectedOrders.clear(); selectedOrders = selectedOrders; }}
					class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
				>
					Cancelar selección
				</button>
			</div>
		</div>
		{/if}

		<!-- Barra de filtros mejorada -->
		<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
			<!-- Título de la sección con selector de vista -->
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Filtros y búsqueda</h3>
				<div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
					<button
						on:click={() => viewMode = 'grid'}
						class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
						title="Vista de tarjetas"
					>
						<svg class="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
						<span class="ml-1.5 hidden sm:inline">Tarjetas</span>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
						title="Vista de lista"
					>
						<svg class="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<span class="ml-1.5 hidden sm:inline">Lista</span>
					</button>
				</div>
			</div>
			
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
				<div class="sm:col-span-2">
					<label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
					<div class="relative">
						<input
							type="text"
							id="search"
							bind:value={searchTerm}
							placeholder="Número, cliente, teléfono o link de compra..."
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md pl-10"
						/>
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					</div>
				</div>
				
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
					<select
						id="status"
						bind:value={selectedStatus}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md {selectedStatus !== 'all' ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/50 dark:border-purple-600' : ''}"
					>
						<option value="all">Todos los estados</option>
						{#each Object.entries(statusMap) as [value, { label, icon }]}
							<option value={value}>{icon} {label}</option>
						{/each}
					</select>
				</div>

				{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER'}
				<div>
					<label for="technician" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Técnico</label>
					<select
						id="technician"
						bind:value={selectedTechnician}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md {selectedTechnician !== 'all' ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/50 dark:border-purple-600' : ''}"
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

				<div>
					<label for="sortBy" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordenar por</label>
					<select
						id="sortBy"
						bind:value={sortBy}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
					>
						<option value="recent">Más reciente primero</option>
						<option value="oldest">Más antiguo primero</option>
						<option value="mostDays">Más días en taller</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Contador de resultados -->
		<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
			Mostrando <span class="font-medium text-gray-900 dark:text-gray-100">{filteredRepairs.length}</span> {filteredRepairs.length === 1 ? 'orden' : 'órdenes'}
		</div>

		<!-- Vista de tarjetas o lista -->
		{#if viewMode === 'grid'}
			<!-- Vista de tarjetas -->
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredRepairs as repair}
					<div class="relative group">
						<div class="absolute top-4 left-4 z-10">
							<input
								type="checkbox"
								checked={selectedOrders.has(repair.id)}
								on:change={() => toggleOrderSelection(repair.id)}
								on:click|stopPropagation
								class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
							/>
						</div>
						<a href="/reparaciones/{repair.id}" class="block">
							<div class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow border-l-4 {getBorderColorByDays(repair.receivedDate)}">
								<div class="p-6 pl-12">
								<div class="flex items-center justify-between mb-4">
									<span class="text-2xl">{getDeviceIcon(repair.deviceType)}</span>
									{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER' || (data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user?.id)}
										{#if changingStatusFor === repair.id}
											<select
												value={repair.status}
												on:change={(e) => quickChangeStatus(repair.id, e.target.value)}
												on:blur={() => changingStatusFor = null}
												on:click|stopPropagation
												class="text-xs font-semibold rounded-full px-3 py-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-purple-500 focus:border-purple-500"
												autofocus
											>
												{#each Object.entries(statusMap) as [value, { label, icon }]}
													<option value={value}>{icon} {label}</option>
												{/each}
											</select>
										{:else}
											<button
												on:click|stopPropagation={() => changingStatusFor = repair.id}
												class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color} hover:opacity-80 cursor-pointer transition-opacity"
												title="Click para cambiar estado"
											>
												{statusMap[repair.status].icon} {statusMap[repair.status].label}
											</button>
										{/if}
									{:else}
										<span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color}">
											{statusMap[repair.status].icon} {statusMap[repair.status].label}
										</span>
									{/if}
								</div>
								
								<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
									Orden #{repair.repairNumber}
								</h3>
								
								<div class="mt-3 space-y-2">
									<p class="text-sm text-gray-600 dark:text-gray-300">
										<span class="font-medium">Cliente:</span> {repair.customer.name}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-300">
										<span class="font-medium">Equipo:</span> {repair.brand} {repair.model}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-300">
										<span class="font-medium">Técnico:</span> {repair.technician?.name || 'Sin asignar'}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-300">
										<span class="font-medium">Días en taller:</span> {getDaysInWorkshop(repair.receivedDate)}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-300 truncate">
										<span class="font-medium">Problema:</span> {repair.issue}
									</p>
								</div>

								<div class="mt-4 flex items-center justify-between">
									<p class="text-xs text-gray-500 dark:text-gray-400">
										{formatDate(repair.receivedDate)}
									</p>
									{#if repair.estimatedCost > 0}
									<p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
										${repair.estimatedCost}
									</p>
									{/if}
								</div>
							</div>
						</div>
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Vista de lista -->
			<div class="bg-white dark:bg-gray-800 shadow-lg overflow-hidden rounded-lg">
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead class="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								<input
									type="checkbox"
									checked={selectAll}
									on:change={toggleSelectAll}
									class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
								/>
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orden</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equipo</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Técnico</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Días</th>
							<th class="relative px-6 py-3"><span class="sr-only">Ver</span></th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredRepairs as repair}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<input
										type="checkbox"
										checked={selectedOrders.has(repair.id)}
										on:change={() => toggleOrderSelection(repair.id)}
										on:click|stopPropagation
										class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
									/>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<span class="text-lg mr-3">{getDeviceIcon(repair.deviceType)}</span>
										<div>
											<div class="text-sm font-medium text-gray-900 dark:text-gray-100">Orden #{repair.repairNumber}</div>
											<div class="text-sm text-gray-500 dark:text-gray-400">{formatDate(repair.receivedDate)}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900 dark:text-gray-100">{repair.customer.name}</div>
									<div class="text-sm text-gray-500 dark:text-gray-400">{repair.customer.phone}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900 dark:text-gray-100">{repair.brand} {repair.model}</div>
									<div class="text-sm text-gray-500 dark:text-gray-400">{repair.issue}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER' || (data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user?.id)}
										{#if changingStatusFor === repair.id}
											<select
												value={repair.status}
												on:change={(e) => quickChangeStatus(repair.id, e.target.value)}
												on:blur={() => changingStatusFor = null}
												on:click|stopPropagation
												class="text-xs font-semibold rounded-full px-2 py-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-purple-500 focus:border-purple-500"
												autofocus
											>
												{#each Object.entries(statusMap) as [value, { label }]}
													<option value={value}>{label}</option>
												{/each}
											</select>
										{:else}
											<button
												on:click|stopPropagation={() => changingStatusFor = repair.id}
												class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color} hover:opacity-80 cursor-pointer transition-opacity"
												title="Click para cambiar estado"
											>
												{statusMap[repair.status].label}
											</button>
										{/if}
									{:else}
										<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {statusMap[repair.status].color}">
											{statusMap[repair.status].label}
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{repair.technician?.name || 'Sin asignar'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<span class="px-2 py-1 rounded-full text-xs font-semibold {getDaysInWorkshop(repair.receivedDate) <= 1 ? 'bg-green-100 text-green-800' : getDaysInWorkshop(repair.receivedDate) <= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
										{getDaysInWorkshop(repair.receivedDate)} días
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<a href="/reparaciones/{repair.id}" class="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300">Ver detalles</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if filteredRepairs.length === 0}
			<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
				<svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No se encontraron reparaciones</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Intenta cambiar los filtros o crea una nueva reparación.</p>
			</div>
		{/if}
	</div>
</div>