<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	
	export let data;
	export let form;
	
	let loading = false;
	let customerSearchTerm = '';
	let showCustomerDropdown = false;
	let selectedCustomer = null;
	let showNewCustomerForm = false;
	
	// Tipos de dispositivos comunes
	const deviceTypes = [
		'Notebook',
		'Celular',
		'Monitor',
		'TV',
		'Tablet',
		'Consola',
		'Impresora',
		'Otros'
	];
	
	// Variable para controlar si se muestra el campo personalizado
	let selectedDeviceType = '';
	let customDeviceType = '';
	
	// Marcas comunes
	const commonBrands = [
		'Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer',
		'Sony', 'LG', 'Huawei', 'Xiaomi', 'Motorola', 'Canon', 'Epson', 'Otros'
	];
	
	// Variable para controlar si se muestra el campo personalizado de marca
	let selectedBrand = '';
	let customBrand = '';
	
	// Notas predefinidas
	let predefinedNotes = [
		'Equipo recibido con contraseña: ',
		'Cliente solicita presupuesto antes de proceder',
		'Equipo recibido sin cargador',
		'Equipo recibido con cargador',
		'Cliente necesita urgente',
		'Respaldar información antes de formatear',
		'Cliente autoriza formateo si es necesario',
		'Equipo con golpes visibles',
		'Pantalla rota/dañada',
		'Teclado con teclas que no funcionan'
	];
	
	// Notas seleccionadas
	let selectedNotes = [];
	let showNotesModal = false;
	let activeTab = 'notes';
	
	// Términos y condiciones editables
	let termsAndConditions = [
		'El diagnóstico puede modificar el presupuesto inicial',
		'Equipos no reclamados después de 30 días no serán responsabilidad del taller',
		'Garantía de reparación: 30 días',
		'Conserve este comprobante para retirar su equipo'
	];
	
	// Buscar clientes existentes
	$: filteredCustomers = data.customers.filter(customer => 
		customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
		customer.phone.includes(customerSearchTerm) ||
		(customer.email && customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()))
	);
	
	function selectCustomer(customer) {
		selectedCustomer = customer;
		showCustomerDropdown = false;
		customerSearchTerm = customer.name;
	}
	
	function resetCustomerSelection() {
		selectedCustomer = null;
		customerSearchTerm = '';
		showNewCustomerForm = false;
	}
	
	// Funciones para manejar notas
	function toggleNote(note) {
		const index = selectedNotes.indexOf(note);
		if (index === -1) {
			selectedNotes = [...selectedNotes, note];
		} else {
			selectedNotes = selectedNotes.filter((_, i) => i !== index);
		}
	}
	
	// Eliminar nota predefinida
	function removeNote(index) {
		// Primero obtener la nota antes de eliminarla
		const noteToRemove = predefinedNotes[index];
		// Eliminar la nota del array
		predefinedNotes = predefinedNotes.filter((_, i) => i !== index);
		// También eliminar de las seleccionadas si estaba seleccionada
		selectedNotes = selectedNotes.filter(n => n !== noteToRemove);
	}
	
	// Agregar nueva nota predefinida
	function addNote() {
		predefinedNotes = [...predefinedNotes, ''];
	}
	
	function applyNotes() {
		const allNotes = [...selectedNotes];
		// Actualizar el campo de notas con todas las notas seleccionadas
		const notesTextarea = document.getElementById('notes');
		if (notesTextarea) {
			notesTextarea.value = allNotes.join('\n');
		}
		// Guardar términos y condiciones actualizados
		saveTermsAndConditions();
		showNotesModal = false;
	}
	
	
	// Funciones para manejar términos y condiciones
	function addTerm() {
		termsAndConditions = [...termsAndConditions, ''];
	}
	
	function removeTerm(index) {
		termsAndConditions = termsAndConditions.filter((_, i) => i !== index);
	}
	
	function saveTermsAndConditions() {
		// Guardar en localStorage para persistir los cambios
		localStorage.setItem('termsAndConditions', JSON.stringify(termsAndConditions));
		localStorage.setItem('predefinedNotes', JSON.stringify(predefinedNotes));
	}
	
	// Cargar términos y notas guardadas al iniciar
	onMount(() => {
		const savedTerms = localStorage.getItem('termsAndConditions');
		const savedNotes = localStorage.getItem('predefinedNotes');
		
		if (savedTerms) {
			termsAndConditions = JSON.parse(savedTerms);
		}
		if (savedNotes) {
			predefinedNotes = JSON.parse(savedNotes);
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header con gradiente suave lila a verde -->
	<div class="relative overflow-hidden">
		<!-- Gradiente de fondo con transición más suave y un poco más oscuro -->
		<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
		
		<!-- Contenido del header -->
		<div class="relative pb-32">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<button
						on:click={() => goto('/reparaciones')}
						class="text-white hover:text-purple-100 transition-colors"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</button>
					<div>
						<h1 class="text-3xl font-bold text-white">Nueva Reparación</h1>
						<p class="mt-2 text-purple-100">
							Registra un nuevo equipo para reparación
						</p>
					</div>
				</div>
			</div>
		</div>
		</div>
		
		<!-- Curva suave y orgánica en la parte inferior -->
		<div class="absolute bottom-0 left-0 right-0">
			<svg class="w-full h-16 sm:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
				<path d="M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z" fill="currentColor" class="text-gray-50 dark:text-gray-900" />
			</svg>
		</div>
	</div>

	<!-- Contenido principal con margen negativo para superponer -->
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
		<div class="bg-white shadow-lg rounded-lg overflow-hidden">
			<form method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}>
				<div class="p-6 space-y-6">
					<!-- Información del Cliente -->
					<div>
						<h2 class="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h2>
						
						<div class="space-y-4">
							<!-- Buscar cliente existente -->
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">
									Buscar cliente existente
								</label>
								<div class="relative">
									<input
										type="text"
										bind:value={customerSearchTerm}
										on:focus={() => showCustomerDropdown = true}
										on:input={() => {
											showCustomerDropdown = true;
											selectedCustomer = null;
										}}
										placeholder="Buscar por nombre, teléfono o email..."
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
									/>
									{#if selectedCustomer}
										<input type="hidden" name="customerId" value={selectedCustomer.id} />
									{/if}
									
									{#if showCustomerDropdown && customerSearchTerm && filteredCustomers.length > 0 && !selectedCustomer}
									<div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
										{#each filteredCustomers as customer}
										<button
											type="button"
											on:click={() => selectCustomer(customer)}
											class="w-full text-left px-4 py-2 hover:bg-gray-100"
										>
											<div class="font-medium text-gray-900">{customer.name}</div>
											<div class="text-sm text-gray-500">{customer.phone} {customer.email ? `• ${customer.email}` : ''}</div>
										</button>
										{/each}
									</div>
									{/if}
								</div>
								
								{#if selectedCustomer}
								<div class="mt-2 p-3 bg-purple-50 rounded-md">
									<div class="flex justify-between items-start">
										<div>
											<p class="font-medium text-purple-900">{selectedCustomer.name}</p>
											<p class="text-sm text-purple-700">{selectedCustomer.phone}</p>
											{#if selectedCustomer.email}
											<p class="text-sm text-purple-700">{selectedCustomer.email}</p>
											{/if}
										</div>
										<button
											type="button"
											on:click={resetCustomerSelection}
											class="text-purple-600 hover:text-purple-800"
										>
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
								{/if}
							</div>
							
							{#if !selectedCustomer}
							<div class="flex items-center">
								<div class="flex-grow border-t border-gray-300"></div>
								<span class="px-3 text-gray-500 text-sm">o</span>
								<div class="flex-grow border-t border-gray-300"></div>
							</div>
							
							<!-- Crear nuevo cliente -->
							<div>
								<button
									type="button"
									on:click={() => showNewCustomerForm = !showNewCustomerForm}
									class="text-purple-600 hover:text-purple-700 text-sm font-medium"
								>
									{showNewCustomerForm ? 'Cancelar' : 'Crear nuevo cliente'}
								</button>
								
								{#if showNewCustomerForm}
								<div class="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
									<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label for="customerName" class="block text-sm font-medium text-gray-700">
												Nombre completo *
											</label>
											<input
												type="text"
												name="customerName"
												id="customerName"
												required={showNewCustomerForm && !selectedCustomer}
												class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
											/>
										</div>
										
										<div>
											<label for="customerPhone" class="block text-sm font-medium text-gray-700">
												Teléfono *
											</label>
											<input
												type="tel"
												name="customerPhone"
												id="customerPhone"
												required={showNewCustomerForm && !selectedCustomer}
												class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
											/>
										</div>
										
										<div>
											<label for="customerEmail" class="block text-sm font-medium text-gray-700">
												Email
											</label>
											<input
												type="email"
												name="customerEmail"
												id="customerEmail"
												class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
											/>
										</div>
										
										<div>
											<label for="customerAddress" class="block text-sm font-medium text-gray-700">
												Dirección
											</label>
											<input
												type="text"
												name="customerAddress"
												id="customerAddress"
												class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
											/>
										</div>
									</div>
								</div>
								{/if}
							</div>
							{/if}
						</div>
					</div>

					<!-- Información del Dispositivo -->
					<div class="border-t pt-6">
						<h2 class="text-lg font-medium text-gray-900 mb-4">Información del Dispositivo</h2>
						
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="deviceType" class="block text-sm font-medium text-gray-700">
									Tipo de dispositivo *
								</label>
								<select
									name="deviceType"
									id="deviceType"
									required
									bind:value={selectedDeviceType}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								>
									<option value="">Selecciona un tipo</option>
									{#each deviceTypes as type}
									<option value={type}>{type}</option>
									{/each}
								</select>
							</div>
							
							{#if selectedDeviceType === 'Otros'}
							<div>
								<label for="customDeviceType" class="block text-sm font-medium text-gray-700">
									Especifica el tipo de dispositivo *
								</label>
								<input
									type="text"
									name="customDeviceType"
									id="customDeviceType"
									bind:value={customDeviceType}
									required={selectedDeviceType === 'Otros'}
									placeholder="Ej: Proyector, Parlante, etc."
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
							</div>
							{/if}
							
							<div>
								<label for="brand" class="block text-sm font-medium text-gray-700">
									Marca *
								</label>
								<select
									name="brand"
									id="brand"
									required
									bind:value={selectedBrand}
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								>
									<option value="">Selecciona una marca</option>
									{#each commonBrands as brand}
									<option value={brand}>{brand}</option>
									{/each}
								</select>
							</div>
							
							{#if selectedBrand === 'Otros'}
							<div>
								<label for="customBrand" class="block text-sm font-medium text-gray-700">
									Especifica la marca *
								</label>
								<input
									type="text"
									name="customBrand"
									id="customBrand"
									bind:value={customBrand}
									required={selectedBrand === 'Otros'}
									placeholder="Ej: Philips, Genius, etc."
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
							</div>
							{/if}
							
							<div>
								<label for="model" class="block text-sm font-medium text-gray-700">
									Modelo *
								</label>
								<input
									type="text"
									name="model"
									id="model"
									required
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
							</div>
							
							<div>
								<label for="serialNumber" class="block text-sm font-medium text-gray-700">
									Número de serie
								</label>
								<input
									type="text"
									name="serialNumber"
									id="serialNumber"
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
							</div>
						</div>
						
						<div class="mt-4">
							<label for="issue" class="block text-sm font-medium text-gray-700">
								Descripción del problema *
							</label>
							<textarea
								name="issue"
								id="issue"
								rows="4"
								required
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								placeholder="Describe detalladamente el problema que presenta el equipo..."
							></textarea>
						</div>
					</div>

					<!-- Fecha y Notas -->
					<div class="border-t pt-6">
						<h2 class="text-lg font-medium text-gray-900 mb-4">Información Adicional</h2>
						
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="receivedDate" class="block text-sm font-medium text-gray-700">
									Fecha de recepción
								</label>
								<input
									type="date"
									name="receivedDate"
									id="receivedDate"
									value={new Date().toISOString().split('T')[0]}
									readonly
									class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
								/>
							</div>
						</div>
						
						<div class="mt-4">
							<div class="flex items-center justify-between mb-2">
								<label for="notes" class="block text-sm font-medium text-gray-700">
									Notas adicionales
								</label>
								<button
									type="button"
									on:click={() => showNotesModal = true}
									class="inline-flex items-center px-3 py-1 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
								>
									<svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Editar impresión y notas
								</button>
							</div>
							<textarea
								name="notes"
								id="notes"
								rows="3"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								placeholder="Información adicional sobre el equipo o la reparación..."
							></textarea>
						</div>
					</div>

				</div>

				<!-- Botones de acción -->
				<div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
					<button
						type="button"
						on:click={() => goto('/reparaciones')}
						class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={loading || (!selectedCustomer && !showNewCustomerForm)}
						class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Guardando...' : 'Crear Reparación'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<svelte:window on:click={(e) => {
	if (!e.target.closest('.relative')) {
		showCustomerDropdown = false;
	}
}} />

<!-- Modal de selección de notas -->
{#if showNotesModal}
<div class="fixed z-50 inset-0 overflow-y-auto">
	<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" on:click={() => showNotesModal = false}></div>

		<div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
					Editar Impresión y Notas
				</h3>
				
				<!-- Tabs para separar secciones -->
				<div class="border-b border-gray-200 mb-4">
					<nav class="-mb-px flex space-x-8">
						<button
							type="button"
							class="border-b-2 {activeTab === 'notes' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-2 px-1 text-sm font-medium"
							on:click={() => activeTab = 'notes'}
						>
							Notas Predefinidas
						</button>
						<button
							type="button"
							class="border-b-2 {activeTab === 'terms' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} py-2 px-1 text-sm font-medium"
							on:click={() => activeTab = 'terms'}
						>
							Términos y Condiciones
						</button>
					</nav>
				</div>
				
				{#if activeTab === 'notes'}
					<div class="space-y-4">
						<p class="text-sm text-gray-600 mb-4">
							Las notas seleccionadas aparecerán en el campo de notas de la orden de servicio. También se mostrarán en la impresión.
						</p>
						
						<div class="space-y-2 max-h-64 overflow-y-auto">
							{#each predefinedNotes as note, index}
							<div class="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={selectedNotes.includes(note)}
									on:change={() => toggleNote(note)}
									class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
								/>
								<input
									type="text"
									bind:value={predefinedNotes[index]}
									placeholder="Ingrese nota..."
									class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
								<button
									type="button"
									on:click={() => removeNote(index)}
									class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
								>
									Eliminar
								</button>
							</div>
							{/each}
						</div>
						
						<button
							type="button"
							on:click={addNote}
							class="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
						>
							+ Agregar nueva nota
						</button>
					</div>
				{:else}
					<div class="space-y-4">
						<p class="text-sm text-gray-600 mb-4">
							Estos términos y condiciones aparecerán en la impresión de la orden de servicio.
						</p>
						
						{#each termsAndConditions as term, index}
							<div class="flex items-center space-x-2">
								<input
									type="text"
									bind:value={termsAndConditions[index]}
									placeholder="Ingrese término o condición..."
									class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
								/>
								<button
									type="button"
									on:click={() => removeTerm(index)}
									class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
								>
									Eliminar
								</button>
							</div>
						{/each}
						
						<button
							type="button"
							on:click={addTerm}
							class="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
						>
							+ Agregar término o condición
						</button>
					</div>
				{/if}
			</div>
			
			<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
				<button
					type="button"
					on:click={applyNotes}
					class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Aplicar Notas
				</button>
				<button
					type="button"
					on:click={() => showNotesModal = false}
					class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
				>
					Cancelar
				</button>
			</div>
		</div>
	</div>
</div>
{/if}