import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando categorías...');

  try {
    // Crear categorías principales con sus subcategorías
    const hardware = await prisma.categoria.create({
      data: {
        nombre: 'Hardware',
        descripcion: 'Componentes físicos',
        hijos: {
          create: [
            { nombre: 'Procesadores', descripcion: 'CPUs Intel y AMD' },
            { nombre: 'Memorias RAM', descripcion: 'Módulos de memoria' },
            { nombre: 'Discos', descripcion: 'HDD y SSD' },
            { nombre: 'Placas Madre', descripcion: 'Motherboards' },
            { nombre: 'Fuentes', descripcion: 'Fuentes de poder' },
            { nombre: 'Gabinetes', descripcion: 'Cases y chasis' }
          ]
        }
      }
    });

    const perifericos = await prisma.categoria.create({
      data: {
        nombre: 'Periféricos',
        descripcion: 'Dispositivos externos',
        hijos: {
          create: [
            { nombre: 'Teclados', descripcion: 'Teclados mecánicos y de membrana' },
            { nombre: 'Mouse', descripcion: 'Mouse gaming y oficina' },
            { nombre: 'Monitores', descripcion: 'Pantallas y displays' },
            { nombre: 'Auriculares', descripcion: 'Headsets y auriculares' },
            { nombre: 'Webcams', descripcion: 'Cámaras web' },
            { nombre: 'Impresoras', descripcion: 'Impresoras y scanners' }
          ]
        }
      }
    });

    const accesorios = await prisma.categoria.create({
      data: {
        nombre: 'Accesorios',
        descripcion: 'Accesorios varios',
        hijos: {
          create: [
            { nombre: 'Cables', descripcion: 'Cables HDMI, USB, etc.' },
            { nombre: 'Adaptadores', descripcion: 'Adaptadores y convertidores' },
            { nombre: 'Cargadores', descripcion: 'Cargadores universales' },
            { nombre: 'Baterías', descripcion: 'Baterías de repuesto' },
            { nombre: 'Herramientas', descripcion: 'Herramientas de reparación' }
          ]
        }
      }
    });

    const software = await prisma.categoria.create({
      data: {
        nombre: 'Software',
        descripcion: 'Licencias y programas',
        hijos: {
          create: [
            { nombre: 'Sistemas Operativos', descripcion: 'Windows, Linux' },
            { nombre: 'Antivirus', descripcion: 'Software de seguridad' },
            { nombre: 'Office', descripcion: 'Suites de oficina' },
            { nombre: 'Utilidades', descripcion: 'Software de utilidad' }
          ]
        }
      }
    });

    const repuestos = await prisma.categoria.create({
      data: {
        nombre: 'Repuestos Celulares',
        descripcion: 'Partes para móviles',
        hijos: {
          create: [
            { nombre: 'Pantallas', descripcion: 'Displays y táctiles' },
            { nombre: 'Baterías Celular', descripcion: 'Baterías para móviles' },
            { nombre: 'Flex y Conectores', descripcion: 'Cables flex' },
            { nombre: 'Cámaras', descripcion: 'Cámaras de repuesto' },
            { nombre: 'Altavoces', descripcion: 'Speakers y auriculares' }
          ]
        }
      }
    });

    console.log('✅ Categorías creadas exitosamente');

    // Crear algunos productos de ejemplo
    console.log('🌱 Creando productos de ejemplo...');

    // Obtener las subcategorías creadas
    const subcategorias = await prisma.categoria.findMany({
      where: { 
        padreId: { not: null }
      }
    });

    // Crear productos en diferentes categorías
    const productos = [
      // Hardware
      { codigo: '000001', nombre: 'Intel Core i5-12400', categoriaId: subcategorias.find(c => c.nombre === 'Procesadores').id, precio: 45000, costo: 35000, stock: 5, stockMinimo: 2 },
      { codigo: '000002', nombre: 'Kingston DDR4 8GB 3200MHz', categoriaId: subcategorias.find(c => c.nombre === 'Memorias RAM').id, precio: 8500, costo: 6000, stock: 10, stockMinimo: 3 },
      { codigo: '000003', nombre: 'SSD Kingston NV2 500GB', categoriaId: subcategorias.find(c => c.nombre === 'Discos').id, precio: 12000, costo: 9000, stock: 8, stockMinimo: 2 },
      
      // Periféricos
      { codigo: '000004', nombre: 'Logitech G213 Prodigy', categoriaId: subcategorias.find(c => c.nombre === 'Teclados').id, precio: 15000, costo: 11000, stock: 3, stockMinimo: 1 },
      { codigo: '000005', nombre: 'Razer DeathAdder Essential', categoriaId: subcategorias.find(c => c.nombre === 'Mouse').id, precio: 9500, costo: 7000, stock: 6, stockMinimo: 2 },
      { codigo: '000006', nombre: 'Samsung 24" F24T35', categoriaId: subcategorias.find(c => c.nombre === 'Monitores').id, precio: 55000, costo: 42000, stock: 2, stockMinimo: 1 },
      
      // Accesorios
      { codigo: '000007', nombre: 'Cable HDMI 2.0 - 2m', categoriaId: subcategorias.find(c => c.nombre === 'Cables').id, precio: 2500, costo: 1500, stock: 20, stockMinimo: 5 },
      { codigo: '000008', nombre: 'Adaptador USB-C a HDMI', categoriaId: subcategorias.find(c => c.nombre === 'Adaptadores').id, precio: 4500, costo: 3000, stock: 8, stockMinimo: 3 },
      
      // Repuestos Celulares
      { codigo: '000009', nombre: 'Pantalla Samsung A32', categoriaId: subcategorias.find(c => c.nombre === 'Pantallas').id, precio: 18000, costo: 14000, stock: 3, stockMinimo: 1 },
      { codigo: '000010', nombre: 'Batería iPhone 11', categoriaId: subcategorias.find(c => c.nombre === 'Baterías Celular').id, precio: 12000, costo: 9000, stock: 4, stockMinimo: 2 },
      
      // Software
      { codigo: '000011', nombre: 'Windows 11 Pro', categoriaId: subcategorias.find(c => c.nombre === 'Sistemas Operativos').id, precio: 25000, costo: 18000, stock: 999, stockMinimo: 1 },
      { codigo: '000012', nombre: 'Microsoft Office 2021', categoriaId: subcategorias.find(c => c.nombre === 'Office').id, precio: 18000, costo: 13000, stock: 999, stockMinimo: 1 }
    ];

    for (const producto of productos) {
      await prisma.producto.create({
        data: producto
      });
    }

    console.log('✅ Productos de ejemplo creados exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });