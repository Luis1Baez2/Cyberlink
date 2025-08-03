<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	// Términos y condiciones predeterminados
	let defaultTerms = [
		'El diagnóstico puede modificar el presupuesto inicial',
		'Equipos no reclamados después de 30 días no serán responsabilidad del taller',
		'Garantía de reparación: 30 días',
		'Conserve este comprobante para retirar su equipo'
	];
	
	// Cargar términos desde localStorage o usar los predeterminados
	let termsAndConditions = [...defaultTerms];
	let newTerm = '';
	
	// Notas disponibles con selección
	let availableNotes = [];
	let newNote = '';
	
	// Estados para feedback
	let saveSuccess = false;
	let saveError = false;
	
	onMount(() => {
		// Cargar términos y condiciones
		const savedTerms = localStorage.getItem('termsAndConditions');
		if (savedTerms) {
			try {
				const parsed = JSON.parse(savedTerms);
				// Si es el formato con objetos, extraer solo el texto
				if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
					termsAndConditions = parsed.map(term => term.text || term);
				} else {
					termsAndConditions = parsed;
				}
			} catch (e) {
				console.error('Error cargando términos:', e);
			}
		}
		
		// Cargar notas disponibles
		const savedNotes = localStorage.getItem('availableNotes');
		if (savedNotes) {
			try {
				const parsed = JSON.parse(savedNotes);
				// Migrar desde formato antiguo si es necesario
				if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
					availableNotes = parsed.map(note => ({ text: note, enabled: true }));
					saveNotes();
				} else {
					availableNotes = parsed;
				}
			} catch (e) {
				console.error('Error cargando notas:', e);
			}
		}
	});
	
	// Funciones para términos y condiciones
	function addTerm() {
		if (newTerm.trim()) {
			termsAndConditions = [...termsAndConditions, newTerm.trim()];
			newTerm = '';
			saveTerms();
		}
	}
	
	function removeTerm(index: number) {
		termsAndConditions = termsAndConditions.filter((_, i) => i !== index);
		saveTerms();
	}
	
	function saveTerms() {
		localStorage.setItem('termsAndConditions', JSON.stringify(termsAndConditions));
		showSaveSuccess();
	}
	
	// Funciones para notas
	function addNote() {
		if (newNote.trim()) {
			availableNotes = [...availableNotes, { text: newNote.trim(), enabled: true }];
			newNote = '';
			saveNotes();
		}
	}
	
	function toggleNote(index: number) {
		availableNotes[index].enabled = !availableNotes[index].enabled;
		availableNotes = availableNotes;
		saveNotes();
	}
	
	function removeNote(index: number) {
		availableNotes = availableNotes.filter((_, i) => i !== index);
		saveNotes();
	}
	
	function saveNotes() {
		localStorage.setItem('availableNotes', JSON.stringify(availableNotes));
		showSaveSuccess();
	}
	
	// Función para mostrar mensaje de éxito
	function showSaveSuccess() {
		saveSuccess = true;
		setTimeout(() => {
			saveSuccess = false;
		}, 3000);
	}
	
	// Función para restaurar valores predeterminados
	function restoreDefaults() {
		if (confirm('¿Estás seguro de que deseas restaurar los valores predeterminados? Esto eliminará todas las personalizaciones.')) {
			termsAndConditions = [...defaultTerms];
			availableNotes = [];
			printSettings = {
				showLogo: true,
				showDate: true,
				showTerms: true,
				copiesCount: 2
			};
			saveTerms();
			saveNotes();
			savePrintSettings();
		}
	}
	
	// Función para seleccionar/deseleccionar todas las notas
	function toggleAllNotes(enabled: boolean) {
		availableNotes = availableNotes.map(note => ({ ...note, enabled }));
		saveNotes();
	}
	
	// Función para guardar configuración de impresión
	function savePrintSettings() {
		localStorage.setItem('printSettings', JSON.stringify(printSettings));
		showSaveSuccess();
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<div class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<button
							on:click={() => goto('/reparaciones')}
							class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
						</button>
						<div>
							<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar impresión y notas</h1>
							<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Personaliza los términos y condiciones y las notas disponibles</p>
						</div>
					</div>
					
					<button
						on:click={restoreDefaults}
						class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
					>
						<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Restaurar predeterminados
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Notificaciones -->
	{#if saveSuccess}
	<div class="fixed top-4 right-4 z-50">
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
			<strong class="font-bold">¡Guardado!</strong>
			<span class="block sm:inline"> Los cambios se han guardado correctamente.</span>
		</div>
	</div>
	{/if}

	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Términos y condiciones -->
			<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
				<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Términos y condiciones</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
					Estos términos aparecerán en la impresión de las órdenes de servicio.
				</p>
				
				<!-- Lista de términos -->
				<div class="space-y-2 mb-6">
					{#each termsAndConditions as term, index}
					<div class="flex items-start space-x-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
						<span class="text-sm text-gray-600 dark:text-gray-300 mt-0.5">•</span>
						<p class="flex-1 text-sm text-gray-700 dark:text-gray-200">{term}</p>
						<button
							on:click={() => removeTerm(index)}
							class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
					{/each}
					
					{#if termsAndConditions.length === 0}
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
						No hay términos y condiciones. Agrega uno nuevo.
					</p>
					{/if}
				</div>
				
				<!-- Agregar nuevo término -->
				<div class="flex space-x-2">
					<input
						type="text"
						bind:value={newTerm}
						on:keydown={(e) => e.key === 'Enter' && addTerm()}
						placeholder="Nuevo término o condición..."
						class="flex-1 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md"
					/>
					<button
						on:click={addTerm}
						disabled={!newTerm.trim()}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Agregar
					</button>
				</div>
			</div>
			
			<!-- Notas disponibles -->
			<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
				<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notas disponibles</h2>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
					Estas notas estarán disponibles para seleccionar al crear nuevas órdenes de servicio. Marca las que deseas usar.
				</p>
				
				<!-- Controles de selección para notas -->
				<div class="flex justify-end gap-2 mb-4">
					<button
						on:click={() => toggleAllNotes(true)}
						class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
					>
						Seleccionar todas
					</button>
					<span class="text-gray-300 dark:text-gray-600">|</span>
					<button
						on:click={() => toggleAllNotes(false)}
						class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
					>
						Deseleccionar todas
					</button>
				</div>
				
				<!-- Lista de notas -->
				<div class="space-y-2 mb-6">
					{#each availableNotes as note, index}
					<div class="flex items-start space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
						<input
							type="checkbox"
							bind:checked={note.enabled}
							on:change={() => saveNotes()}
							class="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
						/>
						<p class="flex-1 text-sm text-gray-700 dark:text-gray-200 {!note.enabled ? 'opacity-50' : ''}">{note.text}</p>
						<button
							on:click={() => removeNote(index)}
							class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
					{/each}
					
					{#if availableNotes.length === 0}
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
						No hay notas disponibles. Agrega una nueva.
					</p>
					{/if}
				</div>
				
				<!-- Agregar nueva nota -->
				<div class="flex space-x-2">
					<input
						type="text"
						bind:value={newNote}
						on:keydown={(e) => e.key === 'Enter' && addNote()}
						placeholder="Nueva nota..."
						class="flex-1 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md"
					/>
					<button
						on:click={addNote}
						disabled={!newNote.trim()}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Agregar
					</button>
				</div>
			</div>
		</div>
		
		<!-- Configuración de impresión -->
		<div class="mt-8 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
			<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Configuración de impresión</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
				Personaliza cómo se verán las órdenes de servicio impresas.
			</p>
			
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<label class="flex items-center space-x-3">
						<input
							type="checkbox"
							bind:checked={printSettings.showDate}
							on:change={savePrintSettings}
							class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
						/>
						<span class="text-sm text-gray-700 dark:text-gray-200">Mostrar fecha de impresión</span>
					</label>
				</div>
				
				<div class="flex items-center justify-between">
					<label class="flex items-center space-x-3">
						<input
							type="checkbox"
							bind:checked={printSettings.showTerms}
							on:change={savePrintSettings}
							class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
						/>
						<span class="text-sm text-gray-700 dark:text-gray-200">Incluir términos y condiciones</span>
					</label>
				</div>
				
				<div class="pt-4 border-t dark:border-gray-700">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
						Número de copias para orden de servicio
					</label>
					<select
						bind:value={printSettings.copiesCount}
						on:change={savePrintSettings}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
					>
						<option value={1}>1 copia (solo empresa)</option>
						<option value={2}>2 copias (empresa + cliente)</option>
						<option value={3}>3 copias</option>
					</select>
					<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
						Los recibos de salida siempre se imprimen con una sola copia.
					</p>
				</div>
			</div>
		</div>
		
		<!-- Información adicional -->
		<div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">Información importante</h3>
					<div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
						<ul class="list-disc list-inside space-y-1">
							<li>Los cambios se guardan automáticamente en el navegador</li>
							<li>Los términos y condiciones aparecerán en todas las órdenes de servicio impresas</li>
							<li>Las notas disponibles facilitarán la creación de nuevas órdenes</li>
							<li>Los cambios solo afectan a este navegador, no se sincronizan entre dispositivos</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>