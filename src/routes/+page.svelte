<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	export let data;
	
	let stats = {
		totalProducts: 0,
		lowStock: 0,
		pendingRepairs: 0,
		completedRepairs: 0,
		todaySales: 0,
		monthSales: 0,
		activeClients: 0,
		technicianEfficiency: 0
	};
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
		// Simulación de carga de datos
		setTimeout(() => {
			stats = {
				totalProducts: 156,
				lowStock: 12,
				pendingRepairs: 8,
				completedRepairs: 45,
				todaySales: 24500.00,
				monthSales: 387500.00,
				activeClients: 234,
				technicianEfficiency: 87
			};
		}, 300);
	});
	
	// Función para formatear moneda
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS'
		}).format(amount);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
	<!-- Header con saludo personalizado -->
	<div class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100"></div>
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{#if mounted}
				<div in:fly={{ y: 20, duration: 600 }}>
					<h1 class="text-4xl font-light text-gray-800 mb-2">
						¡Bienvenido, {data.user?.name || 'Usuario'}! 👋
					</h1>
					<p class="text-lg text-gray-600">
						Este es el resumen de hoy, {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
					</p>
				</div>
			{/if}
		</div>
	</div>
	
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-4">
		<!-- Tarjetas de estadísticas principales -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{#if mounted}
				<!-- Ventas del día -->
				<div in:scale={{ duration: 500, delay: 200 }} 
					class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-4">
						<div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-300 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
							💰
						</div>
						<span class="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
							+12% hoy
						</span>
					</div>
					<h3 class="text-sm font-medium text-gray-600 mb-1">Ventas del Día</h3>
					<p class="text-2xl font-semibold text-gray-900">{formatCurrency(stats.todaySales)}</p>
					<p class="text-xs text-gray-500 mt-2">Total del mes: {formatCurrency(stats.monthSales)}</p>
				</div>
				
				<!-- Reparaciones pendientes -->
				<div in:scale={{ duration: 500, delay: 300 }} 
					class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-4">
						<div class="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-300 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
							🔧
						</div>
						<span class="text-xs font-medium text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
							{stats.pendingRepairs} activas
						</span>
					</div>
					<h3 class="text-sm font-medium text-gray-600 mb-1">Reparaciones</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.completedRepairs} completadas</p>
					<p class="text-xs text-gray-500 mt-2">Este mes</p>
				</div>
				
				<!-- Inventario -->
				<div in:scale={{ duration: 500, delay: 400 }} 
					class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-4">
						<div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-300 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
							📦
						</div>
						{#if stats.lowStock > 0}
							<span class="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full animate-pulse">
								⚠️ {stats.lowStock} stock bajo
							</span>
						{:else}
							<span class="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
								✓ Stock OK
							</span>
						{/if}
					</div>
					<h3 class="text-sm font-medium text-gray-600 mb-1">Productos</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.totalProducts} totales</p>
					<p class="text-xs text-gray-500 mt-2">En inventario</p>
				</div>
				
				<!-- Clientes -->
				<div in:scale={{ duration: 500, delay: 500 }} 
					class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-4">
						<div class="w-14 h-14 bg-gradient-to-br from-purple-300 to-purple-200 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
							👥
						</div>
						<span class="text-xs font-medium text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
							+8 nuevos
						</span>
					</div>
					<h3 class="text-sm font-medium text-gray-600 mb-1">Clientes Activos</h3>
					<p class="text-2xl font-semibold text-gray-900">{stats.activeClients}</p>
					<p class="text-xs text-gray-500 mt-2">Total registrados</p>
				</div>
			{/if}
		</div>

		<!-- Notificación de repuestos pendientes para el dueño -->
		{#if data.user?.username === 'dueño' && data.pendingPartsCount > 0 && mounted}
		<div in:scale={{ duration: 500, delay: 550 }} 
			class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-6 mb-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<div class="relative">
						<div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl animate-pulse">
							🛒
						</div>
						<span class="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full animate-bounce">
							{data.pendingPartsCount}
						</span>
					</div>
					<div>
						<h3 class="text-lg font-medium text-gray-900">
							{data.pendingPartsCount} {data.pendingPartsCount === 1 ? 'Repuesto Pendiente' : 'Repuestos Pendientes'}
						</h3>
						<p class="text-sm text-gray-600">
							{data.pendingPartsCount === 1 ? 'Reparación esperando repuesto o compra' : `${data.pendingPartsCount} reparaciones esperando repuestos`}
						</p>
					</div>
				</div>
				<a href="/repuestos" 
					class="px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
					Ver repuestos
				</a>
			</div>
		</div>
		{/if}
		
		<!-- Accesos rápidos con nuevo diseño -->
		<div in:fly={{ y: 30, duration: 600, delay: 600 }} class="mb-8">
			<h2 class="text-2xl font-light text-gray-800 mb-6">Acciones Rápidas</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Nueva Reparación -->
				<a href="/reparaciones/nueva" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-300 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							🔨
						</div>
						<div>
							<p class="font-medium text-gray-900">Nueva Reparación</p>
							<p class="text-sm text-gray-600">Registrar equipo</p>
						</div>
					</div>
				</a>
				
				<!-- Nuevo Producto -->
				<a href="/inventario" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-300 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							📦
						</div>
						<div>
							<p class="font-medium text-gray-900">Inventario</p>
							<p class="text-sm text-gray-600">Gestionar productos</p>
						</div>
					</div>
				</a>
				
				<!-- Nuevo Cliente -->
				<a href="/clientes/nuevo" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-200 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							👤
						</div>
						<div>
							<p class="font-medium text-gray-900">Nuevo Cliente</p>
							<p class="text-sm text-gray-600">Registrar cliente</p>
						</div>
					</div>
				</a>
				
				<!-- Ver Métricas -->
				<a href="/metricas" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-300 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							📊
						</div>
						<div>
							<p class="font-medium text-gray-900">Métricas</p>
							<p class="text-sm text-gray-600">Ver reportes</p>
						</div>
					</div>
				</a>
			</div>
		</div>

		<!-- Segunda fila de acciones rápidas solo para dueño/admin -->
		{#if data.user?.username === 'dueño' || data.user?.role === 'ADMIN'}
		<div in:fly={{ y: 30, duration: 600, delay: 650 }} class="mb-8">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Gestión de Repuestos -->
				<a href="/repuestos" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							🛒
						</div>
						<div>
							<p class="font-medium text-gray-900">Gestión Repuestos</p>
							<p class="text-sm text-gray-600">Compras pendientes</p>
						</div>
						{#if data.pendingPartsCount > 0}
							<span class="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full animate-bounce">
								{data.pendingPartsCount}
							</span>
						{/if}
					</div>
				</a>
				
				<!-- Gestión de Usuarios -->
				<a href="/usuarios" 
					class="group bg-gradient-to-br from-gray-50 to-gray-100 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
					<div class="flex flex-col items-center text-center space-y-3">
						<div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
							👤
						</div>
						<div>
							<p class="font-medium text-gray-900">Usuarios</p>
							<p class="text-sm text-gray-600">Gestionar accesos</p>
						</div>
					</div>
				</a>
			</div>
		</div>
		{/if}
		
		<!-- Navegación a todas las secciones -->
		<div in:fly={{ y: 30, duration: 600, delay: 700 }} class="mb-8">
			<h2 class="text-2xl font-light text-gray-800 mb-6">Todas las Secciones</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
				<!-- Reparaciones -->
				<a href="/reparaciones" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-300 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							🔧
						</div>
						<p class="text-sm font-medium text-gray-900">Reparaciones</p>
					</div>
				</a>
				
				<!-- Inventario -->
				<a href="/inventario" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-300 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							📦
						</div>
						<p class="text-sm font-medium text-gray-900">Inventario</p>
					</div>
				</a>
				
				<!-- Clientes -->
				<a href="/clientes" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-purple-300 to-purple-200 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							👥
						</div>
						<p class="text-sm font-medium text-gray-900">Clientes</p>
					</div>
				</a>
				
				<!-- Métricas -->
				<a href="/metricas" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-300 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							📊
						</div>
						<p class="text-sm font-medium text-gray-900">Métricas</p>
					</div>
				</a>
				
				<!-- Repuestos (solo para dueño) -->
				{#if data.user?.username === 'dueño'}
				<a href="/repuestos" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 relative">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-300 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							🛒
						</div>
						<p class="text-sm font-medium text-gray-900">Repuestos</p>
						{#if data.pendingPartsCount > 0}
							<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
								{data.pendingPartsCount}
							</span>
						{/if}
					</div>
				</a>
				{/if}
				
				<!-- Usuarios (admin y dueño) -->
				{#if data.user?.role === 'ADMIN' || data.user?.username === 'dueño'}
				<a href="/usuarios" 
					class="group bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
					<div class="flex flex-col items-center text-center space-y-2">
						<div class="w-12 h-12 bg-gradient-to-br from-green-400 to-purple-300 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
							👤
						</div>
						<p class="text-sm font-medium text-gray-900">Usuarios</p>
					</div>
				</a>
				{/if}
			</div>
		</div>
		
		<!-- Panel de rendimiento -->
		{#if data.user?.role === 'ADMIN' || data.user?.username === 'dueño'}
			<div in:fly={{ y: 30, duration: 600, delay: 800 }} 
				class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-light text-gray-800">Rendimiento del Equipo</h2>
					<a href="/metricas" 
						class="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200">
						Ver métricas completas →
					</a>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<!-- Eficiencia técnicos -->
					<div class="text-center">
						<div class="relative inline-flex items-center justify-center mb-4">
							<svg class="w-20 h-20">
								<circle cx="40" cy="40" r="36" stroke="#e5e7eb" stroke-width="8" fill="none"></circle>
								<circle cx="40" cy="40" r="36" stroke="url(#gradient)" stroke-width="8" fill="none"
									stroke-dasharray={`${2 * Math.PI * 36}`}
									stroke-dashoffset={`${2 * Math.PI * 36 * (1 - stats.technicianEfficiency / 100)}`}
									stroke-linecap="round"
									transform="rotate(-90 40 40)"
									class="transition-all duration-1000">
								</circle>
								<defs>
									<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stop-color="#8b5cf6" />
										<stop offset="100%" stop-color="#ec4899" />
									</linearGradient>
								</defs>
							</svg>
							<span class="absolute text-xl font-semibold text-gray-900">{stats.technicianEfficiency}%</span>
						</div>
						<p class="text-sm font-medium text-gray-700">Eficiencia Técnicos</p>
						<p class="text-xs text-gray-500 mt-1">Promedio del mes</p>
					</div>
					
					<!-- Satisfacción clientes -->
					<div class="text-center">
						<div class="text-5xl mb-4">😊</div>
						<p class="text-2xl font-semibold text-gray-900">4.8/5</p>
						<p class="text-sm font-medium text-gray-700">Satisfacción</p>
						<p class="text-xs text-gray-500 mt-1">Basado en 47 opiniones</p>
					</div>
					
					<!-- Tiempo promedio -->
					<div class="text-center">
						<div class="text-5xl mb-4">⏱️</div>
						<p class="text-2xl font-semibold text-gray-900">2.3 días</p>
						<p class="text-sm font-medium text-gray-700">Tiempo Promedio</p>
						<p class="text-xs text-gray-500 mt-1">De reparación</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Animación suave para elementos */
	:global(.hover\:-translate-y-1:hover) {
		transform: translateY(-0.25rem);
	}
</style>