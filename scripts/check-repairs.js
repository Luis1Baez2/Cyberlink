import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Contar total de reparaciones
    const totalRepairs = await prisma.repair.count();
    console.log(`Total de reparaciones: ${totalRepairs}`);

    // Obtener todas las reparaciones con detalles
    const repairs = await prisma.repair.findMany({
      include: {
        customer: true,
        technician: true
      }
    });

    console.log('\nDetalle de reparaciones:');
    repairs.forEach(repair => {
      const date = new Date(repair.receivedDate).toLocaleDateString('es-AR');
      console.log(`- ${repair.repairNumber}: ${repair.deviceType} - Estado: ${repair.status} - Técnico: ${repair.technician?.name || 'Sin asignar'} - Fecha: ${date}`);
    });

    // Contar por estado
    const statusCounts = await prisma.repair.groupBy({
      by: ['status'],
      _count: true
    });

    console.log('\nReparaciones por estado:');
    statusCounts.forEach(status => {
      console.log(`- ${status.status}: ${status._count}`);
    });

    // Contar por técnico
    const technicianRepairs = await prisma.repair.groupBy({
      by: ['technicianId'],
      _count: true,
      where: {
        technicianId: {
          not: null
        }
      }
    });

    console.log('\nReparaciones por técnico:');
    for (const tech of technicianRepairs) {
      const user = await prisma.user.findUnique({
        where: { id: tech.technicianId }
      });
      console.log(`- ${user?.name}: ${tech._count}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();