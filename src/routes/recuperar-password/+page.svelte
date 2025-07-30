<script lang="ts">
	import { enhance } from '$app/forms';
	
	export let form;
	let loading = false;
</script>

<style>
	.input-focus {
		transition: all 0.3s ease;
	}
	
	.input-focus:focus {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
	}
	
	.btn-gradient {
		background: linear-gradient(135deg, #a855f7 0%, #10b981 100%);
		transition: all 0.3s ease;
	}
	
	.btn-gradient:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 25px rgba(168, 85, 247, 0.4);
	}
</style>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-500 hover:scale-[1.02]">
		<h1 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text text-transparent">
			Recuperar Contraseña
		</h1>
		
		<p class="text-gray-600 text-center mb-6">
			Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
		</p>
		
		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}>
			<div class="mb-6">
				<input
					name="email"
					type="email"
					required
					placeholder="Correo electrónico"
					class="input-focus w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 placeholder-gray-400"
				/>
			</div>
			
			<button
				type="submit"
				disabled={loading}
				class="btn-gradient w-full text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
			>
				{loading ? 'Enviando...' : 'Enviar Instrucciones'}
			</button>
			
			{#if form?.success}
				<p class="mt-4 text-center text-sm text-green-600">
					{form.message}
				</p>
			{/if}
			
			{#if form?.error}
				<p class="mt-4 text-center text-sm text-red-500">
					{form.error}
				</p>
			{/if}
		</form>
		
		<div class="mt-6 text-center">
			<a href="/login" class="text-sm text-purple-600 hover:text-purple-800 transition-colors">
				Volver al inicio de sesión
			</a>
		</div>
	</div>
</div>