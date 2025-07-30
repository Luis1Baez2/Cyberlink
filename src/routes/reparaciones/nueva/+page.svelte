<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	
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
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header con gradiente -->
	<div class="bg-gradient-to-r from-purple-600 to-green-600 pb-32">
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
							<label for="notes" class="block text-sm font-medium text-gray-700">
								Notas adicionales
							</label>
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