<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { translateRole } from '$lib/utils/roles';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	export let data;
	
	let sidebarOpen = false;
	let userMenuOpen = false;
	
	// Inicializar tema al montar el componente
	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme.set(savedTheme);
	});
		
	// Función de logout simplificada
	async function handleLogout() {
		try {
			await fetch('/logout', { method: 'POST' });
			goto('/login');
		} catch (error) {
			console.error('Error during logout:', error);
			goto('/login');
		}
	}
	
	// Cerrar menús al hacer clic fuera
	function handleClickOutside(event) {
		const target = event.target;
		if (!target.closest('.user-menu-container')) {
			userMenuOpen = false;
		}
	}
	
	// Rutas del menú
	const menuItems = [
		{ href: '/', label: 'Inicio', icon: '🏠', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
		{ href: '/inventario', label: 'Inventario', icon: '📦', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
		{ href: '/facturacion', label: 'Facturación', icon: '💰', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
		{ href: '/reparaciones', label: 'Reparaciones', icon: '🔧', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN'] },
		{ href: '/clientes', label: 'Clientes', icon: '👥', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
		{ href: '/repuestos', label: 'Compras', icon: '🛒', roles: ['ADMIN'], special: 'dueño' },
		{ href: '/metricas', label: 'Métricas', icon: '📊', roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
		{ href: '/usuarios', label: 'Usuarios', icon: '👤', roles: ['ADMIN'] }
	];
	
	// Filtrar items según el rol
	$: visibleMenuItems = data.user ? menuItems.filter(item => {
		if (data.user?.username === 'dueño') return true;
		if (item.special === 'dueño' && data.user?.username !== 'dueño') return false;
		return item.roles.includes(data.user?.role || '');
	}) : [];
	
	// Verificar si es la página de login o de impresión
	$: isLoginPage = $page.url.pathname === '/login' || 
	                 $page.url.pathname === '/recuperar-password' ||
	                 $page.url.pathname.includes('/imprimir');
</script>

<svelte:window on:click={handleClickOutside} />

{#if !isLoginPage && data.user}
<!-- Layout principal simplificado -->
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
	<!-- Sidebar -->
	<div class="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0">
		<div class="h-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl transition-colors duration-200">
			<!-- Logo y título -->
			<div class="p-6 border-b border-gray-100 dark:border-gray-700">
				<a href="/" class="flex items-center space-x-3">
					<div class="w-12 h-12 bg-gradient-to-br from-purple-400 via-purple-500 to-green-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
						🛠️
					</div>
					<div>
						<h1 class="text-2xl font-light text-gray-800 dark:text-gray-100">ProManager</h1>
						<p class="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión</p>
					</div>
				</a>
			</div>
			
			<!-- Navegación -->
			<nav class="p-4 space-y-2">
				{#each visibleMenuItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 relative
							{$page.url.pathname === item.href 
								? 'bg-gradient-to-r from-purple-400 via-purple-500 to-green-400 text-white shadow-lg' 
								: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
					>
						<span class="text-2xl">{item.icon}</span>
						<span class="font-medium flex-1">{item.label}</span>
						{#if item.href === '/repuestos' && data.pendingPartsCount > 0}
							<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
								{data.pendingPartsCount}
							</span>
						{/if}
					</a>
				{/each}
			</nav>
			
			<!-- Info de usuario -->
			<div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 dark:border-gray-700">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-br from-purple-400 via-purple-500 to-green-400 rounded-full flex items-center justify-center text-white font-medium shadow-md">
						{data.user.name.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<p class="text-sm font-medium text-gray-800 dark:text-gray-200">{data.user.name}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">{translateRole(data.user.role)}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Contenido principal -->
	<div class="lg:pl-72">
		<!-- Header -->
		<header class="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-sm">
			<div class="px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<!-- Botón de menú móvil -->
					<button
						on:click={() => sidebarOpen = !sidebarOpen}
						class="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
						</svg>
					</button>
					
					<!-- Título -->
					<div class="flex-1 px-4">
						<h2 class="text-2xl font-light text-gray-800 dark:text-gray-200">
							{#if $page.url.pathname === '/'}
								Inicio
							{:else if $page.url.pathname === '/reparaciones'}
								Gestión de Reparaciones
							{:else if $page.url.pathname === '/inventario'}
								Control de Inventario
							{:else if $page.url.pathname === '/clientes'}
								Gestión de Clientes
							{:else if $page.url.pathname === '/metricas'}
								Centro de Métricas
							{:else if $page.url.pathname === '/usuarios'}
								Administración de Usuarios
							{:else if $page.url.pathname === '/repuestos'}
								Gestión de Repuestos
							{:else}
								{$page.url.pathname.slice(1).charAt(0).toUpperCase() + $page.url.pathname.slice(2)}
							{/if}
						</h2>
					</div>
					
					<!-- Botón de modo oscuro y menú de usuario -->
					<div class="flex items-center gap-2">
						<!-- Botón de modo oscuro -->
						<button
							on:click={() => theme.toggle()}
							class="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
							aria-label="Cambiar tema"
						>
							{#if $theme === 'dark'}
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							{:else}
								<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							{/if}
						</button>
						
						<!-- Menú de usuario -->
						<div class="relative user-menu-container">
						<button
							on:click={() => userMenuOpen = !userMenuOpen}
							class="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<div class="w-10 h-10 bg-gradient-to-br from-purple-400 via-purple-500 to-green-400 rounded-full flex items-center justify-center text-white font-medium shadow-md">
								{data.user.name.charAt(0).toUpperCase()}
							</div>
							<div class="hidden sm:block text-left">
								<p class="text-sm font-medium text-gray-800 dark:text-gray-200">{data.user.name}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{translateRole(data.user.role)}</p>
							</div>
						</button>
						
						<!-- Dropdown menu -->
						{#if userMenuOpen}
							<div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
								<div class="p-4 border-b border-gray-100 dark:border-gray-700">
									<p class="text-sm font-medium text-gray-800 dark:text-gray-200">{data.user.name}</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">@{data.user.username}</p>
								</div>
								<div class="p-2">
									<a href="/perfil" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
										<span>👤</span>
										<span>Mi Perfil</span>
									</a>
									{#if data.user.role === 'ADMIN' || data.user.username === 'dueño'}
									<a href="/usuarios" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
										<span>👥</span>
										<span>Gestión de Usuarios</span>
									</a>
									{/if}
									<button 
										on:click={handleLogout}
										class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<span>🚪</span>
										<span>Cerrar Sesión</span>
									</button>
								</div>
							</div>
						{/if}
						</div>
					</div>
				</div>
			</div>
		</header>
		
		<!-- Contenido -->
		<main class="p-4 sm:p-6 lg:p-8">
			<slot />
		</main>
	</div>
	
	<!-- Overlay móvil -->
	{#if sidebarOpen}
		<div 
			class="fixed inset-0 bg-black/50 z-40 lg:hidden"
			on:click={() => sidebarOpen = false}
		></div>
	{/if}
</div>

{:else}
<!-- Layout para páginas sin autenticación -->
<slot />
{/if}