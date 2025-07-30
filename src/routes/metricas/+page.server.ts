import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

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
			const technician = await prisma.user.findUnique({
				where: { id: locals.user.id },
				select: { workShift: true, name: true }
			});

			const isHalfTime = technician?.workShift === 'HALF_TIME';

			// Metas ajustadas según tipo de turno
			const monthlyGoal = isHalfTime ? 50 : 100;
			const weeklyGoal = isHalfTime ? 12.5 : 25;
			const dailyGoal = isHalfTime ? 2.08 : 4.17;
			const monthlyRevenueGoal = isHalfTime ? 1000000 : 2000000;

			// Obtener reparaciones reales del técnico para el periodo
			const technicianRepairs = await prisma.repair.findMany({
				where: { 
					technicianId: locals.user.id,
					receivedDate: {
						gte: periodStart,
						lte: periodEnd
					}
				}
			});

			// Calcular métricas del periodo
			const periodCompleted = technicianRepairs.filter(r => 
				r.status === 'COMPLETED' || r.status === 'DELIVERED'
			).length;

			// Calcular ingresos del periodo (solo mano de obra)
			const periodRevenue = technicianRepairs.reduce((sum, r) => 
				sum + (r.laborCost || 0), 0
			);

			// Calcular métricas de la semana actual (solo si es mes actual)
			let currentWeekCompleted = 0;
			if (isCurrentMonth) {
				const weekStart = new Date();
				weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lunes
				const currentWeekRepairs = technicianRepairs.filter(r => {
					const repairDate = new Date(r.receivedDate);
					return repairDate >= weekStart;
				});
				currentWeekCompleted = currentWeekRepairs.filter(r => 
					r.status === 'COMPLETED' || r.status === 'DELIVERED'
				).length;
			}

			// Calcular métricas del día (solo si es mes actual)
			let todayCompleted = 0;
			if (isCurrentMonth) {
				const todayStart = new Date();
				todayStart.setHours(0, 0, 0, 0);
				const todayRepairs = technicianRepairs.filter(r => {
					const repairDate = new Date(r.receivedDate);
					return repairDate >= todayStart;
				});
				todayCompleted = todayRepairs.filter(r => 
					r.status === 'COMPLETED' || r.status === 'DELIVERED'
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
				technicianName: technician?.name || locals.user.username,
				// Evaluación y alertas
				evaluation,
				alertStatus: getAlertStatus(evaluation.percentage, daysLeft),
				// Totales
				totalRepairs: technicianRepairs.length,
				activeRepairs: technicianRepairs.filter(r => 
					!['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(r.status)
				).length
			};
		}

		// Para admin/dueño - vista general con datos reales
		const technicians = await prisma.user.findMany({
			where: { role: 'TECHNICIAN' },
			include: {
				repairOrders: {
					where: {
						receivedDate: {
							gte: periodStart,
							lte: periodEnd
						}
					},
					select: {
						id: true,
						status: true,
						receivedDate: true,
						deliveryDate: true,
						laborCost: true
					}
				}
			}
		});

		const technicianStats = await Promise.all(technicians.map(async (tech) => {
			const isHalfTime = tech.workShift === 'HALF_TIME';
			const monthlyGoal = isHalfTime ? 50 : 100;
			const weeklyGoal = isHalfTime ? 12.5 : 25;
			const dailyGoal = isHalfTime ? 2.08 : 4.17;
			
			const completed = tech.repairOrders.filter(r => 
				r.status === 'COMPLETED' || r.status === 'DELIVERED'
			).length;

			// Evaluación ajustada al tiempo
			const evaluation = getAdjustedEvaluation(completed, monthlyGoal, workDaysElapsed, workDaysInPeriod);
			
			// Calcular tiempo promedio de reparación
			const completedWithTime = tech.repairOrders.filter(r => 
				(r.status === 'COMPLETED' || r.status === 'DELIVERED') && r.deliveryDate
			);

			let avgRepairTime = 0;
			if (completedWithTime.length > 0) {
				const totalTime = completedWithTime.reduce((sum, r) => {
					const start = new Date(r.receivedDate);
					const end = new Date(r.deliveryDate!);
					const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
					return sum + days;
				}, 0);
				avgRepairTime = totalTime / completedWithTime.length;
			}

			// Calcular ingresos totales
			const revenue = tech.repairOrders.reduce((sum, r) => sum + (r.laborCost || 0), 0);
			
			return {
				id: tech.id,
				name: tech.name,
				workShift: tech.workShift || 'FULL_TIME',
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
				totalRepairs: tech.repairOrders.length,
				activeRepairs: tech.repairOrders.filter(r => 
					!['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(r.status)
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
		const allRepairs = await prisma.repair.count({
			where: {
				receivedDate: {
					gte: periodStart,
					lte: periodEnd
				}
			}
		});
		
		const activeRepairs = await prisma.repair.count({
			where: {
				receivedDate: {
					gte: periodStart,
					lte: periodEnd
				},
				status: {
					notIn: ['COMPLETED', 'DELIVERED', 'CANCELLED']
				}
			}
		});

		// Obtener estadísticas de equipos por categoría
		const deviceStats = await prisma.repair.groupBy({
			by: ['deviceType'],
			where: {
				receivedDate: {
					gte: periodStart,
					lte: periodEnd
				}
			},
			_count: {
				deviceType: true
			}
		});

		// Formatear estadísticas de dispositivos
		const deviceCategories = deviceStats.map(stat => ({
			type: stat.deviceType,
			count: stat._count.deviceType,
			percentage: (stat._count.deviceType / allRepairs) * 100
		})).sort((a, b) => b.count - a.count);

		// Obtener años disponibles para el selector
		const oldestRepair = await prisma.repair.findFirst({
			orderBy: { receivedDate: 'asc' },
			select: { receivedDate: true }
		});
		
		const availableYears = [];
		const startYear = oldestRepair ? new Date(oldestRepair.receivedDate).getFullYear() : now.getFullYear();
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