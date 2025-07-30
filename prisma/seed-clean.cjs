const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Creando usuarios básicos...')

  // Crear usuario dueño
  const dueñoUser = await prisma.user.create({
    data: {
      username: 'dueño',
      password: await bcrypt.hash('admin123', 10),
      name: 'Dueño',
      role: 'ADMIN',
      recoveryEmail: 'dueno@promanager.com'
    }
  })
  console.log('👑 Usuario dueño creado:', { username: dueñoUser.username })

  // Crear usuario admin
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: 'Administrador',
      role: 'ADMIN',
      recoveryEmail: 'admin@promanager.com'
    }
  })
  console.log('🛡️ Usuario admin creado:', { username: adminUser.username })

  console.log('✅ Base de datos lista para usar')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })