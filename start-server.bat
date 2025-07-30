@echo off
echo.
echo ====================================
echo      🚀 ProManager Server
echo ====================================
echo.
echo Iniciando servidor ProManager...
echo.

:: Obtener IP local
echo 📋 Información del servidor:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo    IP Local: %%b:3000
        echo    URL: http://%%b:3000
    )
)
echo.

:: Mostrar instrucciones
echo 🌐 Para acceder desde otras PCs:
echo    1. Asegúrate de que estén en la misma red
echo    2. Usa la IP mostrada arriba
echo    3. Ejemplo: http://192.168.1.100:3000
echo.

echo 📱 Usuarios iniciales:
echo    Dueño: usuario 'dueño' / contraseña 'admin123'
echo    Admin: usuario 'admin' / contraseña 'admin123'
echo.

:: Construir y ejecutar
echo ⚙️  Construyendo aplicación...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error en la construcción
    pause
    exit /b 1
)

echo.
echo ✅ Construcción completada
echo 🌐 Iniciando servidor en puerto 3000...
echo.
echo ⚠️  IMPORTANTE: No cerrar esta ventana
echo    El servidor se detendrá si cierras la ventana
echo.

:: Iniciar servidor
call npm run preview

echo.
echo 🛑 Servidor detenido
pause