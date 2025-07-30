import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Obtener técnicos
    const rodrigo = await prisma.user.findFirst({ where: { name: 'Rodrigo' } });
    const franco = await prisma.user.findFirst({ where: { name: 'Franco' } });
    
    if (!rodrigo || !franco) {
      console.error('No se encontraron los técnicos');
      return;
    }
    
    // Obtener clientes
    const customers = await prisma.customer.findMany();
    if (customers.length < 4) {
      console.error('No hay suficientes clientes');
      return;
    }

    // Crear reparaciones de junio 2025
    const juneRepairs = [
      {
        repairNumber: '000005',
        deviceType: 'Celular',
        brand: 'Samsung',
        model: 'Galaxy S20',
        serialNumber: 'SN005',
        issue: 'Pantalla rota',
        diagnosis: 'Requiere cambio de pantalla',
        status: 'COMPLETED',
        technicianId: rodrigo.id,
        customerId: customers[0].id,
        receivedDate: new Date('2025-06-05'),
        updatedAt: new Date('2025-06-10'),
        deliveryDate: new Date('2025-06-10'),
        laborCost: 15000,
        partsCost: 25000,
        finalCost: 40000
      },
      {
        repairNumber: '000006',
        deviceType: 'Laptop',
        brand: 'HP',
        model: 'Pavilion',
        serialNumber: 'SN006',
        issue: 'No enciende',
        diagnosis: 'Fuente de poder dañada',
        status: 'COMPLETED',
        technicianId: franco.id,
        customerId: customers[1].id,
        receivedDate: new Date('2025-06-10'),
        updatedAt: new Date('2025-06-15'),
        deliveryDate: new Date('2025-06-15'),
        laborCost: 20000,
        partsCost: 35000,
        finalCost: 55000
      },
      {
        repairNumber: '000007',
        deviceType: 'Tablet',
        brand: 'Apple',
        model: 'iPad Air',
        serialNumber: 'SN007',
        issue: 'Batería no carga',
        diagnosis: 'Cambio de batería',
        status: 'COMPLETED',
        technicianId: rodrigo.id,
        customerId: customers[2].id,
        receivedDate: new Date('2025-06-15'),
        updatedAt: new Date('2025-06-18'),
        deliveryDate: new Date('2025-06-18'),
        laborCost: 18000,
        partsCost: 30000,
        finalCost: 48000
      }
    ];

    // Crear reparaciones de mayo 2025
    const mayRepairs = [
      {
        repairNumber: '000008',
        deviceType: 'Notebook',
        brand: 'Lenovo',
        model: 'ThinkPad',
        serialNumber: 'SN008',
        issue: 'Teclado no funciona',
        diagnosis: 'Reemplazo de teclado',
        status: 'COMPLETED',
        technicianId: franco.id,
        customerId: customers[3].id,
        receivedDate: new Date('2025-05-08'),
        updatedAt: new Date('2025-05-12'),
        deliveryDate: new Date('2025-05-12'),
        laborCost: 15000,
        partsCost: 20000,
        finalCost: 35000
      },
      {
        repairNumber: '000009',
        deviceType: 'Celular',
        brand: 'Xiaomi',
        model: 'Redmi Note',
        serialNumber: 'SN009',
        issue: 'Cámara borrosa',
        diagnosis: 'Limpieza y calibración',
        status: 'COMPLETED',
        technicianId: rodrigo.id,
        customerId: customers[0].id,
        receivedDate: new Date('2025-05-20'),
        updatedAt: new Date('2025-05-22'),
        deliveryDate: new Date('2025-05-22'),
        laborCost: 10000,
        partsCost: 0,
        finalCost: 10000
      }
    ];

    // Insertar reparaciones
    for (const repair of [...juneRepairs, ...mayRepairs]) {
      await prisma.repair.create({ data: repair });
      console.log(`Creada reparación ${repair.repairNumber} del ${repair.receivedDate.toLocaleDateString('es-AR')}`);
    }

    console.log('\n✅ Reparaciones históricas agregadas exitosamente');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();