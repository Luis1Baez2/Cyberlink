<script lang="ts">
	import { enhance } from '$app/forms';
	
	export let data;
	export let form;
	
	let showPassword = false;
	let loading = false;
	let activeTab = 'info';
	
	// Determinar la ruta de inicio según el rol
	$: homeRoute = (() => {
		if (!data.user) return '/';
		switch (data.user.role) {
			case 'TECHNICIAN':
				return '/reparaciones';
			case 'EMPLOYEE':
				return '/inventario';
			default:
				return '/';
		}
	})();
	
	// Obtener iniciales del usuario
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map(word => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
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
				<div class="sm:flex sm:items-center sm:justify-between">
					<div>
						<h1 class="text-3xl sm:text-4xl font-light text-white mb-2">Mi Perfil</h1>
						<p class="text-white/80 text-lg font-light">
							Gestiona tu información personal y configuración de cuenta
						</p>
					</div>
					<div class="mt-4 sm:mt-0">
						<div class="flex items-center space-x-3">
							<div class="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
								{getInitials(data.user?.name || '')}
							</div>
							<div class="text-white">
								<p class="text-lg font-semibold">{data.user?.name}</p>
								<p class="text-sm text-white/80">{data.roleTranslation}</p>
							</div>
						</div>
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
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
		<div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
			
			<!-- Tabs mejorados -->
			<div class="border-b border-gray-200 dark:border-gray-700">
				<nav class="-mb-px flex">
					<button
						on:click={() => activeTab = 'info'}
						class="group relative py-4 px-6 text-sm font-medium transition-all {activeTab === 'info' 
							? 'text-purple-600 dark:text-purple-400' 
							: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
					>
						<div class="flex items-center space-x-2">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<span>Información Personal</span>
						</div>
						{#if activeTab === 'info'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-green-600"></div>
						{/if}
					</button>
					<button
						on:click={() => activeTab = 'password'}
						class="group relative py-4 px-6 text-sm font-medium transition-all {activeTab === 'password' 
							? 'text-purple-600 dark:text-purple-400' 
							: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
					>
						<div class="flex items-center space-x-2">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h7m2 0h2a2 2 0 002-2m0 0V7a2 2 0 00-2-2h-2m0 0V3m0 2v2m0 10v2m0-2h2" />
							</svg>
							<span>Cambiar Contraseña</span>
						</div>
						{#if activeTab === 'password'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-green-600"></div>
						{/if}
					</button>
				</nav>
			</div>
			
			<div class="p-8">
				{#if activeTab === 'info'}
				<!-- Información Personal -->
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Columna izquierda - Resumen -->
					<div class="lg:col-span-1">
						<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumen de cuenta</h3>
							<div class="space-y-4">
								<div>
									<p class="text-sm text-gray-500 dark:text-gray-400">Miembro desde</p>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
								</div>
								<div>
									<p class="text-sm text-gray-500 dark:text-gray-400">Último acceso</p>
									<p class="text-sm font-medium text-gray-900 dark:text-gray-100">Hace unos momentos</p>
								</div>
								<div>
									<p class="text-sm text-gray-500 dark:text-gray-400">Estado de cuenta</p>
									<div class="flex items-center mt-1">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
											<svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400 dark:text-green-300" fill="currentColor" viewBox="0 0 8 8">
												<circle cx="4" cy="4" r="3" />
											</svg>
											Activo
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Columna derecha - Formulario -->
					<div class="lg:col-span-2">
						<form method="POST" action="?/updateProfile" use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								await update();
								loading = false;
							};
						}}>
							<div class="space-y-6">
								<div>
									<label for="username" class="block text-sm font-medium text-gray-700 mb-1">
										Nombre de usuario
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										</div>
										<input
											type="text"
											id="username"
											value={data.user?.username}
											disabled
											class="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
										/>
										<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
									</div>
									<p class="mt-1 text-xs text-gray-500">El nombre de usuario es único y no se puede cambiar</p>
								</div>
							
								<div>
									<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
										Nombre completo
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</div>
										<input
											type="text"
											name="name"
											id="name"
											value={form?.name || data.user?.name}
											required
											class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
											placeholder="Ingresa tu nombre completo"
										/>
									</div>
								</div>
							
								<div>
									<label for="recoveryEmail" class="block text-sm font-medium text-gray-700 mb-1">
										Correo de recuperación
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
											</svg>
										</div>
										<input
											type="email"
											name="recoveryEmail"
											id="recoveryEmail"
											value={form?.recoveryEmail || data.user?.recoveryEmail || ''}
											class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
											placeholder="correo@ejemplo.com"
										/>
									</div>
									<p class="mt-1 text-xs text-gray-500">Este correo se usará para recuperar tu contraseña</p>
								</div>
							
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">
										Rol asignado
									</label>
									<div class="relative">
										<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
											</svg>
										</div>
										<div class="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
											{data.roleTranslation}
										</div>
									</div>
									<p class="mt-1 text-xs text-gray-500">Los permisos de rol son asignados por un administrador</p>
								</div>
							
								{#if form?.success && activeTab === 'info'}
								<div class="rounded-lg bg-green-50 border border-green-200 p-4">
									<div class="flex">
										<div class="flex-shrink-0">
											<svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div class="ml-3">
											<p class="text-sm font-medium text-green-800">
												Perfil actualizado correctamente
											</p>
										</div>
									</div>
								</div>
								{/if}
								
								{#if form?.error && activeTab === 'info'}
								<div class="rounded-lg bg-red-50 border border-red-200 p-4">
									<div class="flex">
										<div class="flex-shrink-0">
											<svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div class="ml-3">
											<p class="text-sm font-medium text-red-800">
												{form.error}
											</p>
										</div>
									</div>
								</div>
								{/if}
								
								<div class="flex justify-end">
									<button
										type="submit"
										disabled={loading}
										class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									>
										{#if loading}
											<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Guardando...
										{:else}
											<svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
											Guardar cambios
										{/if}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
				
				{:else if activeTab === 'password'}
				<!-- Cambiar Contraseña -->
				<div class="max-w-2xl">
					<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-amber-800">
									Recomendaciones de seguridad
								</h3>
								<div class="mt-2 text-sm text-amber-700">
									<ul class="list-disc list-inside space-y-1">
										<li>Usa al menos 8 caracteres</li>
										<li>Incluye números y letras</li>
										<li>No uses información personal</li>
									</ul>
								</div>
							</div>
						</div>
					</div>

					<form method="POST" action="?/updatePassword" use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update();
							loading = false;
						};
					}}>
						<div class="space-y-6">
							<div>
								<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
									Contraseña actual
								</label>
								<div class="relative">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
									<input
										type={showPassword ? 'text' : 'password'}
										name="currentPassword"
										id="currentPassword"
										required
										class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
										placeholder="Ingresa tu contraseña actual"
									/>
								</div>
							</div>
							
							<div>
								<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
									Nueva contraseña
								</label>
								<div class="relative">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
										</svg>
									</div>
									<input
										type={showPassword ? 'text' : 'password'}
										name="newPassword"
										id="newPassword"
										required
										minlength="4"
										class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
										placeholder="Mínimo 4 caracteres"
									/>
								</div>
							</div>
							
							<div>
								<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
									Confirmar nueva contraseña
								</label>
								<div class="relative">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
										</svg>
									</div>
									<input
										type={showPassword ? 'text' : 'password'}
										name="confirmPassword"
										id="confirmPassword"
										required
										minlength="4"
										class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
										placeholder="Repite la nueva contraseña"
									/>
								</div>
							</div>
							
							<div class="flex items-center">
								<input
									type="checkbox"
									id="showPassword"
									bind:checked={showPassword}
									class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all"
								/>
								<label for="showPassword" class="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
									Mostrar contraseñas
								</label>
							</div>
							
							{#if form?.success && activeTab === 'password'}
							<div class="rounded-lg bg-green-50 border border-green-200 p-4">
								<div class="flex">
									<div class="flex-shrink-0">
										<svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-green-800">
											Contraseña actualizada correctamente
										</p>
									</div>
								</div>
							</div>
							{/if}
							
							{#if form?.error && activeTab === 'password'}
							<div class="rounded-lg bg-red-50 border border-red-200 p-4">
								<div class="flex">
									<div class="flex-shrink-0">
										<svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-red-800">
											{form.error}
										</p>
									</div>
								</div>
							</div>
							{/if}
							
							<div class="flex justify-end">
								<button
									type="submit"
									disabled={loading}
									class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
								>
									{#if loading}
										<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Actualizando...
									{:else}
										<svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
										Cambiar contraseña
									{/if}
								</button>
							</div>
						</div>
					</form>
				</div>
				{/if}
			</div>
		</div>
		
		<!-- Botón volver -->
		<div class="mt-8 flex justify-center">
			<a 
				href={homeRoute} 
				class="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
			>
				<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Volver al inicio
			</a>
		</div>
	</div>
</div>