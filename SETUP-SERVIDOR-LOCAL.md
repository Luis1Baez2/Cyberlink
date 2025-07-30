# 🌐 Configuración de Servidor Local - ProManager

## **Paso 3: Configurar para Red Local**

### 1. **Modificar vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0', // Permite acceso desde otras PCs
		port: 3000       // Puerto fijo
	},
	preview: {
		host: '0.0.0.0', // Para modo producción
		port: 3000
	}
});
```

### 2. **Crear script de inicio**
Crear archivo `start-server.bat`:
```batch
@echo off
echo 🚀 Iniciando ProManager Server...
echo.
echo 📋 Información del servidor:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do echo IP Local: %%b:3000
)
echo.
echo 🌐 Accede desde cualquier PC con: http://[IP-DE-ESTA-PC]:3000
echo.
npm run build
npm run preview
pause
```

### 3. **Configurar Firewall de Windows**
1. Abrir "Windows Defender Firewall"
2. Hacer clic en "Configuración avanzada"
3. Hacer clic en "Reglas de entrada" → "Nueva regla"
4. Seleccionar "Puerto" → Siguiente
5. TCP → Puerto específico: 3000 → Siguiente
6. Permitir conexión → Siguiente
7. Aplicar a todas las redes → Siguiente
8. Nombre: "ProManager Server" → Finalizar

### 4. **Obtener IP de la PC Servidor**
```cmd
ipconfig
```
Buscar "Adaptador de red inalámbrica Wi-Fi" o "Adaptador Ethernet"
Anotar la **Dirección IPv4** (ej: 192.168.1.100)

## **Paso 4: Desplegar en Producción**

### 1. **Construir la aplicación**
```bash
npm run build
```

### 2. **Iniciar el servidor**
```bash
# Opción 1: Con preview (recomendado)
npm run preview -- --host 0.0.0.0 --port 3000

# Opción 2: Con script personalizado
./start-server.bat
```

### 3. **Configurar inicio automático (Opcional)**
1. Copiar `start-server.bat` a `C:\ProManager\`
2. Agregar al inicio de Windows:
   - Presionar `Win + R`, escribir `shell:startup`
   - Copiar el archivo .bat ahí

## **Paso 5: Acceso desde otras PCs**

### **En cada PC de la empresa:**
1. Abrir navegador web
2. Ir a: `http://IP-DEL-SERVIDOR:3000`
   - Ejemplo: `http://192.168.1.100:3000`
3. Hacer bookmark/favorito

### **Datos de acceso iniciales:**
- **Dueño**: usuario: `dueño` / contraseña: `admin123`
- **Admin**: usuario: `admin` / contraseña: `admin123`

## **Paso 6: Mantenimiento**

### **Backup de la base de datos:**
```bash
# Copiar el archivo de la base de datos
copy prisma\promanager.db backup\promanager-backup-YYYY-MM-DD.db
```

### **Agregar usuarios:**
1. Iniciar sesión como dueño/admin
2. Ir a la sección "Usuarios"
3. Crear los usuarios necesarios

### **Monitoreo:**
- El servidor debe estar siempre encendido
- Verificar conectividad: `ping IP-DEL-SERVIDOR`
- Revisar logs en caso de errores

## **Solución de Problemas Comunes**

### **No puedo acceder desde otra PC:**
1. Verificar firewall del servidor
2. Verificar que ambas PCs estén en la misma red
3. Probar con: `telnet IP-SERVIDOR 3000`

### **El servidor se cierra solo:**
1. No cerrar la ventana de comando
2. Usar servicio de Windows para inicio automático
3. Configurar hibernación/suspensión en "Nunca"

### **Lentitud:**
1. Verificar RAM disponible (mínimo 4GB)
2. Cerrar programas innecesarios
3. Usar cable Ethernet en lugar de WiFi

## **Seguridad Recomendada**

1. **Cambiar contraseñas por defecto**
2. **Configurar backup automático**
3. **Restringir acceso solo a la red local**
4. **Actualizar usuarios regularmente**

---

¿Necesitas ayuda con algún paso específico?