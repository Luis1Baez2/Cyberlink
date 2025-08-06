<script lang="ts">
	export let data;
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
		
		<div class="relative z-10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-light text-white mb-2">Facturación</h1>
						<p class="text-white/80 text-lg font-light">
							Sistema de facturación
						</p>
					</div>
				</div>
			</div>
		</div>
		
		<div class="absolute bottom-0 left-0 right-0">
			<svg class="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
				<path d="M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z" fill="currentColor" class="text-gray-50" />
			</svg>
		</div>
	</div>

	<!-- Contenido principal -->
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
		<div class="bg-white rounded-lg shadow p-8">
			<div class="text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">Sin funcionalidad de facturación</h3>
				<p class="mt-1 text-sm text-gray-500">Esta sección está en desarrollo.</p>
			</div>
		</div>
	</div>
</div>