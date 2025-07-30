<script lang="ts">
	import { onMount } from 'svelte';
	
	export let data;
	
	const repair = data.repair;
	
	// Función para formatear fecha
	function formatDate(date: Date | string | null): string {
		if (!date) return 'No especificada';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}
	
	// Función para formatear hora
	function formatTime(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	// Imprimir automáticamente al cargar
	onMount(() => {
		setTimeout(() => {
			window.print();
		}, 500);
	});
</script>

<svelte:head>
	<title>Orden de Reparación - {repair.repairNumber}</title>
	<style>
		/* Resetear estilos globales para la página de impresión */
		:global(*) {
			box-sizing: border-box;
		}
		
		:global(body) {
			margin: 0;
			padding: 0;
			font-family: Arial, sans-serif;
			font-size: 12pt;
			line-height: 1.6;
			color: #000;
			background: #e5e7eb;
		}
		
		/* Estilos para pantalla - simular hoja A4 */
		@media screen {
			.print-container {
				background: #e5e7eb;
				padding: 20px 0;
				min-height: 100vh;
			}
			
			.print-page {
				background: white;
				box-shadow: 0 0 20px rgba(0,0,0,0.1);
				margin: 0 auto 20px;
				width: 210mm;
				min-height: 297mm;
				padding: 15mm 20mm;
				position: relative;
			}
			
			.no-print {
				position: fixed;
				top: 20px;
				right: 20px;
				z-index: 100;
			}
		}
		
		/* Estilos para impresión */
		@media print {
			:global(body) {
				background: white !important;
			}
			
			.print-container {
				background: white !important;
			}
			
			.print-page {
				margin: 0;
				padding: 10mm 15mm;
				box-shadow: none;
				page-break-after: always;
				page-break-inside: avoid;
			}
			
			.print-page:last-child {
				page-break-after: auto;
			}
			
			.no-print {
				display: none !important;
			}
			
			/* Evitar saltos de página en elementos importantes */
			h1, h2, h3, .info-box, .signature-section {
				page-break-inside: avoid;
			}
			
			/* Forzar colores en impresión */
			* {
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
		}
		
		/* Estilos específicos del documento */
		.order-header {
			text-align: center;
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 2px solid #000;
		}
		
		.order-title {
			font-size: 24pt;
			font-weight: bold;
			margin: 0 0 10px 0;
		}
		
		.order-number {
			font-size: 18pt;
			margin: 5px 0;
		}
		
		.copy-type {
			font-size: 14pt;
			color: #555;
			margin-top: 10px;
			font-weight: bold;
		}
		
		.company-info {
			text-align: center;
			margin-bottom: 25px;
		}
		
		.company-name {
			font-size: 16pt;
			font-weight: bold;
			margin: 0;
		}
		
		.info-box {
			border: 1px solid #000;
			padding: 15px;
			margin-bottom: 20px;
			background: #f9f9f9;
		}
		
		.info-box h3 {
			margin: 0 0 10px 0;
			font-size: 14pt;
			text-transform: uppercase;
		}
		
		.info-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}
		
		.info-item {
			margin: 5px 0;
		}
		
		.info-item.full-width {
			grid-column: span 2;
		}
		
		.signature-section {
			margin-top: 60px;
			padding-top: 20px;
		}
		
		.signature-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 50px;
			margin-top: 40px;
		}
		
		.signature-box {
			text-align: center;
		}
		
		.signature-line {
			border-bottom: 1px solid #000;
			height: 50px;
			margin-bottom: 5px;
		}
		
		.terms {
			margin-top: 30px;
			padding-top: 20px;
			border-top: 1px solid #ccc;
			font-size: 10pt;
		}
		
		.terms ul {
			margin: 10px 0;
			padding-left: 20px;
		}
		
		.contact-info {
			background: #f0f0f0;
			padding: 15px;
			margin: 20px 0;
			border-radius: 5px;
		}
	</style>
</svelte:head>

<!-- Botón de imprimir -->
<div class="no-print">
	<button 
		on:click={() => window.print()} 
		class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
		</svg>
		Imprimir Orden
	</button>
</div>

<div class="print-container">
	<!-- Primera página: Copia Taller -->
	<div class="print-page">
		<div class="order-header">
			<h1 class="order-title">ORDEN DE SERVICIO</h1>
			<p class="order-number">#{repair.repairNumber}</p>
			<p class="copy-type">— COPIA TALLER —</p>
		</div>
		
		<div class="company-info">
			<p class="company-name">ProManager</p>
			<p style="margin: 0; font-size: 11pt;">Sistema de Gestión de Reparaciones</p>
		</div>
		
		<div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
			<div><strong>Fecha de recepción:</strong> {formatDate(repair.receivedDate)}</div>
			<div><strong>Hora:</strong> {formatTime(repair.receivedDate)}</div>
		</div>
		
		<div class="info-box">
			<h3>Datos del Cliente</h3>
			<div class="info-grid">
				<div class="info-item"><strong>Nombre:</strong> {repair.customer.name}</div>
				<div class="info-item"><strong>Teléfono:</strong> {repair.customer.phone}</div>
				{#if repair.customer.email}
				<div class="info-item full-width"><strong>Email:</strong> {repair.customer.email}</div>
				{/if}
				{#if repair.customer.address}
				<div class="info-item full-width"><strong>Dirección:</strong> {repair.customer.address}</div>
				{/if}
			</div>
		</div>
		
		<div class="info-box">
			<h3>Datos del Dispositivo</h3>
			<div class="info-grid">
				<div class="info-item"><strong>Tipo:</strong> {repair.deviceType}</div>
				<div class="info-item"><strong>Marca:</strong> {repair.brand}</div>
				<div class="info-item"><strong>Modelo:</strong> {repair.model}</div>
				<div class="info-item"><strong>N° Serie:</strong> {repair.serialNumber || 'N/A'}</div>
			</div>
			<div class="info-item" style="margin-top: 10px;">
				<strong>Problema reportado:</strong>
				<p style="margin: 5px 0;">{repair.issue}</p>
			</div>
		</div>
		
		{#if repair.estimatedCost}
		<div class="info-box">
			<strong>Costo estimado:</strong> ${repair.estimatedCost}
		</div>
		{/if}
		
		{#if repair.estimatedDate}
		<div style="margin: 20px 0;">
			<strong>Fecha estimada de entrega:</strong> {formatDate(repair.estimatedDate)}
		</div>
		{/if}
		
		<div class="signature-section">
			<div class="signature-grid">
				<div class="signature-box">
					<div class="signature-line"></div>
					<p>Firma del Cliente</p>
				</div>
				<div class="signature-box">
					<div class="signature-line"></div>
					<p>Firma del Técnico</p>
				</div>
			</div>
		</div>
		
		<div class="terms">
			<p><strong>Términos y condiciones:</strong></p>
			<ul>
				<li>El diagnóstico puede modificar el presupuesto inicial</li>
				<li>Los equipos no reclamados después de 30 días no serán responsabilidad del taller</li>
				<li>La garantía de reparación es de 30 días</li>
			</ul>
		</div>
	</div>
	
	<!-- Segunda página: Copia Cliente -->
	<div class="print-page">
		<div class="order-header">
			<h1 class="order-title">ORDEN DE SERVICIO</h1>
			<p class="order-number">#{repair.repairNumber}</p>
			<p class="copy-type">— COPIA CLIENTE —</p>
		</div>
		
		<div class="company-info">
			<p class="company-name">ProManager</p>
			<p style="margin: 0; font-size: 11pt;">Sistema de Gestión de Reparaciones</p>
		</div>
		
		<div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
			<div><strong>Fecha de recepción:</strong> {formatDate(repair.receivedDate)}</div>
			<div><strong>Hora:</strong> {formatTime(repair.receivedDate)}</div>
		</div>
		
		<div class="info-box">
			<h3>Datos del Cliente</h3>
			<div class="info-grid">
				<div class="info-item"><strong>Nombre:</strong> {repair.customer.name}</div>
				<div class="info-item"><strong>Teléfono:</strong> {repair.customer.phone}</div>
				{#if repair.customer.email}
				<div class="info-item full-width"><strong>Email:</strong> {repair.customer.email}</div>
				{/if}
				{#if repair.customer.address}
				<div class="info-item full-width"><strong>Dirección:</strong> {repair.customer.address}</div>
				{/if}
			</div>
		</div>
		
		<div class="info-box">
			<h3>Datos del Dispositivo</h3>
			<div class="info-grid">
				<div class="info-item"><strong>Tipo:</strong> {repair.deviceType}</div>
				<div class="info-item"><strong>Marca:</strong> {repair.brand}</div>
				<div class="info-item"><strong>Modelo:</strong> {repair.model}</div>
				<div class="info-item"><strong>N° Serie:</strong> {repair.serialNumber || 'N/A'}</div>
			</div>
			<div class="info-item" style="margin-top: 10px;">
				<strong>Problema reportado:</strong>
				<p style="margin: 5px 0;">{repair.issue}</p>
			</div>
		</div>
		
		{#if repair.estimatedCost}
		<div class="info-box">
			<strong>Costo estimado:</strong> ${repair.estimatedCost}
		</div>
		{/if}
		
		{#if repair.estimatedDate}
		<div style="margin: 20px 0;">
			<strong>Fecha estimada de entrega:</strong> {formatDate(repair.estimatedDate)}
		</div>
		{/if}
		
		<div class="contact-info">
			<h3 style="margin-top: 0;">INFORMACIÓN DE CONTACTO</h3>
			<p>Para consultar el estado de su reparación puede contactarnos a:</p>
			<ul style="list-style: none; padding: 0;">
				<li>• Teléfono: (xxx) xxx-xxxx</li>
				<li>• Email: info@promanager.com</li>
				<li>• Horario: Lunes a Viernes de 9:00 a 18:00</li>
			</ul>
		</div>
		
		<div class="terms">
			<p><strong>Términos y condiciones:</strong></p>
			<ul>
				<li>El diagnóstico puede modificar el presupuesto inicial</li>
				<li>Los equipos no reclamados después de 30 días no serán responsabilidad del taller</li>
				<li>La garantía de reparación es de 30 días</li>
				<li><strong>Conserve este comprobante para retirar su equipo</strong></li>
			</ul>
		</div>
	</div>
</div>