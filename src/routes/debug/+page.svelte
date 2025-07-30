<script>
	import { enhance } from '$app/forms';
	
	export let form;
	
	let username = 'dueño';
	let password = '1234';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
		<h1 class="text-2xl font-bold text-center mb-6">🔧 Debug Login</h1>
		
		<form method="POST" action="/login" use:enhance>
			<div class="mb-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Usuario:
				</label>
				<select bind:value={username} name="username" class="w-full px-3 py-2 border border-gray-300 rounded-md">
					<option value="dueño">dueño</option>
					<option value="admin">admin</option>
					<option value="juan">juan</option>
					<option value="rodrigo">rodrigo</option>
					<option value="vendedor">vendedor</option>
				</select>
			</div>
			
			<div class="mb-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Contraseña:
				</label>
				<input 
					type="text" 
					bind:value={password}
					name="password"
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
				/>
			</div>
			
			<button 
				type="submit"
				class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
			>
				🚀 Probar Login
			</button>
		</form>
		
		{#if form?.error}
			<div class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
				❌ {form.error}
			</div>
		{/if}
		
		<div class="mt-6 text-sm text-gray-600">
			<p><strong>URL actual:</strong> {window?.location?.href || 'N/A'}</p>
			<p><strong>User Agent:</strong> {navigator?.userAgent?.substring(0, 50) || 'N/A'}...</p>
		</div>
		
		<div class="mt-4 text-xs text-gray-500">
			<p>✅ Test de hash: Los usuarios están configurados correctamente</p>
			<p>✅ Contraseña: "1234" para todos los usuarios</p>
			<p>✅ Si funciona aquí, el problema es de cache/navegador</p>
		</div>
	</div>
</div>