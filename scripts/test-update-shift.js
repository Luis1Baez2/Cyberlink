import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Buscar a Juan
  const juan = await prisma.user.findFirst({
    where: { name: 'Juan' }
  });

  if (!juan) {
    console.log('No se encontró el usuario Juan');
    return;
  }

  console.log('Estado actual de Juan:', {
    name: juan.name,
    role: juan.role,
    workShift: juan.workShift
  });

  // Actualizar a medio turno
  const updated = await prisma.user.update({
    where: { id: juan.id },
    data: { workShift: 'HALF_TIME' }
  });

  console.log('\nEstado actualizado de Juan:', {
    name: updated.name,
    role: updated.role,
    workShift: updated.workShift
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });