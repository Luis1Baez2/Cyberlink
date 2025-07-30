import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const customers = await prisma.customer.findMany();
    console.log('Clientes encontrados:', customers.length);
    customers.forEach(c => {
      console.log(`- ${c.name} (ID: ${c.id})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();