import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('=== VERIFICANDO USUARIOS ===');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                role: true
            }
        });
        console.log('Usuarios encontrados:', users);

        console.log('\n=== VERIFICANDO REPARACIONES ===');
        const repairs = await prisma.repair.findMany({
            select: {
                id: true,
                repairNumber: true,
                status: true,
                technicianId: true,
                technician: {
                    select: {
                        name: true
                    }
                },
                customer: {
                    select: {
                        name: true
                    }
                }
            }
        });
        console.log('Reparaciones encontradas:', repairs);

        console.log('\n=== VERIFICANDO CLIENTES ===');
        const customers = await prisma.customer.findMany({
            select: {
                id: true,
                name: true,
                phone: true
            }
        });
        console.log('Clientes encontrados:', customers);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();