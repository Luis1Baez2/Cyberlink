import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      workShift: true,
      createdAt: true
    }
  });

  console.log('\n=== USUARIOS EN EL SISTEMA ===\n');
  users.forEach(user => {
    console.log(`Nombre: ${user.name}`);
    console.log(`Usuario: ${user.username}`);
    console.log(`Rol: ${user.role}`);
    console.log(`Turno: ${user.workShift || 'FULL_TIME'}`);
    console.log(`Creado: ${user.createdAt.toLocaleDateString()}`);
    console.log('---');
  });
  console.log(`\nTotal de usuarios: ${users.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });