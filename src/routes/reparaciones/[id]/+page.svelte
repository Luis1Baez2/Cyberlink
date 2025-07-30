<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	
	export let data;
	export let form;
	
	// Estados de reparación
	const statusMap = {
		UNASSIGNED: { label: 'Sin asignar', color: 'bg-gray-100 text-gray-800', icon: '📋' },
		IN_REVIEW: { label: 'En revisión', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
		IN_REPAIR: { label: 'En reparación', color: 'bg-indigo-100 text-indigo-800', icon: '🔧' },
		WAITING_PARTS: { label: 'Espera de repuesto', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
		COMPLETED: { label: 'Terminado', color: 'bg-green-100 text-green-800', icon: '✅' },
		CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
		DELIVERED: { label: 'Entregado', color: 'bg-teal-100 text-teal-800', icon: '📤' }
	};
	
	// Usar datos reales o datos de ejemplo si no hay reparación
	$: repair = data.repair || {
		id: $page.params.id,
		repairNumber: 'REP-2024-001',
		customer: { 
			name: 'Cliente de ejemplo', 
			phone: '555-0123',
			email: 'cliente@email.com',
			address: 'Dirección de ejemplo'
		},
		deviceType: 'Laptop',
		brand: 'Dell',
		model: 'Inspiron 15',
		serialNumber: 'DL123456789',
		issue: 'Problema de ejemplo',
		diagnosis: 'Diagnóstico de ejemplo',
		status: 'UNASSIGNED',
		priority: 'MEDIUM',
		receivedDate: new Date(),
		estimatedDate: null,
		technician: null,
		estimatedCost: 0,
		progress: 0,
		notes: [],
		parts: []
	};
	
	let showStatusModal = false;
	let selectedStatus = '';
	let statusNote = '';
	let newNoteText = '';
	let showChangeStatusModal = false;
	let newStatus = '';
	let loading = false;
	let copySuccess = false;
	let showAssignModal = false;
	let selectedTechnicianId = '';
	let showCostModal = false;
	let showLinkModal = false;
	let laborCostInput = '';
	let partsCostInput = '';
	let purchaseLinkInput = '';
	let partsDescriptionInput = '';
	
	$: selectedStatus = repair.status;
	$: selectedTechnicianId = repair.technician?.id || '';
	$: purchaseLinkInput = repair.purchaseLink || '';
	$: laborCostInput = repair.laborCost || '';
	$: partsCostInput = repair.partsCost || '';
	$: partsDescriptionInput = repair.partsDescription || '';
	

	
	// Función para copiar teléfono
	function copyPhone() {
		navigator.clipboard.writeText(repair.customer.phone).then(() => {
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		});
	}
	
	// Función para formatear fecha
	function formatDate(date: Date | string | null): string {
		if (!date) return 'No especificada';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Función para calcular días en el taller
	function calculateDaysInShop(receivedDate: Date | string): number {
		const received = typeof receivedDate === 'string' ? new Date(receivedDate) : receivedDate;
		const today = new Date();
		const timeDiff = today.getTime() - received.getTime();
		return Math.floor(timeDiff / (1000 * 3600 * 24));
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
			<div class="py-4 sm:py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<button
							on:click={() => goto('/reparaciones')}
							class="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
						</button>
						<div>
							<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Orden de Servicio #{repair.repairNumber}</h1>
							<p class="text-sm text-gray-500 mt-1">Creado el {formatDate(repair.receivedDate)}</p>
						</div>
					</div>
					
					<div class="flex items-center space-x-2">
						<button
							on:click={() => window.open(`/reparaciones/${repair.id}/imprimir`, '_blank')}
							class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
						>
							<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
							</svg>
							<span class="hidden sm:inline">Imprimir orden</span>
							<span class="sm:hidden">Imprimir</span>
						</button>
						
						{#if data.user?.role !== 'TECHNICIAN' || (data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user.id)}
						<button
							on:click={() => showStatusModal = true}
							class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
						>
							<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span class="hidden sm:inline">Actualizar estado</span>
							<span class="sm:hidden">Estado</span>
						</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
		<!-- Grid de dos columnas para información -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
			<!-- Información del dispositivo -->
			<div class="bg-white shadow-sm rounded-lg p-4 sm:p-6">
				<h2 class="text-lg font-medium text-gray-900 mb-4">Información del dispositivo</h2>
				<div class="space-y-4">
					<!-- Información básica del dispositivo -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-500">Tipo</p>
							<p class="text-sm font-medium text-gray-900">{repair.deviceType}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Marca</p>
							<p class="text-sm font-medium text-gray-900">{repair.brand}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Modelo</p>
							<p class="text-sm font-medium text-gray-900">{repair.model}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">N° Serie</p>
							<p class="text-sm font-medium text-gray-900">{repair.serialNumber || 'N/A'}</p>
						</div>
					</div>
					
					<!-- Problema reportado primero -->
					<div class="pt-4 border-t">
						<p class="text-sm text-gray-500">Problema reportado</p>
						<p class="text-sm text-gray-900">{repair.issue}</p>
					</div>
					
					{#if repair.diagnosis}
					<div>
						<p class="text-sm text-gray-500">Diagnóstico</p>
						<p class="text-sm text-gray-900">{repair.diagnosis}</p>
					</div>
					{/if}
					
					<!-- Estado y técnico lado a lado -->
					<div class="pt-4 border-t">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-gray-500">Estado actual</p>
								<div class="flex items-center justify-between">
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {statusMap[repair.status].color}">
										{statusMap[repair.status].icon} {statusMap[repair.status].label}
									</span>
									{#if (data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user?.id && repair.status !== 'DELIVERED') || (data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER')}
									<button
										on:click={() => showChangeStatusModal = true}
										class="text-xs text-purple-600 hover:text-purple-700 font-medium"
									>
										Cambiar
									</button>
									{/if}
								</div>
							</div>
							<div>
								<p class="text-sm text-gray-500">Técnico asignado</p>
								<div class="flex items-center justify-between">
									<p class="text-sm font-medium text-gray-900">{repair.technician?.name || 'Sin asignar'}</p>
									{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER'}
									<button
										on:click={() => showAssignModal = true}
										class="text-xs text-purple-600 hover:text-purple-700 font-medium"
									>
										Cambiar
									</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
					
					<!-- Fecha de ingreso y días en taller -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-500">Fecha de ingreso</p>
							<p class="text-sm font-medium text-gray-900">{formatDate(repair.receivedDate)}</p>
						</div>
						<div>
							<p class="text-sm text-gray-500">Días en el taller</p>
							<p class="text-sm font-medium text-gray-900">{calculateDaysInShop(repair.receivedDate)} días</p>
						</div>
					</div>
					
					{#if repair.estimatedDate}
					<div>
						<p class="text-sm text-gray-500">Fecha estimada de entrega</p>
						<p class="text-sm font-medium text-gray-900">{formatDate(repair.estimatedDate)}</p>
					</div>
					{/if}
					
					<!-- Sección de costos -->
					<div class="pt-4 border-t space-y-3">
						<h3 class="text-sm font-medium text-gray-900">Información de costos</h3>
						
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-gray-500">Mano de obra</p>
								<p class="text-sm font-medium text-gray-900">${repair.laborCost || 0}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">Repuestos</p>
								<p class="text-sm font-medium text-gray-900">${repair.partsCost || 0}</p>
							</div>
						</div>
						<div>
							<p class="text-sm text-gray-500">Costo total</p>
							<p class="text-lg font-bold text-gray-900">${(repair.laborCost || 0) + (repair.partsCost || 0)}</p>
						</div>
						{#if repair.estimatedCost}
						<div>
							<p class="text-sm text-gray-500">Costo estimado</p>
							<p class="text-sm text-gray-500">${repair.estimatedCost}</p>
						</div>
						{/if}
						
						{#if data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER' || (data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user?.id)}
						<button
							on:click={() => showCostModal = true}
							class="text-xs text-purple-600 hover:text-purple-700 font-medium"
						>
							Actualizar costos
						</button>
						{/if}
					</div>
					
					<div class="pt-4 border-t space-y-3">
						<div>
							<div class="flex items-center justify-between">
								<p class="text-sm text-gray-500">Link de compra</p>
								{#if data.user?.role === 'TECHNICIAN' && repair.technician?.id === data.user?.id}
								<button
									on:click={() => showLinkModal = true}
									class="text-xs text-purple-600 hover:text-purple-700 font-medium"
								>
									{repair.purchaseLink ? 'Actualizar' : 'Agregar'}
								</button>
								{/if}
							</div>
							{#if repair.purchaseLink}
							<a href={repair.purchaseLink} target="_blank" class="text-sm text-purple-600 hover:text-purple-700 break-all">
								{repair.purchaseLink}
							</a>
							{:else}
							<p class="text-sm text-gray-500">No agregado</p>
							{/if}
						</div>
						
						{#if repair.partsDescription}
						<div>
							<p class="text-sm text-gray-500">Descripción del repuesto</p>
							<p class="text-sm text-gray-900">{repair.partsDescription}</p>
						</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Información del cliente -->
			<div class="bg-white shadow-sm rounded-lg p-4 sm:p-6">
				<h2 class="text-lg font-medium text-gray-900 mb-4">Información del cliente</h2>
				<div class="space-y-4">
					<div>
						<p class="text-sm text-gray-500">Nombre</p>
						<p class="text-sm font-medium text-gray-900">{repair.customer.name}</p>
					</div>
					<div>
						<p class="text-sm text-gray-500">Teléfono</p>
						<div class="flex items-center gap-2">
							<a href="tel:{repair.customer.phone}" class="text-sm font-medium text-purple-600 hover:text-purple-700">
								{repair.customer.phone}
							</a>
							<button
								on:click={copyPhone}
								class="inline-flex items-center p-1 text-gray-400 hover:text-gray-600 transition-colors"
								title="Copiar teléfono"
							>
								{#if copySuccess}
									<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{:else}
									<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
								{/if}
							</button>
						</div>
					</div>
					{#if repair.customer.email}
					<div>
						<p class="text-sm text-gray-500">Email</p>
						<a href="mailto:{repair.customer.email}" class="text-sm font-medium text-purple-600 hover:text-purple-700 break-all">
							{repair.customer.email}
						</a>
					</div>
					{/if}
					{#if repair.customer.address}
					<div>
						<p class="text-sm text-gray-500">Dirección</p>
						<p class="text-sm text-gray-900">{repair.customer.address}</p>
					</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Historial de actividades SIMPLE -->
		<div class="bg-white shadow-sm rounded-lg p-6">
			<h2 class="text-lg font-bold mb-4">Historial de actividades</h2>
			
			{#each repair.notes as note}
				<div class="mb-3 p-3 bg-gray-100 rounded">
					<p class="font-medium">{note.author.name}</p>
					<p>{note.text}</p>
					<p class="text-sm text-gray-500">{note.createdAt}</p>
				</div>
			{/each}
			
			<form method="POST" action="?/addNote">
				<input type="text" name="text" placeholder="Escribir nota..." class="w-full p-2 border rounded mb-2" />
				<button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Agregar</button>
			</form>
		</div>

	</div>
</div>

<!-- Modal de actualización de estado -->
{#if showStatusModal}
<div class="fixed z-10 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showStatusModal = false}></div>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<form method="POST" action="?/updateStatus" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
					showStatusModal = false;
					statusNote = '';
				};
			}}>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						Actualizar estado de reparación
					</h3>
				
				<div class="space-y-4">
					<div>
						<label for="status" class="block text-sm font-medium text-gray-700 mb-2">
							Nuevo estado
						</label>
						<select
							id="status"
							name="status"
							bind:value={selectedStatus}
							class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
							required
						>
							{#each Object.entries(statusMap) as [value, { label, icon }]}
								<option value={value}>{icon} {label}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label for="note" class="block text-sm font-medium text-gray-700 mb-2">
							Nota (opcional)
						</label>
						<textarea
							id="note"
							name="note"
							bind:value={statusNote}
							rows="3"
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="Agregar una nota sobre este cambio de estado..."
						></textarea>
					</div>
				</div>
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="submit"
					disabled={loading}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Actualizando...' : 'Actualizar'}
				</button>
				<button
					type="button"
					on:click={() => showStatusModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</form>
	</div>
</div>
</div>
{/if}

<!-- Modal de cambio rápido de estado -->
{#if showChangeStatusModal}
<div class="fixed z-10 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showChangeStatusModal = false}></div>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<form method="POST" action="?/updateStatus" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
					showChangeStatusModal = false;
					newStatus = '';
				};
			}}>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						Cambiar estado de reparación
					</h3>
				
				<div class="space-y-4">
					<div>
						<label for="changeStatus" class="block text-sm font-medium text-gray-700 mb-2">
							Nuevo estado
						</label>
						<select
							id="changeStatus"
							name="status"
							bind:value={newStatus}
							class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
							required
						>
							<option value="">Seleccionar estado</option>
							{#each Object.entries(statusMap) as [value, { label, icon }]}
								{#if (data.user?.role === 'TECHNICIAN' && value !== 'DELIVERED') || (data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER')}
									<option value={value}>{icon} {label}</option>
								{/if}
							{/each}
						</select>
					</div>
					
					<div class="bg-blue-50 p-3 rounded-md">
						<p class="text-sm text-blue-800">
							{#if data.user?.role === 'TECHNICIAN'}
								Como técnico, puedes cambiar el estado de la reparación hasta "Terminado". Solo administradores pueden marcar como "Entregado".
							{:else}
								Se agregará automáticamente una nota al historial indicando el cambio de estado.
							{/if}
						</p>
					</div>
				</div>
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="submit"
					disabled={loading || !newStatus}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Cambiando...' : 'Cambiar estado'}
				</button>
				<button
					type="button"
					on:click={() => showChangeStatusModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</form>
	</div>
</div>
</div>
{/if}

<!-- Modal de asignación de técnico -->
{#if showAssignModal}
<div class="fixed z-10 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<button
			type="button"
			class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
			aria-label="Cerrar modal"
			tabindex="0"
			on:click={() => showAssignModal = false}
			on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { showAssignModal = false; } }}
			style="all: unset; position: fixed; inset: 0; background: rgba(107, 114, 128, 0.75); transition: opacity 0.3s;"
		></button>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<form method="POST" action="?/assignTechnician" use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					await update();
					loading = false;
					showAssignModal = false;
					if (result.type === 'failure') {
						console.error('Error asignando técnico:', result);
					}
				};
			}}>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						Asignar técnico
					</h3>
				
				<div class="space-y-4">
					<div>
						<label for="technicianId" class="block text-sm font-medium text-gray-700 mb-2">
							Seleccionar técnico
						</label>
						<select
							id="technicianId"
							name="technicianId"
							value={selectedTechnicianId}
							class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
						>
							<option value="">Sin asignar</option>
							{#if data.technicians && data.technicians.length > 0}
								{#each data.technicians as technician}
									<option value={technician.id}>{technician.name}</option>
								{/each}
							{/if}
						</select>
					</div>
					
					{#if selectedTechnicianId}
					<div class="bg-blue-50 p-3 rounded-md">
						<p class="text-sm text-blue-800">
							Al asignar un técnico, se enviará una notificación y el técnico podrá ver esta reparación en su lista.
						</p>
					</div>
					{/if}
				</div>
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="submit"
					disabled={loading}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Asignando...' : 'Asignar'}
				</button>
				<button
					type="button"
					on:click={() => showAssignModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</form>
	</div>
</div>
</div>
{/if}

<!-- Modal de actualización de costos -->
{#if showCostModal}
<div class="fixed z-10 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showCostModal = false}></div>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<form method="POST" action="?/updateCosts" use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					await update();
					loading = false;
					if (result.type === 'success') {
						showCostModal = false;
					} else if (result.type === 'failure') {
						console.error('Error guardando costos:', result);
						alert('Error al guardar los costos: ' + (result.data?.error || 'Error desconocido'));
					}
				};
			}}>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						Actualizar costos
					</h3>
				
				<div class="space-y-4">
					<div>
						<label for="laborCost" class="block text-sm font-medium text-gray-700 mb-2">
							Costo de mano de obra
						</label>
						<input
							type="number"
							id="laborCost"
							name="laborCost"
							bind:value={laborCostInput}
							step="0.01"
							min="0"
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="0.00"
						/>
					</div>
					
					<div>
						<label for="partsCost" class="block text-sm font-medium text-gray-700 mb-2">
							Costo de repuestos
						</label>
						<input
							type="number"
							id="partsCost"
							name="partsCost"
							bind:value={partsCostInput}
							step="0.01"
							min="0"
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="0.00"
						/>
					</div>
					
					<div>
						<label for="partsDescription" class="block text-sm font-medium text-gray-700 mb-2">
							Descripción del repuesto
						</label>
						<textarea
							id="partsDescription"
							name="partsDescription"
							bind:value={partsDescriptionInput}
							rows="3"
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="Ej: Pantalla LCD Samsung A51, Batería original iPhone 12..."
						/>
					</div>
					
					<div class="bg-purple-50 p-3 rounded-md">
						<p class="text-sm text-purple-800">
							{#if data.user?.role === 'TECHNICIAN'}
								Como técnico, puedes actualizar el costo de repuestos y su descripción.
							{:else}
								Los administradores pueden actualizar todos los costos.
							{/if}
						</p>
					</div>
				</div>
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="submit"
					disabled={loading}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Actualizando...' : 'Actualizar'}
				</button>
				<button
					type="button"
					on:click={() => showCostModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</form>
		</div>
	</div>
</div>
{/if}

<!-- Modal de actualización de link para técnicos -->
{#if showLinkModal}
<div class="fixed z-10 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showLinkModal = false}></div>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<form method="POST" action="?/updateLink" use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					await update();
					loading = false;
					if (result.type === 'success') {
						showLinkModal = false;
					} else if (result.type === 'failure') {
						console.error('Error guardando link:', result);
						alert('Error al guardar el link: ' + (result.data?.error || 'Error desconocido'));
					}
				};
			}}>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
						{repair.purchaseLink ? 'Actualizar' : 'Agregar'} link de compra
					</h3>
				
				<div class="space-y-4">
					<div>
						<label for="purchaseLinkInput" class="block text-sm font-medium text-gray-700 mb-2">
							Link de compra (MercadoLibre, etc.)
						</label>
						<input
							type="text"
							id="purchaseLinkInput"
							name="purchaseLink"
							bind:value={purchaseLinkInput}
							class="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="https://articulo.mercadolibre.com.ar/MLA-..."
						/>
						<p class="mt-1 text-xs text-gray-500">
							Pega el link completo del producto
						</p>
					</div>
					
					<div class="bg-blue-50 p-3 rounded-md">
						<p class="text-sm text-blue-800">
							Como técnico, puedes agregar o actualizar el link de compra de los repuestos.
						</p>
					</div>
				</div>
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="submit"
					disabled={loading}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Guardando...' : 'Guardar'}
				</button>
				<button
					type="button"
					on:click={() => showLinkModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</form>
		</div>
	</div>
</div>
{/if}