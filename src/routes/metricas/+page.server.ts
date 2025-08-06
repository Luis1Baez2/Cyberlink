import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Verificar autenticación
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Solo admin, dueño y técnicos pueden ver métricas
	if (!['ADMIN', 'TECHNICIAN'].includes(locals.user.role) && locals.user.username !== 'dueño') {
		throw redirect(302, '/');
	}

	// Obtener mes y año de los parámetros de URL o usar el actual
	const now = new Date();
	const selectedMonth = parseInt(url.searchParams.get('month') || String(now.getMonth() + 1));
	const selectedYear = parseInt(url.searchParams.get('year') || String(now.getFullYear()));
	
	// Crear fechas para el periodo seleccionado
	const periodStart = new Date(selectedYear, selectedMonth - 1, 1);
	const periodEnd = new Date(selectedYear, selectedMonth, 0);
	const today = new Date();
	
	// Verificar si estamos viendo el mes actual
	const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear();
	
	// Calcular días trabajados en el periodo (lunes a sábado)
	let workDaysInPeriod = 0;
	let workDaysElapsed = 0;
	
	for (let d = new Date(periodStart); d <= periodEnd; d.setDate(d.getDate() + 1)) {
		const dayOfWeek = d.getDay();
		if (dayOfWeek >= 1 && dayOfWeek <= 6) { // Lunes a Sábado
			workDaysInPeriod++;
			if (isCurrentMonth && d <= today) {
				workDaysElapsed++;
			} else if (!isCurrentMonth) {
				workDaysElapsed = workDaysInPeriod; // Si es mes pasado, todos los días están transcurridos
			}
		}
	}

	// Función para calcular evaluación ajustada al tiempo transcurrido
	const getAdjustedEvaluation = (completed: number, monthlyGoal: number, daysElapsed: number, totalDays: number) => {
		// Calcular meta esperada según días transcurridos
		const expectedGoal = (monthlyGoal / totalDays) * daysElapsed;
		const adjustedPercentage = expectedGoal > 0 ? (completed / expectedGoal) * 100 : 0;
		
		if (adjustedPercentage < 40) return { label: 'Pésimo', color: 'red', emoji: '😰', percentage: adjustedPercentage };
		if (adjustedPercentage < 60) return { label: 'Malo', color: 'orange', emoji: '😟', percentage: adjustedPercentage };
		if (adjustedPercentage < 80) return { label: 'Regular', color: 'yellow', emoji: '😐', percentage: adjustedPercentage };
		if (adjustedPercentage < 100) return { label: 'Bueno', color: 'green', emoji: '😊', percentage: adjustedPercentage };
		return { label: 'Excelente', color: 'purple', emoji: '🌟', percentage: adjustedPercentage };
	};

	// Función para calcular estado de alerta
	const getAlertStatus = (adjustedPercentage: number, daysLeft: number) => {
		if (adjustedPercentage >= 80) return { status: 'on-track', color: 'green', message: 'En camino a cumplir la meta' };
		if (adjustedPercentage >= 50) return { status: 'warning', color: 'yellow', message: 'Necesita mejorar el ritmo' };
		if (daysLeft <= 5 && adjustedPercentage < 50) return { status: 'urgent', color: 'red', message: '¡Urgente! Pocos días para cumplir' };
		return { status: 'critical', color: 'red', message: 'Muy por debajo de la meta' };
	};

	try {
		// Si es técnico, mostrar sus métricas personales con datos reales
		if (locals.user.role === 'TECHNICIAN') {
			// Obtener información del técnico
			const technician = await db.usuario.findUnique({
				where: { id: locals.user.id },
				select: { turnoTrabajo: true, nombre: true }
			});

			const isHalfTime = technician?.turnoTrabajo === 'MEDIO_TIEMPO';

			// Metas ajustadas según tipo de turno
			const monthlyGoal = isHalfTime ? 50 : 100;
			const weeklyGoal = isHalfTime ? 12.5 : 25;
			const dailyGoal = isHalfTime ? 2.08 : 4.17;
			const monthlyRevenueGoal = isHalfTime ? 1000000 : 2000000;

			// Obtener reparaciones reales del técnico para el periodo
			const technicianRepairs = await db.reparacion.findMany({
				where: { 
					tecnicoId: locals.user.id,
					fechaRecibido: {
						gte: periodStart,
						lte: periodEnd
					}
				}
			});

			// Calcular métricas del periodo
			const periodCompleted = technicianRepairs.filter(r => 
				r.estado === 'COMPLETADO' || r.estado === 'ENTREGADO'
			).length;

			// Calcular ingresos del periodo (solo mano de obra)
			const periodRevenue = technicianRepairs.reduce((sum, r) => 
				sum + (r.costoManoObra || 0), 0
			);

			// Calcular métricas de la semana actual (solo si es mes actual)
			let currentWeekCompleted = 0;
			if (isCurrentMonth) {
				const weekStart = new Date();
				weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lunes
				const currentWeekRepairs = technicianRepairs.filter(r => {
					const repairDate = new Date(r.fechaRecibido);
					return repairDate >= weekStart;
				});
				currentWeekCompleted = currentWeekRepairs.filter(r => 
					r.estado === 'COMPLETADO' || r.estado === 'ENTREGADO'
				).length;
			}

			// Calcular métricas del día (solo si es mes actual)
			let todayCompleted = 0;
			if (isCurrentMonth) {
				const todayStart = new Date();
				todayStart.setHours(0, 0, 0, 0);
				const todayRepairs = technicianRepairs.filter(r => {
					const repairDate = new Date(r.fechaRecibido);
					return repairDate >= todayStart;
				});
				todayCompleted = todayRepairs.filter(r => 
					r.estado === 'COMPLETADO' || r.estado === 'ENTREGADO'
				).length;
			}

			// Calcular progreso actual
			const currentProgress = {
				daily: todayCompleted,
				weekly: currentWeekCompleted,
				monthly: periodCompleted,
				revenue: periodRevenue
			};

			// Calcular porcentajes (ajustados al tiempo para el mensual)
			const expectedMonthlyGoal = (monthlyGoal / workDaysInPeriod) * workDaysElapsed;
			const percentages = {
				daily: (currentProgress.daily / dailyGoal) * 100,
				weekly: (currentProgress.weekly / weeklyGoal) * 100,
				monthly: expectedMonthlyGoal > 0 ? (currentProgress.monthly / expectedMonthlyGoal) * 100 : 0
			};

			// Días restantes del mes
			const daysLeft = workDaysInPeriod - workDaysElapsed;

			// Evaluación ajustada
			const evaluation = getAdjustedEvaluation(periodCompleted, monthlyGoal, workDaysElapsed, workDaysInPeriod);

			// Obtener estadísticas de equipos por categoría para el técnico
			const technicianDeviceStats = await db.reparacion.groupBy({
				by: ['tipoDispositivo'],
				where: {
					tecnicoId: locals.user.id,
					fechaRecibido: {
						gte: periodStart,
						lte: periodEnd
					}
				},
				_count: {
					tipoDispositivo: true
				}
			});

			// Formatear estadísticas de dispositivos
			const deviceCategories = technicianDeviceStats.map(stat => ({
				type: stat.tipoDispositivo,
				count: stat._count.tipoDispositivo,
				percentage: technicianRepairs.length > 0 ? (stat._count.tipoDispositivo / technicianRepairs.length) * 100 : 0
			})).sort((a, b) => b.count - a.count);

			return {
				user: locals.user,
				isTechnician: true,
				// Periodo
				selectedMonth,
				selectedYear,
				isCurrentMonth,
				// Metas
				monthlyGoal,
				weeklyGoal,
				dailyGoal,
				monthlyRevenueGoal,
				// Progreso actual
				currentProgress,
				percentages,
				// Meta esperada para el periodo
				expectedMonthlyGoal,
				// Información temporal
				workDaysInPeriod,
				workDaysElapsed,
				daysLeft,
				isHalfTime,
				technicianName: technician?.nombre || locals.user.username,
				// Evaluación y alertas
				evaluation,
				alertStatus: getAlertStatus(evaluation.percentage, daysLeft),
				// Totales
				totalRepairs: technicianRepairs.length,
				activeRepairs: technicianRepairs.filter(r => 
					!['COMPLETADO', 'ENTREGADO', 'CANCELADO'].includes(r.estado)
				).length,
				// Categorías de equipos
				deviceCategories
			};
		}

		// Para admin/dueño - vista general con datos reales
		const technicians = await db.usuario.findMany({
			where: { rol: 'TECNICO' },
			include: {
				reparacionesAsignadas: {
					where: {
						fechaRecibido: {
							gte: periodStart,
							lte: periodEnd
						}
					},
					select: {
						id: true,
						estado: true,
						fechaRecibido: true,
						fechaEntrega: true,
						costoManoObra: true
					}
				}
			}
		});

		const technicianStats = await Promise.all(technicians.map(async (tech) => {
			const isHalfTime = tech.turnoTrabajo === 'MEDIO_TIEMPO';
			const monthlyGoal = isHalfTime ? 50 : 100;
			const weeklyGoal = isHalfTime ? 12.5 : 25;
			const dailyGoal = isHalfTime ? 2.08 : 4.17;
			
			const completed = tech.reparacionesAsignadas.filter(r => 
				r.estado === 'COMPLETADO' || r.estado === 'ENTREGADO'
			).length;

			// Evaluación ajustada al tiempo
			const evaluation = getAdjustedEvaluation(completed, monthlyGoal, workDaysElapsed, workDaysInPeriod);
			
			// Calcular tiempo promedio de reparación
			const completedWithTime = tech.reparacionesAsignadas.filter(r => 
				(r.estado === 'COMPLETADO' || r.estado === 'ENTREGADO') && r.fechaEntrega
			);

			let avgRepairTime = 0;
			if (completedWithTime.length > 0) {
				const totalTime = completedWithTime.reduce((sum, r) => {
					const start = new Date(r.fechaRecibido);
					const end = new Date(r.fechaEntrega!);
					const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
					return sum + days;
				}, 0);
				avgRepairTime = totalTime / completedWithTime.length;
			}

			// Calcular ingresos totales
			const revenue = tech.reparacionesAsignadas.reduce((sum, r) => sum + (r.costoManoObra || 0), 0);
			
			return {
				id: tech.id,
				name: tech.nombre,
				workShift: tech.turnoTrabajo || 'TIEMPO_COMPLETO',
				monthlyGoal,
				weeklyGoal,
				dailyGoal,
				completed,
				expectedCompleted: (monthlyGoal / workDaysInPeriod) * workDaysElapsed,
				percentage: evaluation.percentage,
				isHalfTime,
				evaluation,
				avgRepairTime,
				revenue,
				// Para rankings - basado en porcentaje ajustado
				rankingScore: evaluation.percentage,
				totalRepairs: tech.reparacionesAsignadas.length,
				activeRepairs: tech.reparacionesAsignadas.filter(r => 
					!['COMPLETADO', 'ENTREGADO', 'CANCELADO'].includes(r.estado)
				).length
			};
		}));

		// Ordenar para rankings
		const rankings = {
			byCompleted: [...technicianStats].sort((a, b) => b.completed - a.completed),
			byPercentage: [...technicianStats].sort((a, b) => b.percentage - a.percentage),
			byRevenue: [...technicianStats].sort((a, b) => b.revenue - a.revenue),
			overall: [...technicianStats].sort((a, b) => b.rankingScore - a.rankingScore)
		};

		// Estadísticas generales del periodo
		const allRepairs = await db.reparacion.count({
			where: {
				fechaRecibido: {
					gte: periodStart,
					lte: periodEnd
				}
			}
		});
		
		const activeRepairs = await db.reparacion.count({
			where: {
				fechaRecibido: {
					gte: periodStart,
					lte: periodEnd
				},
				estado: {
					notIn: ['COMPLETADO', 'ENTREGADO', 'CANCELADO']
				}
			}
		});

		// Obtener estadísticas de equipos por categoría
		const deviceStats = await db.reparacion.groupBy({
			by: ['tipoDispositivo'],
			where: {
				fechaRecibido: {
					gte: periodStart,
					lte: periodEnd
				}
			},
			_count: {
				tipoDispositivo: true
			}
		});

		// Formatear estadísticas de dispositivos
		const deviceCategories = deviceStats.map(stat => ({
			type: stat.tipoDispositivo,
			count: stat._count.tipoDispositivo,
			percentage: (stat._count.tipoDispositivo / allRepairs) * 100
		})).sort((a, b) => b.count - a.count);

		// Obtener años disponibles para el selector
		const oldestRepair = await db.reparacion.findFirst({
			orderBy: { fechaRecibido: 'asc' },
			select: { fechaRecibido: true }
		});
		
		const availableYears = [];
		const startYear = oldestRepair ? new Date(oldestRepair.fechaRecibido).getFullYear() : now.getFullYear();
		for (let year = startYear; year <= now.getFullYear(); year++) {
			availableYears.push(year);
		}

		return {
			user: locals.user,
			isTechnician: false,
			// Periodo
			selectedMonth,
			selectedYear,
			isCurrentMonth,
			availableYears,
			// Datos
			technicianStats,
			rankings,
			workDaysElapsed,
			workDaysInPeriod,
			daysLeft: workDaysInPeriod - workDaysElapsed,
			totalRepairs: allRepairs,
			activeRepairs,
			deviceCategories
		};

	} catch (error) {
		console.error('Error cargando métricas:', error);
		// Si hay error, devolver datos básicos
		return {
			user: locals.user,
			isTechnician: locals.user.role === 'TECHNICIAN',
			error: 'Error al cargar métricas',
			selectedMonth: now.getMonth() + 1,
			selectedYear: now.getFullYear(),
			isCurrentMonth: true,
			workDaysElapsed: 0,
			workDaysInPeriod: 24,
			daysLeft: 24
		};
	}
};