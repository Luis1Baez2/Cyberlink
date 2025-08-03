<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, scale } from 'svelte/transition';
	
	export let data;
	
	let showPurchaseModal = false;
	let showArrivalModal = false;
	let selectedRepair: any = null;
	let estimatedDays = '';
	
	// Formatear fecha
	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('es-AR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
	
	// Abrir modal para marcar como comprado
	function openPurchaseModal(repair: any) {
		selectedRepair = repair;
		estimatedDays = '';
		showPurchaseModal = true;
	}
	
	// Abrir modal para agregar tiempo de llegada
	function openArrivalModal(repair: any) {
		selectedRepair = repair;
		estimatedDays = '';
		showArrivalModal = true;
	}
	
	// Cerrar modales
	function closeModals() {
		showPurchaseModal = false;
		showArrivalModal = false;
		selectedRepair = null;
		estimatedDays = '';
	}
	
	// Obtener días restantes estimados
	function getDaysRemaining(estimatedArrival: string) {
		if (!estimatedArrival) return null;
		const today = new Date();
		const arrival = new Date(estimatedArrival);
		const diffTime = arrival.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
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
				<div in:fly={{ y: 20, duration: 600, delay: 100 }}>
					<h1 class="text-3xl sm:text-4xl font-light text-white mb-2">
						🛒 Gestión de Repuestos
					</h1>
					<p class="text-white/80 text-lg font-light">
						Equipos esperando repuestos - Solo se muestran reparaciones en espera
					</p>
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
		<!-- Estadísticas -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div in:scale={{ duration: 500, delay: 300 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-4">
					<div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
						⏳
					</div>
					<span class="text-3xl font-bold text-yellow-600">{data.stats.pending}</span>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-1">Esperando Compra</h3>
				<p class="text-sm text-gray-600">Equipos en espera de repuesto</p>
			</div>
			
			<div in:scale={{ duration: 500, delay: 400 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-4">
					<div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
						🛒
					</div>
					<span class="text-3xl font-bold text-blue-600">{data.stats.purchased}</span>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-1">Comprados</h3>
				<p class="text-sm text-gray-600">En camino</p>
			</div>
			
			<div in:scale={{ duration: 500, delay: 500 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-4">
					<div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
						✅
					</div>
					<span class="text-3xl font-bold text-green-600">{data.stats.received}</span>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-1">Recibidos</h3>
				<p class="text-sm text-gray-600">Listos para instalar</p>
			</div>
		</div>

		<!-- Lista de repuestos pendientes -->
		{#if data.pendingParts.length > 0}
		<div in:scale={{ duration: 500, delay: 600 }} class="bg-white rounded-3xl shadow-lg p-8 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-light text-gray-800">⏳ Esperando Compra</h2>
				<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
					{data.pendingParts.length} equipos
				</span>
			</div>
			
			<div class="space-y-4">
				{#each data.pendingParts as repair}
				<div class="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-4 mb-3">
								<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-mono">
									#{repair.repairNumber}
								</span>
								<h3 class="text-lg font-medium text-gray-900">
									{repair.deviceType} {repair.brand} {repair.model}
								</h3>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<p class="text-sm text-gray-600">Cliente:</p>
									<p class="font-medium text-gray-900">{repair.customer.name}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Técnico:</p>
									<p class="font-medium text-gray-900">{repair.technician?.name || 'Sin asignar'}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Problema:</p>
									<p class="font-medium text-gray-900">{repair.issue}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Fecha de recepción:</p>
									<p class="font-medium text-gray-900">{formatDate(repair.receivedDate)}</p>
								</div>
							</div>
							
							{#if repair.partsDescription}
							<div class="mb-4">
								<p class="text-sm text-gray-600">Descripción del repuesto:</p>
								<p class="font-medium text-gray-900">{repair.partsDescription}</p>
							</div>
							{/if}
							
							{#if repair.purchaseLink}
							<div class="mb-4">
								<p class="text-sm text-gray-600">Link de compra:</p>
								<a href={repair.purchaseLink} target="_blank" 
									class="text-blue-600 hover:text-blue-800 underline">
									Ver producto 🔗
								</a>
							</div>
							{/if}
						</div>
						
						<!-- Botones de acción -->
						<div class="flex flex-col gap-2 ml-6">
							{#if data.user?.username === 'dueño'}
							<button
								on:click={() => openPurchaseModal(repair)}
								class="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
							>
								✅ Marcar como Comprado
							</button>
							{/if}
						</div>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{:else}
		<div in:scale={{ duration: 500, delay: 600 }} class="bg-white rounded-3xl shadow-lg p-12 text-center">
			<div class="text-6xl mb-4">🎉</div>
			<h3 class="text-xl font-medium text-gray-900 mb-2">¡No hay repuestos pendientes!</h3>
			<p class="text-gray-600">Todos los equipos están en proceso o completados.</p>
		</div>
		{/if}

		<!-- Lista de repuestos comprados -->
		{#if data.purchasedParts.length > 0}
		<div in:scale={{ duration: 500, delay: 700 }} class="bg-white rounded-3xl shadow-lg p-8 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-light text-gray-800">🛒 Comprados - En Camino</h2>
				<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
					{data.purchasedParts.length} equipos
				</span>
			</div>
			
			<div class="space-y-4">
				{#each data.purchasedParts as repair}
				<div class="border border-blue-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-4 mb-3">
								<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-mono">
									#{repair.repairNumber}
								</span>
								<h3 class="text-lg font-medium text-gray-900">
									{repair.deviceType} {repair.brand} {repair.model}
								</h3>
								{#if repair.estimatedArrival && getDaysRemaining(repair.estimatedArrival) !== null}
								<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
									{getDaysRemaining(repair.estimatedArrival)} días restantes
								</span>
								{/if}
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<p class="text-sm text-gray-600">Cliente:</p>
									<p class="font-medium text-gray-900">{repair.customer.name}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Técnico:</p>
									<p class="font-medium text-gray-900">{repair.technician?.name || 'Sin asignar'}</p>
								</div>
								{#if repair.estimatedArrival}
								<div>
									<p class="text-sm text-gray-600">Llegada estimada:</p>
									<p class="font-medium text-gray-900">{formatDate(repair.estimatedArrival)}</p>
								</div>
								{/if}
								{#if repair.partsCost}
								<div>
									<p class="text-sm text-gray-600">Costo del repuesto:</p>
									<p class="font-medium text-gray-900">${repair.partsCost.toLocaleString('es-AR')}</p>
								</div>
								{/if}
							</div>
							
							{#if repair.partsDescription}
							<div class="mb-4">
								<p class="text-sm text-gray-600">Descripción del repuesto:</p>
								<p class="font-medium text-gray-900">{repair.partsDescription}</p>
							</div>
							{/if}
						</div>
						
						<!-- Botones de acción -->
						<div class="flex flex-col gap-2 ml-6">
							{#if data.user?.role === 'ADMIN' || data.user?.username === 'dueño'}
							<button
								on:click={() => openArrivalModal(repair)}
								class="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
							>
								📅 Actualizar Llegada
							</button>
							{/if}
						</div>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{/if}

		<!-- Lista de repuestos recibidos -->
		{#if data.receivedParts.length > 0}
		<div in:scale={{ duration: 500, delay: 800 }} class="bg-white rounded-3xl shadow-lg p-8 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-light text-gray-800">✅ Recibidos - Listos para Instalar</h2>
				<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
					{data.receivedParts.length} equipos
				</span>
			</div>
			
			<div class="space-y-4">
				{#each data.receivedParts as repair}
				<div class="border border-green-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
					<div class="flex items-start">
						<div class="flex-1">
							<div class="flex items-center gap-4 mb-3">
								<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-mono">
									#{repair.repairNumber}
								</span>
								<h3 class="text-lg font-medium text-gray-900">
									{repair.deviceType} {repair.brand} {repair.model}
								</h3>
								<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
									✅ Repuesto Disponible
								</span>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<p class="text-sm text-gray-600">Cliente:</p>
									<p class="font-medium text-gray-900">{repair.customer.name}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Técnico:</p>
									<p class="font-medium text-gray-900">{repair.technician?.name || 'Sin asignar'}</p>
								</div>
								{#if repair.partsCost}
								<div>
									<p class="text-sm text-gray-600">Costo del repuesto:</p>
									<p class="font-medium text-gray-900">${repair.partsCost.toLocaleString('es-AR')}</p>
								</div>
								{/if}
							</div>
							
							{#if repair.partsDescription}
							<div class="mb-4">
								<p class="text-sm text-gray-600">Descripción del repuesto:</p>
								<p class="font-medium text-gray-900">{repair.partsDescription}</p>
							</div>
							{/if}
						</div>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{/if}
	</div>
</div>

<!-- Modal: Marcar como Comprado -->
{#if showPurchaseModal && selectedRepair}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={closeModals}>
	<div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4" on:click|stopPropagation>
		<h3 class="text-xl font-bold text-gray-900 mb-4">✅ Marcar como Comprado</h3>
		
		<div class="mb-4">
			<p class="text-sm text-gray-600 mb-2">Equipo:</p>
			<p class="font-medium">{selectedRepair.deviceType} {selectedRepair.brand} {selectedRepair.model}</p>
		</div>
		
		<form method="POST" action="?/markAsPurchased" use:enhance>
			<input type="hidden" name="repairId" value={selectedRepair.id} />
			
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Días estimados de llegada (opcional):
				</label>
				<input
					type="number"
					name="estimatedDays"
					bind:value={estimatedDays}
					min="1"
					max="30"
					class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
					placeholder="Ej: 7"
				/>
				<p class="text-xs text-gray-500 mt-1">Se agregará automáticamente una nota de compra</p>
			</div>
			
			<div class="flex gap-3">
				<button
					type="button"
					on:click={closeModals}
					class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-medium shadow-lg"
				>
					✅ Confirmar Compra
				</button>
			</div>
		</form>
	</div>
</div>
{/if}

<!-- Modal: Actualizar Tiempo de Llegada -->
{#if showArrivalModal && selectedRepair}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={closeModals}>
	<div class="bg-white rounded-3xl p-8 max-w-md w-full mx-4" on:click|stopPropagation>
		<h3 class="text-xl font-bold text-gray-900 mb-4">📅 Actualizar Tiempo de Llegada</h3>
		
		<div class="mb-4">
			<p class="text-sm text-gray-600 mb-2">Equipo:</p>
			<p class="font-medium">{selectedRepair.deviceType} {selectedRepair.brand} {selectedRepair.model}</p>
		</div>
		
		<form method="POST" action="?/addArrivalTime" use:enhance>
			<input type="hidden" name="repairId" value={selectedRepair.id} />
			
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Días estimados de llegada:
				</label>
				<input
					type="number"
					name="estimatedDays"
					bind:value={estimatedDays}
					min="1"
					max="30"
					class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Ej: 7"
					required
				/>
				<p class="text-xs text-gray-500 mt-1">Se actualizará la fecha estimada de llegada</p>
			</div>
			
			<div class="flex gap-3">
				<button
					type="button"
					on:click={closeModals}
					class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-medium shadow-lg"
				>
					📅 Actualizar
				</button>
			</div>
		</form>
	</div>
</div>
{/if}