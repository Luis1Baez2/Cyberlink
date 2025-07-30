<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	export let data;
	
	// Meses en español
	const months = [
		{ value: 1, label: 'Enero' },
		{ value: 2, label: 'Febrero' },
		{ value: 3, label: 'Marzo' },
		{ value: 4, label: 'Abril' },
		{ value: 5, label: 'Mayo' },
		{ value: 6, label: 'Junio' },
		{ value: 7, label: 'Julio' },
		{ value: 8, label: 'Agosto' },
		{ value: 9, label: 'Septiembre' },
		{ value: 10, label: 'Octubre' },
		{ value: 11, label: 'Noviembre' },
		{ value: 12, label: 'Diciembre' }
	];
	
	// Manejador de cambio de periodo
	function handlePeriodChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const type = target.name;
		const value = target.value;
		
		const params = new URLSearchParams(window.location.search);
		if (type === 'month') {
			params.set('month', value);
		} else if (type === 'year') {
			params.set('year', value);
		}
		
		goto(`/metricas?${params.toString()}`);
	}
	
	// Formatear moneda
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS'
		}).format(amount);
	}
	
	// Formatear número con decimales
	function formatNumber(num: number, decimals: number = 1): string {
		return num.toFixed(decimals);
	}
	
	// Obtener color de evaluación con gradientes suaves
	function getEvalGradient(color: string): string {
		const gradients = {
			red: 'from-red-500 to-rose-600',
			orange: 'from-orange-500 to-amber-600',
			yellow: 'from-yellow-500 to-amber-500',
			green: 'from-green-500 to-emerald-600',
			purple: 'from-purple-500 to-violet-600'
		};
		return gradients[color] || gradients.green;
	}
	
	// Obtener color de evaluación
	function getEvalColor(color: string): string {
		const colors = {
			red: 'text-red-600 bg-red-50',
			orange: 'text-orange-600 bg-orange-50',
			yellow: 'text-yellow-600 bg-yellow-50',
			green: 'text-green-600 bg-green-50',
			purple: 'text-purple-600 bg-purple-50'
		};
		return colors[color] || colors.green;
	}
	
	// Obtener color de alerta
	function getAlertBorder(color: string): string {
		const colors = {
			red: 'border-red-200',
			yellow: 'border-yellow-200',
			green: 'border-green-200'
		};
		return colors[color] || colors.green;
	}
	
	// Obtener ícono de progreso
	function getProgressIcon(percentage: number): string {
		if (percentage >= 100) return '🎯';
		if (percentage >= 80) return '📈';
		if (percentage >= 60) return '⚡';
		if (percentage >= 40) return '🔥';
		return '💪';
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
	<!-- Header elegante con glassmorphism -->
	<div class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
		<div class="absolute inset-0 bg-black/10 backdrop-blur-3xl"></div>
		
		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div in:fly={{ y: 20, duration: 600, delay: 100 }}>
					<h1 class="text-4xl font-light text-white mb-2">
						{#if data.isTechnician}
							Mis Métricas
						{:else}
							Centro de Métricas
						{/if}
					</h1>
					<p class="text-white/80 text-lg font-light">
						{#if data.isTechnician}
							Seguimiento de tu rendimiento personal
						{:else}
							Análisis del equipo técnico
						{/if}
					</p>
				</div>
				
				<!-- Selector de periodo con diseño elegante -->
				<div in:fly={{ y: 20, duration: 600, delay: 200 }} class="mt-6 sm:mt-0 flex items-center space-x-3">
					<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-1 flex space-x-2">
						<select
							name="month"
							value={data.selectedMonth}
							on:change={handlePeriodChange}
							class="bg-transparent text-white placeholder-white/70 px-4 py-2 rounded-xl focus:outline-none focus:bg-white/10 transition-all duration-300"
						>
							{#each months as month}
								<option value={month.value} class="text-gray-900">{month.label}</option>
							{/each}
						</select>
						
						<select
							name="year"
							value={data.selectedYear}
							on:change={handlePeriodChange}
							class="bg-transparent text-white placeholder-white/70 px-4 py-2 rounded-xl focus:outline-none focus:bg-white/10 transition-all duration-300"
						>
							{#if data.availableYears}
								{#each data.availableYears as year}
									<option value={year} class="text-gray-900">{year}</option>
								{/each}
							{:else}
								<option value={data.selectedYear} class="text-gray-900">{data.selectedYear}</option>
							{/if}
						</select>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Olas decorativas -->
		<div class="absolute bottom-0 left-0 right-0">
			<svg viewBox="0 0 1440 120" class="w-full h-16">
				<path fill="rgba(249, 250, 251, 1)" d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z" />
			</svg>
		</div>
	</div>
	
	<!-- Contenido principal -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative z-10">
		{#if data.isTechnician}
		<!-- Vista del técnico -->
		
		<!-- Cards de evaluación y estado -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			<!-- Evaluación con diseño moderno -->
			<div in:scale={{ duration: 500, delay: 300 }} 
				class="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
				<div class="bg-gradient-to-br {getEvalGradient(data.evaluation.color)} p-8 text-white">
					<h3 class="text-xl font-light mb-6 opacity-90">
						Evaluación {data.isCurrentMonth ? 'Actual' : `de ${months[data.selectedMonth - 1].label}`}
					</h3>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-7xl mb-4 filter drop-shadow-lg">{data.evaluation.emoji}</div>
							<div class="text-4xl font-light">
								{data.evaluation.label}
							</div>
						</div>
						<div class="text-right">
							<div class="text-5xl font-light">
								{formatNumber(data.evaluation.percentage, 0)}%
							</div>
							<div class="text-sm opacity-80 mt-2">de cumplimiento</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Estado de cumplimiento -->
			<div in:scale={{ duration: 500, delay: 400 }} 
				class="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500">
				<h3 class="text-xl font-light text-gray-700 mb-6">Estado de Cumplimiento</h3>
				{#if data.isCurrentMonth}
				<div class="space-y-4">
					<div class="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r {getAlertBorder(data.alertStatus.color)} {data.alertStatus.color === 'green' ? 'from-green-50 to-emerald-50' : data.alertStatus.color === 'yellow' ? 'from-yellow-50 to-amber-50' : 'from-red-50 to-rose-50'}">
						<span class="font-medium text-gray-800">{data.alertStatus.message}</span>
						{#if data.alertStatus.status === 'urgent'}
							<span class="text-2xl animate-pulse">⚡</span>
						{/if}
					</div>
					<div class="bg-gray-50 rounded-2xl p-6">
						<div class="flex items-center justify-between mb-4">
							<span class="text-gray-600">Progreso del mes</span>
							<span class="text-2xl font-light text-gray-900">{data.workDaysElapsed}/{data.workDaysInPeriod}</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
								style="width: {(data.workDaysElapsed / data.workDaysInPeriod) * 100}%">
							</div>
						</div>
						<p class="text-sm text-gray-500 mt-2">Quedan {data.daysLeft} días laborables</p>
					</div>
				</div>
				{:else}
				<div class="flex flex-col items-center justify-center h-full py-8">
					<div class="text-6xl mb-4">📊</div>
					<span class="text-xl text-gray-600">Periodo finalizado</span>
					<p class="text-gray-500 mt-2">Total: {data.workDaysInPeriod} días laborables</p>
				</div>
				{/if}
			</div>
		</div>
		
		<!-- Panel de metas con diseño moderno -->
		<div in:fly={{ y: 20, duration: 600, delay: 500 }} 
			class="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500">
			<div class="flex items-center justify-between mb-8">
				<h2 class="text-2xl font-light text-gray-800">
					Progreso de Metas
				</h2>
				<div class="flex items-center space-x-2">
					<span class="px-4 py-2 rounded-full text-sm font-medium {data.isHalfTime ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}">
						{data.isHalfTime ? 'Medio Turno' : 'Turno Completo'}
					</span>
				</div>
			</div>
			
			<div class="space-y-8">
				{#if data.isCurrentMonth}
				<!-- Meta diaria -->
				<div class="group">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{getProgressIcon(data.percentages.daily)}</span>
							<h3 class="text-lg font-medium text-gray-700">Meta Diaria</h3>
						</div>
						<span class="text-lg text-gray-600">
							{formatNumber(data.currentProgress.daily)} / {formatNumber(data.dailyGoal)}
						</span>
					</div>
					<div class="relative">
						<div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
							<div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
								{data.percentages.daily >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
								 data.percentages.daily >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
								 'bg-gradient-to-r from-red-400 to-rose-500'}"
								style="width: {Math.min(100, data.percentages.daily)}%">
								<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
							</div>
						</div>
						<span class="absolute -top-8 text-sm font-medium text-gray-700 transition-all duration-300"
							style="left: {Math.min(100, data.percentages.daily)}%">
							{formatNumber(data.percentages.daily, 0)}%
						</span>
					</div>
				</div>
				
				<!-- Meta semanal -->
				<div class="group">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{getProgressIcon(data.percentages.weekly)}</span>
							<h3 class="text-lg font-medium text-gray-700">Meta Semanal</h3>
						</div>
						<span class="text-lg text-gray-600">
							{formatNumber(data.currentProgress.weekly)} / {formatNumber(data.weeklyGoal)}
						</span>
					</div>
					<div class="relative">
						<div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
							<div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
								{data.percentages.weekly >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
								 data.percentages.weekly >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
								 'bg-gradient-to-r from-red-400 to-rose-500'}"
								style="width: {Math.min(100, data.percentages.weekly)}%">
								<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
							</div>
						</div>
						<span class="absolute -top-8 text-sm font-medium text-gray-700 transition-all duration-300"
							style="left: {Math.min(100, data.percentages.weekly)}%">
							{formatNumber(data.percentages.weekly, 0)}%
						</span>
					</div>
				</div>
				{/if}
				
				<!-- Meta mensual -->
				<div class="group">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{getProgressIcon(data.percentages.monthly)}</span>
							<h3 class="text-lg font-medium text-gray-700">Meta Mensual</h3>
						</div>
						<span class="text-lg text-gray-600">
							{formatNumber(data.currentProgress.monthly)} / {data.monthlyGoal}
						</span>
					</div>
					<div class="relative">
						<div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
							<div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
								{data.percentages.monthly >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
								 data.percentages.monthly >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
								 'bg-gradient-to-r from-red-400 to-rose-500'}"
								style="width: {Math.min(100, data.percentages.monthly)}%">
								<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
							</div>
						</div>
						<span class="absolute -top-8 text-sm font-medium text-gray-700 transition-all duration-300"
							style="left: {Math.min(100, data.percentages.monthly)}%">
							{formatNumber(data.percentages.monthly, 0)}%
						</span>
					</div>
					<p class="text-sm text-gray-500 mt-2">
						Días trabajados: {data.workDaysElapsed}/{data.workDaysInPeriod}
					</p>
				</div>
				
				<!-- Meta de ingresos -->
				<div class="group border-t pt-8">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">💰</span>
							<h3 class="text-lg font-medium text-gray-700">Meta de Ingresos</h3>
						</div>
						<span class="text-lg font-medium text-gray-900">
							{formatCurrency(data.currentProgress.revenue)}
						</span>
					</div>
					<div class="relative">
						<div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
								style="width: {Math.min(100, (data.currentProgress.revenue / data.monthlyRevenueGoal) * 100)}%">
								<div class="absolute inset-0 bg-white/30 animate-pulse"></div>
							</div>
						</div>
						<span class="absolute -top-8 text-sm font-medium text-gray-700 transition-all duration-300"
							style="left: {Math.min(100, (data.currentProgress.revenue / data.monthlyRevenueGoal) * 100)}%">
							{formatNumber((data.currentProgress.revenue / data.monthlyRevenueGoal) * 100, 0)}%
						</span>
					</div>
					<p class="text-sm text-gray-500 mt-2">
						Objetivo: {formatCurrency(data.monthlyRevenueGoal)}
					</p>
				</div>
			</div>
		</div>
		
		{:else}
		<!-- Vista del admin/dueño -->
		
		<!-- Rankings con cards elegantes -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Top Equipos -->
			<div in:scale={{ duration: 500, delay: 300 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-medium text-gray-700">Top Equipos</h3>
					<span class="text-3xl">🏆</span>
				</div>
				<div class="space-y-4">
					{#each data.rankings.byCompleted.slice(0, 3) as tech, index}
					<div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">
								{#if index === 0}🥇{:else if index === 1}🥈{:else}🥉{/if}
							</span>
							<span class="font-medium text-gray-700">{tech.name}</span>
						</div>
						<span class="text-lg font-semibold text-gray-900">{tech.completed}</span>
					</div>
					{/each}
				</div>
			</div>
			
			<!-- Top Cumplimiento -->
			<div in:scale={{ duration: 500, delay: 400 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-medium text-gray-700">Top Cumplimiento</h3>
					<span class="text-3xl">📊</span>
				</div>
				<div class="space-y-4">
					{#each data.rankings.byPercentage.slice(0, 3) as tech, index}
					<div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">
								{#if index === 0}🥇{:else if index === 1}🥈{:else}🥉{/if}
							</span>
							<span class="font-medium text-gray-700">{tech.name}</span>
						</div>
						<span class="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							{formatNumber(tech.percentage, 0)}%
						</span>
					</div>
					{/each}
				</div>
			</div>
			
			<!-- Top Ingresos -->
			<div in:scale={{ duration: 500, delay: 500 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-medium text-gray-700">Top Ingresos</h3>
					<span class="text-3xl">💰</span>
				</div>
				<div class="space-y-4">
					{#each data.rankings.byRevenue.slice(0, 3) as tech, index}
					<div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">
								{#if index === 0}🥇{:else if index === 1}🥈{:else}🥉{/if}
							</span>
							<span class="font-medium text-gray-700">{tech.name}</span>
						</div>
						<span class="text-sm font-semibold text-green-600">
							{formatCurrency(tech.revenue).split(',')[0]}
						</span>
					</div>
					{/each}
				</div>
			</div>
			
			<!-- Ranking General -->
			<div in:scale={{ duration: 500, delay: 600 }} 
				class="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-lg font-medium text-gray-700">Ranking General</h3>
					<span class="text-3xl">🌟</span>
				</div>
				<div class="space-y-4">
					{#each data.rankings.overall.slice(0, 3) as tech, index}
					<div class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">
								{#if index === 0}🥇{:else if index === 1}🥈{:else}🥉{/if}
							</span>
							<span class="font-medium text-gray-700">{tech.name}</span>
						</div>
						<div class="flex items-center space-x-1">
							{#each Array(Math.min(5, Math.ceil(tech.rankingScore / 20))) as _}
								<span class="text-yellow-400">★</span>
							{/each}
						</div>
					</div>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Tabla de técnicos con diseño elegante -->
		<div in:fly={{ y: 20, duration: 600, delay: 700 }} 
			class="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
			<div class="p-8">
				<h2 class="text-2xl font-light text-gray-800 mb-6">Detalle de Técnicos</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-gray-100">
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Técnico</th>
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Turno</th>
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Evaluación</th>
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Progreso</th>
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Tiempo Promedio</th>
								<th class="text-left py-4 px-6 text-sm font-medium text-gray-600 uppercase tracking-wider">Ingresos</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50">
							{#each data.technicianStats as tech}
							<tr class="hover:bg-gray-50 transition-colors duration-200">
								<td class="py-6 px-6">
									<div class="flex items-center space-x-3">
										<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
											{tech.name.charAt(0)}
										</div>
										<span class="font-medium text-gray-900">{tech.name}</span>
									</div>
								</td>
								<td class="py-6 px-6">
									<span class="px-3 py-1 rounded-full text-xs font-medium
										{tech.workShift === 'FULL_TIME' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}">
										{tech.isHalfTime ? 'Medio' : 'Completo'}
									</span>
								</td>
								<td class="py-6 px-6">
									<div class="flex items-center space-x-2">
										<span class="text-2xl">{tech.evaluation.emoji}</span>
										<span class="px-3 py-1 rounded-full text-xs font-medium {getEvalColor(tech.evaluation.color)}">
											{tech.evaluation.label}
										</span>
									</div>
								</td>
								<td class="py-6 px-6">
									<div class="flex items-center space-x-3">
										<span class="text-sm font-medium text-gray-700">{tech.completed}/{tech.monthlyGoal}</span>
										<div class="w-24">
											<div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
												<div class="h-full rounded-full transition-all duration-500
													{tech.percentage >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
													 tech.percentage >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
													 'bg-gradient-to-r from-red-400 to-rose-500'}"
													style="width: {Math.min(100, tech.percentage)}%">
												</div>
											</div>
										</div>
										<span class="text-sm font-medium text-gray-600">{formatNumber(tech.percentage, 0)}%</span>
									</div>
								</td>
								<td class="py-6 px-6">
									<span class="text-sm text-gray-600">{formatNumber(tech.avgRepairTime, 1)} días</span>
								</td>
								<td class="py-6 px-6">
									<span class="text-sm font-semibold text-gray-900">{formatCurrency(tech.revenue)}</span>
								</td>
							</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
		
		<!-- Estadísticas de equipos por categoría -->
		{#if data.deviceCategories && data.deviceCategories.length > 0}
		<div in:fly={{ y: 20, duration: 600, delay: 750 }} 
			class="bg-white rounded-3xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-all duration-500 mt-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-light text-gray-800">Equipos por Categoría</h2>
				<span class="text-3xl">📱</span>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.deviceCategories as category}
				<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-medium text-gray-700">{category.type}</h3>
						<div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-300 rounded-full flex items-center justify-center text-white font-bold shadow-md">
							{category.count}
						</div>
					</div>
					<div class="space-y-2">
						<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-1000"
								style="width: {category.percentage}%">
							</div>
						</div>
						<p class="text-sm text-gray-600">
							{formatNumber(category.percentage, 1)}% del total
						</p>
					</div>
				</div>
				{/each}
			</div>
			
			<div class="mt-6 pt-6 border-t border-gray-200">
				<div class="flex items-center justify-between">
					<p class="text-gray-600">Total de equipos en el período</p>
					<p class="text-2xl font-semibold text-gray-900">{data.totalRepairs}</p>
				</div>
			</div>
		</div>
		{/if}
		
		<!-- Resumen del periodo -->
		<div in:fly={{ y: 20, duration: 600, delay: 800 }} 
			class="mt-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 text-white">
			<h3 class="text-2xl font-light mb-8">
				Resumen de {months[data.selectedMonth - 1].label} {data.selectedYear}
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="text-center">
					<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
						<p class="text-white/80 mb-2">Progreso del Periodo</p>
						<p class="text-4xl font-light">{data.workDaysElapsed}/{data.workDaysInPeriod}</p>
						<p class="text-sm text-white/60 mt-2">días laborables</p>
					</div>
				</div>
				<div class="text-center">
					<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
						<p class="text-white/80 mb-2">Técnicos Activos</p>
						<p class="text-4xl font-light">{data.technicianStats.length}</p>
						<p class="text-sm text-white/60 mt-2">en el equipo</p>
					</div>
				</div>
				<div class="text-center">
					<div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6">
						<p class="text-white/80 mb-2">Días Restantes</p>
						<p class="text-4xl font-light">{data.daysLeft}</p>
						<p class="text-sm text-white/60 mt-2">para completar</p>
					</div>
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>

<style>
	/* Animaciones personalizadas */
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}
	
	/* Efectos hover suaves */
	:global(.hover\:shadow-2xl) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	/* Scrollbar personalizada */
	:global(::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}
	
	:global(::-webkit-scrollbar-track) {
		background: #f1f1f1;
		border-radius: 10px;
	}
	
	:global(::-webkit-scrollbar-thumb) {
		background: #888;
		border-radius: 10px;
	}
	
	:global(::-webkit-scrollbar-thumb:hover) {
		background: #555;
	}
	
	/* Select personalizado */
	select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
		padding-right: 2.5rem;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
	
	/* Animación de las barras de progreso */
	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}
	
	.animate-shimmer {
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>