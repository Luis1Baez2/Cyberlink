<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4">
	<div class="max-w-md w-full text-center">
		<div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
			<!-- Ícono de error -->
			<div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center text-white text-5xl shadow-lg mx-auto mb-6">
				❌
			</div>
			
			<!-- Código de error -->
			<h1 class="text-6xl font-light text-gray-800 mb-2">
				{$page.status || 500}
			</h1>
			
			<!-- Mensaje de error -->
			<p class="text-xl text-gray-600 mb-8">
				{#if $page.status === 404}
					Página no encontrada
				{:else if $page.status === 403}
					Acceso denegado
				{:else if $page.status === 401}
					No autorizado
				{:else}
					Algo salió mal
				{/if}
			</p>
			
			<!-- Descripción -->
			<p class="text-sm text-gray-500 mb-8">
				{$page.error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
			</p>
			
			<!-- Botones de acción -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					on:click={() => window.history.back()}
					class="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-300 transition-colors duration-200"
				>
					← Volver
				</button>
				<button
					on:click={() => goto('/')}
					class="px-6 py-3 bg-gradient-to-r from-purple-400 via-purple-500 to-green-400 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
				>
					Ir al inicio
				</button>
			</div>
		</div>
		
		<!-- Información adicional para desarrollo -->
		{#if import.meta.env.DEV}
			<div class="mt-6 p-4 bg-gray-100 rounded-2xl text-left">
				<p class="text-xs font-mono text-gray-600">
					Error: {$page.status} - {$page.error?.message}
				</p>
			</div>
		{/if}
	</div>
</div>