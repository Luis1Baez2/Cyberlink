<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	export let data;
	const repair = data.repair;
	
	// Términos y condiciones - cargar desde localStorage si existen
	let termsAndConditions = [
		'El diagnóstico puede modificar el presupuesto inicial',
		'Equipos no reclamados después de 30 días no serán responsabilidad del taller',
		'Garantía de reparación: 30 días',
		'Conserve este comprobante para retirar su equipo'
	];
	
	// Configuración de impresión
	let printSettings = {
		showLogo: true,
		showDate: true,
		showTerms: true,
		copiesCount: 2
	};
	
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
	
	// Determinar si es recibo de salida
	$: isExitReceipt = repair.status === 'RETIRADO' || repair.status === 'COMPLETED' || repair.status === 'CANCELLED';
	$: receiptTitle = isExitReceipt ? 'RECIBO DE SALIDA' : 'ORDEN DE SERVICIO';
	
	// Imprimir
	onMount(() => {
		// Debug para ver qué datos están llegando
		console.log('Repair data:', repair);
		console.log('Status:', repair.status);
		console.log('Work performed:', repair.workPerformed);
		console.log('Final observations:', repair.finalObservations);
		console.log('Is exit receipt?', isExitReceipt);
		
		// Cargar términos y condiciones desde localStorage
		const savedTerms = localStorage.getItem('termsAndConditions');
		if (savedTerms) {
			try {
				const parsed = JSON.parse(savedTerms);
				// Los términos y condiciones siempre se muestran todos
				if (Array.isArray(parsed) && parsed.length > 0) {
					if (typeof parsed[0] === 'object') {
						// Si vienen como objetos, extraer solo el texto
						termsAndConditions = parsed.map(term => term.text || term);
					} else {
						termsAndConditions = parsed;
					}
				}
			} catch (e) {
				console.error('Error cargando términos y condiciones:', e);
			}
		}
		
		// Cargar configuración de impresión
		const savedPrintSettings = localStorage.getItem('printSettings');
		if (savedPrintSettings) {
			try {
				printSettings = { ...printSettings, ...JSON.parse(savedPrintSettings) };
			} catch (e) {
				console.error('Error cargando configuración de impresión:', e);
			}
		}
		
		setTimeout(() => {
			window.print();
		}, 500);
	});
</script>

<style>
	/* Estilos generales */
	body {
		margin: 0;
		padding: 0;
		font-family: Arial, sans-serif;
		background: white;
		font-size: 14px;
	}
	
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 15px;
	}
	
	.header {
		text-align: center;
		border-bottom: 2px solid #333;
		padding-bottom: 15px;
		margin-bottom: 20px;
	}
	
	.header h1 {
		margin: 0;
		font-size: 20px;
		color: #333;
	}
	
	.header-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	
	.header-left {
		text-align: left;
		font-weight: normal;
		font-size: 18px;
	}
	
	.header-center {
		text-align: center;
		font-weight: bold;
		font-size: 20px;
		flex: 1;
	}
	
	.header-right {
		text-align: right;
		font-weight: normal;
		font-size: 16px;
	}
	
	.section {
		margin-bottom: 15px;
	}
	
	.section-title {
		font-size: 14px;
		font-weight: bold;
		color: #333;
		margin-bottom: 8px;
		border-bottom: 1px solid #ddd;
		padding-bottom: 3px;
	}
	
	.info-row {
		margin-bottom: 5px;
		font-size: 12px;
	}
	
	.info-row strong {
		color: #555;
		display: inline-block;
		width: 130px;
	}
	
	.terms {
		background: #f5f5f5;
		padding: 10px;
		border-radius: 5px;
		margin-top: 15px;
		font-size: 11px;
	}
	
	.terms ul {
		margin: 5px 0;
		padding-left: 15px;
	}
	
	.signature {
		margin-top: 40px;
		text-align: center;
	}
	
	.signature-line {
		display: inline-block;
		width: 300px;
		border-bottom: 1px solid #333;
		margin-bottom: 5px;
	}
	
	.highlight-box {
		background: #f0f0f0;
		border: 2px solid #333;
		padding: 8px;
		text-align: center;
		font-weight: bold;
		margin: 15px 0;
		font-size: 14px;
	}
	
	.page-break {
		page-break-before: always;
		margin-top: 0;
	}
	
	.cancelled-stamp {
		color: #dc3545;
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		margin: 20px 0;
		border: 3px solid #dc3545;
		padding: 10px;
		transform: rotate(-5deg);
	}
	
	.exit-info {
		background: #e8f4f8;
		padding: 10px;
		border-radius: 5px;
		margin: 15px 0;
	}
	
	.cost-section {
		background: #f8f9fa;
		padding: 10px;
		border-radius: 5px;
		margin: 15px 0;
		border: 1px solid #dee2e6;
	}
	
	.total-cost {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		text-align: right;
		margin-top: 10px;
		padding-top: 10px;
		border-top: 2px solid #333;
	}
	
	/* CSS para impresión */
	@media print {
		/* Configuración de página para ocultar URL y otros elementos del navegador */
		@page {
			size: A4;
			margin: 10mm;
		}
		
		/* Intentar ocultar encabezados y pies del navegador */
		@page :first {
			margin-top: 10mm;
		}
		
		.no-print {
			display: none !important;
		}
		
		.container {
			padding: 0;
			max-width: 100%;
		}
		
		.page-break {
			page-break-before: always;
		}
		
		/* Asegurar que el contenido use todo el espacio */
		body {
			margin: 0 !important;
			padding: 0 !important;
		}
	}
	
</style>

<!-- PRIMER RECIBO: ORIGINAL EMPRESA (INGRESO) - Siempre se imprime primero cuando es ingreso -->
{#if !isExitReceipt}
<div class="container">
	<div class="header">
		<div class="header-line">
			<span class="header-left">Cyberlink</span>
			<span class="header-center">ORDEN DE SERVICIO #{repair.repairNumber}</span>
			<span class="header-right">Tel: 376438205</span>
		</div>
		<p style="margin: 5px 0; color: #666;">ORIGINAL EMPRESA</p>
	</div>
	
	{#if repair.status === 'CANCELLED'}
		<div class="cancelled-stamp">
			NO REPARADO - ORDEN CANCELADA
		</div>
	{/if}
	
	<!-- Información del Cliente -->
	<div class="section">
		<h2 class="section-title">Información del Cliente</h2>
		<div class="info-row">
			<strong>Cliente:</strong> {repair.customer.name}
		</div>
		<div class="info-row">
			<strong>Teléfono:</strong> {repair.customer.phone}
		</div>
		<div class="info-row">
			<strong>Fecha de recepción:</strong> {formatDate(repair.receivedDate)}
		</div>
		{#if printSettings.showDate}
		<div class="info-row">
			<strong>Fecha de impresión:</strong> {formatDate(new Date())}
		</div>
		{/if}
	</div>
	
	<!-- Información del Equipo -->
	<div class="section">
		<h2 class="section-title">Información del Equipo</h2>
		<div class="info-row">
			<strong>Tipo de equipo:</strong> {repair.deviceType}
		</div>
		<div class="info-row">
			<strong>Marca:</strong> {repair.brand}
		</div>
		<div class="info-row">
			<strong>Modelo:</strong> {repair.model}
		</div>
		<div class="info-row">
			<strong>Número de serie:</strong> {repair.serialNumber || 'N/A'}
		</div>
	</div>
	
	<!-- Problema Reportado -->
	<div class="section">
		<h2 class="section-title">Problema Reportado</h2>
		<p>{repair.issue}</p>
	</div>
	
	{#if isExitReceipt}
		<!-- Información adicional para recibo de salida -->
		<div class="exit-info">
			<h2 class="section-title">Información de Salida</h2>
			
			{#if repair.status === 'COMPLETED' || repair.status === 'RETIRADO'}
				{#if repair.workPerformed}
					<div class="info-row">
						<strong>Trabajo realizado:</strong>
					</div>
					<p style="margin-left: 20px;">{repair.workPerformed}</p>
				{:else}
					<div class="info-row" style="color: #666; font-style: italic;">
						<strong>Trabajo realizado:</strong> No especificado
					</div>
				{/if}
				
				{#if repair.finalObservations}
					<div class="info-row" style="margin-top: 10px;">
						<strong>Observaciones:</strong>
					</div>
					<p style="margin-left: 20px;">{repair.finalObservations}</p>
				{/if}
			{/if}
			
			{#if repair.status === 'CANCELLED'}
				<div class="info-row">
					<strong>Motivo de cancelación:</strong>
				</div>
				<p style="margin-left: 20px; color: #dc3545;">{repair.cancellationReason || 'No especificado'}</p>
				
				{#if repair.finalObservations}
					<div class="info-row" style="margin-top: 10px;">
						<strong>Observaciones:</strong>
					</div>
					<p style="margin-left: 20px;">{repair.finalObservations}</p>
				{/if}
			{/if}
			
			<div class="info-row" style="margin-top: 15px;">
				<strong>Fecha de salida:</strong> {formatDate(new Date())}
			</div>
		</div>
		
		<!-- Costos para recibo de salida -->
		<div class="cost-section">
			<h2 class="section-title">Detalle de Costos</h2>
			<div class="info-row">
				<strong>Mano de obra:</strong> ${repair.laborCost || 0}
			</div>
			<div class="info-row">
				<strong>Repuestos:</strong> ${repair.partsCost || 0}
			</div>
			{#if repair.partsDescription}
				<div class="info-row">
					<strong>Descripción repuestos:</strong> {repair.partsDescription}
				</div>
			{/if}
			<div class="total-cost">
				TOTAL A PAGAR: ${(repair.laborCost || 0) + (repair.partsCost || 0)}
			</div>
		</div>
	{:else}
		<!-- Términos y condiciones para orden de servicio -->
		{#if printSettings.showTerms && termsAndConditions.length > 0}
		<div class="terms">
			<strong>Términos y Condiciones:</strong>
			<ul>
				{#each termsAndConditions as term}
					{#if term.trim()}
						<li>{term}</li>
					{/if}
				{/each}
			</ul>
		</div>
		{/if}
	{/if}
	
	<!-- Firma -->
	<div class="signature">
		<div class="signature-line"></div>
		<p>Firma del Cliente</p>
	</div>
</div>

{#if printSettings.copiesCount > 1}
<!-- SEGUNDO RECIBO: COPIA CLIENTE (INGRESO) -->
<div class="container page-break">
	<div class="header">
		<div class="header-line">
			<span class="header-left">Cyberlink</span>
			<span class="header-center">ORDEN DE SERVICIO #{repair.repairNumber}</span>
			<span class="header-right">Tel: 376438205</span>
		</div>
		<p style="margin: 5px 0; color: #666;">COPIA CLIENTE</p>
	</div>
	
	{#if repair.status === 'CANCELLED'}
		<div class="cancelled-stamp">
			NO REPARADO - ORDEN CANCELADA
		</div>
	{/if}
	
	<!-- Información del Cliente -->
	<div class="section">
		<h2 class="section-title">Información del Cliente</h2>
		<div class="info-row">
			<strong>Cliente:</strong> {repair.customer.name}
		</div>
		<div class="info-row">
			<strong>Teléfono:</strong> {repair.customer.phone}
		</div>
		<div class="info-row">
			<strong>Fecha de recepción:</strong> {formatDate(repair.receivedDate)}
		</div>
		{#if printSettings.showDate}
		<div class="info-row">
			<strong>Fecha de impresión:</strong> {formatDate(new Date())}
		</div>
		{/if}
	</div>
	
	<!-- Información del Equipo -->
	<div class="section">
		<h2 class="section-title">Información del Equipo</h2>
		<div class="info-row">
			<strong>Tipo de equipo:</strong> {repair.deviceType}
		</div>
		<div class="info-row">
			<strong>Marca:</strong> {repair.brand}
		</div>
		<div class="info-row">
			<strong>Modelo:</strong> {repair.model}
		</div>
		<div class="info-row">
			<strong>Número de serie:</strong> {repair.serialNumber || 'N/A'}
		</div>
	</div>
	
	<!-- Problema Reportado -->
	<div class="section">
		<h2 class="section-title">Problema Reportado</h2>
		<p>{repair.issue}</p>
	</div>
	
	<!-- Términos y condiciones para orden de servicio -->
	{#if printSettings.showTerms && termsAndConditions.length > 0}
	<div class="terms">
		<strong>Términos y Condiciones:</strong>
		<ul>
			{#each termsAndConditions as term}
				{#if term.trim()}
					<li>{term}</li>
				{/if}
			{/each}
		</ul>
	</div>
	{/if}
	
	<!-- Firma -->
	<div class="signature">
		<div class="signature-line"></div>
		<p>Firma del Cliente</p>
	</div>
</div>
{/if}
{/if}

<!-- TERCER RECIBO: RECIBO DE SALIDA (Solo cuando el equipo está terminado/retirado) -->
{#if isExitReceipt}
<div class="container">
	<div class="header">
		<div class="header-line">
			<span class="header-left">Cyberlink</span>
			<span class="header-center">RECIBO DE SALIDA #{repair.repairNumber}</span>
			<span class="header-right">Tel: 376438205</span>
		</div>
		<p style="margin: 5px 0; color: #666;">ORIGINAL</p>
	</div>
	
	{#if repair.status === 'CANCELLED'}
		<div class="cancelled-stamp">
			NO REPARADO - ORDEN CANCELADA
		</div>
	{/if}
	
	<!-- Información del Cliente -->
	<div class="section">
		<h2 class="section-title">Información del Cliente</h2>
		<div class="info-row">
			<strong>Cliente:</strong> {repair.customer.name}
		</div>
		<div class="info-row">
			<strong>Teléfono:</strong> {repair.customer.phone}
		</div>
		<div class="info-row">
			<strong>Fecha de recepción:</strong> {formatDate(repair.receivedDate)}
		</div>
		{#if printSettings.showDate}
		<div class="info-row">
			<strong>Fecha de impresión:</strong> {formatDate(new Date())}
		</div>
		{/if}
	</div>
	
	<!-- Información del Equipo -->
	<div class="section">
		<h2 class="section-title">Información del Equipo</h2>
		<div class="info-row">
			<strong>Tipo de equipo:</strong> {repair.deviceType}
		</div>
		<div class="info-row">
			<strong>Marca:</strong> {repair.brand}
		</div>
		<div class="info-row">
			<strong>Modelo:</strong> {repair.model}
		</div>
		<div class="info-row">
			<strong>Número de serie:</strong> {repair.serialNumber || 'N/A'}
		</div>
	</div>
	
	<!-- Problema Reportado -->
	<div class="section">
		<h2 class="section-title">Problema Reportado</h2>
		<p>{repair.issue}</p>
	</div>
	
	<!-- Información de salida -->
	<div class="exit-info">
		<h2 class="section-title">Información de Salida</h2>
		
		{#if repair.status === 'COMPLETED' || repair.status === 'RETIRADO'}
			{#if repair.workPerformed}
				<div class="info-row">
					<strong>Trabajo realizado:</strong>
				</div>
				<p style="margin-left: 20px;">{repair.workPerformed}</p>
			{:else}
				<div class="info-row" style="color: #666; font-style: italic;">
					<strong>Trabajo realizado:</strong> No especificado
				</div>
			{/if}
			
			{#if repair.finalObservations}
				<div class="info-row" style="margin-top: 10px;">
					<strong>Observaciones:</strong>
				</div>
				<p style="margin-left: 20px;">{repair.finalObservations}</p>
			{/if}
		{/if}
		
		{#if repair.status === 'CANCELLED'}
			<div class="info-row">
				<strong>Motivo de cancelación:</strong>
			</div>
			<p style="margin-left: 20px; color: #dc3545;">{repair.cancellationReason || 'No especificado'}</p>
			
			{#if repair.finalObservations}
				<div class="info-row" style="margin-top: 10px;">
					<strong>Observaciones:</strong>
				</div>
				<p style="margin-left: 20px;">{repair.finalObservations}</p>
			{/if}
		{/if}
		
		<div class="info-row" style="margin-top: 15px;">
			<strong>Fecha de salida:</strong> {formatDate(new Date())}
		</div>
	</div>
	
	<!-- Costos -->
	<div class="cost-section">
		<h2 class="section-title">Detalle de Costos</h2>
		<div class="info-row">
			<strong>Mano de obra:</strong> ${repair.laborCost || 0}
		</div>
		<div class="info-row">
			<strong>Repuestos:</strong> ${repair.partsCost || 0}
		</div>
		{#if repair.partsDescription}
			<div class="info-row">
				<strong>Descripción repuestos:</strong> {repair.partsDescription}
			</div>
		{/if}
		<div class="total-cost">
			TOTAL A PAGAR: ${(repair.laborCost || 0) + (repair.partsCost || 0)}
		</div>
	</div>
	
	<div class="highlight-box" style="margin-top: 30px;">
		EQUIPO RETIRADO - SERVICIO FINALIZADO
	</div>
	
	<!-- Firma -->
	<div class="signature">
		<div class="signature-line"></div>
		<p>Firma del Cliente</p>
	</div>
</div>
{/if}