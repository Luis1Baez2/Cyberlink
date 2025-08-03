<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form;
	
	let showCreateModal = false;
	let showEditModal = false;
	let selectedUser = null;
	let deleteUserId = null;
	
	// Datos para nuevo usuario
	let newUser = {
		username: '',
		password: '',
		name: '',
		role: 'EMPLOYEE',
		workShift: 'FULL_TIME'
	};
	
	// Mapeo de roles
	const roleLabels = {
		ADMIN: 'Administrador',
		MANAGER: 'Gerente',
		EMPLOYEE: 'Empleado',
		TECHNICIAN: 'Técnico'
	};
	
	// Mapeo de turnos
	const shiftLabels = {
		FULL_TIME: 'Turno Completo',
		HALF_TIME: 'Medio Turno'
	};
	
	function openEditModal(user) {
		selectedUser = { 
			...user,
			workShift: user.workShift || 'FULL_TIME'
		};
		showEditModal = true;
	}
	
	function closeModals() {
		showCreateModal = false;
		showEditModal = false;
		selectedUser = null;
		deleteUserId = null;
		// Resetear formulario
		newUser = {
			username: '',
			password: '',
			name: '',
			role: 'EMPLOYEE',
			workShift: 'FULL_TIME'
		};
	}
	
	// Mostrar mensaje de éxito/error
	$: if (form?.success) {
		setTimeout(() => {
			form = null;
		}, 3000);
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
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 class="text-3xl sm:text-4xl font-light text-white mb-2">Gestión de Usuarios</h1>
						<p class="text-white/80 text-lg font-light">Administra los usuarios del sistema</p>
					</div>
					<button
						on:click={() => showCreateModal = true}
						class="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-lg text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
						</svg>
						Nuevo Usuario
					</button>
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
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
		<!-- Mensaje de éxito/error -->
		{#if form?.success}
		<div class="mb-4 bg-green-50 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded relative">
			<span class="block sm:inline">Operación realizada con éxito</span>
			<button 
				on:click={() => form = null}
				class="absolute top-0 bottom-0 right-0 px-4 py-3"
			>
				<span class="text-green-500">×</span>
			</button>
		</div>
		{:else if form?.message}
		<div class="mb-4 bg-red-50 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
			<span class="block sm:inline">{form.message}</span>
			<button 
				on:click={() => form = null}
				class="absolute top-0 bottom-0 right-0 px-4 py-3"
			>
				<span class="text-red-500">×</span>
			</button>
		</div>
		{/if}
		
		<!-- Tabla de usuarios -->
		<div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Nombre
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Usuario
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Rol
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Turno
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Fecha de Creación
							</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{#each data.users as user}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
								{user.name}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
								{user.username}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
									class:bg-purple-100={user.role === 'ADMIN'}
									class:text-purple-800={user.role === 'ADMIN'}
									class:dark:bg-purple-800={user.role === 'ADMIN'}
									class:dark:text-purple-200={user.role === 'ADMIN'}
									class:bg-blue-100={user.role === 'MANAGER'}
									class:text-blue-800={user.role === 'MANAGER'}
									class:dark:bg-blue-800={user.role === 'MANAGER'}
									class:dark:text-blue-200={user.role === 'MANAGER'}
									class:bg-green-100={user.role === 'EMPLOYEE'}
									class:text-green-800={user.role === 'EMPLOYEE'}
									class:dark:bg-green-800={user.role === 'EMPLOYEE'}
									class:dark:text-green-200={user.role === 'EMPLOYEE'}
									class:bg-yellow-100={user.role === 'TECHNICIAN'}
									class:text-yellow-800={user.role === 'TECHNICIAN'}
									class:dark:bg-yellow-800={user.role === 'TECHNICIAN'}
									class:dark:text-yellow-200={user.role === 'TECHNICIAN'}
								>
									{roleLabels[user.role]}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
									class:bg-indigo-100={user.workShift === 'FULL_TIME'}
									class:text-indigo-800={user.workShift === 'FULL_TIME'}
									class:dark:bg-indigo-800={user.workShift === 'FULL_TIME'}
									class:dark:text-indigo-200={user.workShift === 'FULL_TIME'}
									class:bg-orange-100={user.workShift === 'HALF_TIME'}
									class:text-orange-800={user.workShift === 'HALF_TIME'}
									class:dark:bg-orange-800={user.workShift === 'HALF_TIME'}
									class:dark:text-orange-200={user.workShift === 'HALF_TIME'}
								>
									{shiftLabels[user.workShift || 'FULL_TIME']}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
								{new Date(user.createdAt).toLocaleDateString('es-ES')}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									on:click={() => openEditModal(user)}
									class="text-indigo-600 hover:text-indigo-900 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
								>
									Editar
								</button>
								{#if user.username !== data.user.username}
								<button
									on:click={() => deleteUserId = user.id}
									class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
								>
									Eliminar
								</button>
								{:else}
								<span class="text-gray-400 dark:text-gray-500 text-xs">Usuario actual</span>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<!-- Modal Crear Usuario -->
{#if showCreateModal}
<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Crear Nuevo Usuario</h3>
		
		<form method="POST" action="?/createUser" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					closeModals();
					window.location.reload();
				}
			};
		}}>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
					<input
						type="text"
						name="name"
						bind:value={newUser.name}
						required
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</label>
					<input
						type="text"
						name="username"
						bind:value={newUser.username}
						required
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
					<input
						type="password"
						name="password"
						bind:value={newUser.password}
						required
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					/>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
					<select
						name="role"
						bind:value={newUser.role}
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					>
						{#each Object.entries(roleLabels) as [value, label]}
						<option value={value}>{label}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Turno</label>
					<select
						name="workShift"
						bind:value={newUser.workShift}
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					>
						{#each Object.entries(shiftLabels) as [value, label]}
						<option value={value}>{label}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={closeModals}
					class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 hover:bg-gray-50"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
				>
					Crear Usuario
				</button>
			</div>
		</form>
	</div>
</div>
{/if}

<!-- Modal Editar Usuario -->
{#if showEditModal && selectedUser}
<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Editar Usuario</h3>
		
		<form method="POST" action="?/updateUser" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					closeModals();
					window.location.reload();
				}
			};
		}}>
			<input type="hidden" name="userId" value={selectedUser.id} />
			
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
					<p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</label>
					<p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.username}</p>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
					<select
						name="role"
						bind:value={selectedUser.role}
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					>
						{#each Object.entries(roleLabels) as [value, label]}
						<option value={value}>{label}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Turno</label>
					<select
						name="workShift"
						bind:value={selectedUser.workShift}
						class="mt-1 block w-full border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
					>
						{#each Object.entries(shiftLabels) as [value, label]}
						<option value={value}>{label}</option>
						{/each}
					</select>
					{#if selectedUser.role === 'TECHNICIAN'}
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Los técnicos de medio turno tienen metas reducidas al 50%
					</p>
					{/if}
				</div>
			</div>
			
			<div class="mt-6 flex justify-end space-x-3">
				<button
					type="button"
					on:click={closeModals}
					class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 hover:bg-gray-50"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
				>
					Guardar Cambios
				</button>
			</div>
		</form>
	</div>
</div>
{/if}

<!-- Modal Confirmar Eliminación -->
{#if deleteUserId}
<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Confirmar Eliminación</h3>
		<p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
			¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
		</p>
		
		<form method="POST" action="?/deleteUser" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					deleteUserId = null;
					window.location.reload();
				}
			};
		}}>
			<input type="hidden" name="userId" value={deleteUserId} />
			
			<div class="flex justify-end space-x-3">
				<button
					type="button"
					on:click={() => deleteUserId = null}
					class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 hover:bg-gray-50"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
				>
					Eliminar
				</button>
			</div>
		</form>
	</div>
</div>
{/if}