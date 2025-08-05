#!/bin/bash

# Script para limpiar la base de datos en el servidor
# ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos

echo "⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos"
echo "¿Estás seguro que deseas continuar? (si/no)"
read -r respuesta

if [[ "$respuesta" != "si" ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo "🔄 Deteniendo los contenedores..."
docker-compose down

echo "🗑️  Eliminando base de datos existente..."
rm -f data/cyberlink.db data/cyberlink.db-journal

echo "🗑️  Eliminando archivo de inicialización..."
rm -f data/.initialized

echo "🚀 Reiniciando contenedores con base de datos limpia..."
docker-compose up -d

echo "⏳ Esperando a que la base de datos se inicialice..."
sleep 10

echo "📊 Verificando estado de los contenedores..."
docker-compose ps

echo "✅ Base de datos limpia y reiniciada"
echo ""
echo "Usuarios creados por defecto:"
echo "- dueño (rol: owner)"
echo "- admin (rol: admin)"
echo "- vendedor (rol: sales)"
echo "- juan, rodrigo, franco (rol: tech)"
echo "- cajero (rol: cashier)"
echo ""
echo "Contraseña para todos: password123"