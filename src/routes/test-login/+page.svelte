<script>
    import { onMount } from 'svelte';
    
    function testLogin() {
        const usernameSelect = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        usernameSelect.value = 'dueño';
        passwordInput.value = '1234';
        
        // Enviar formulario automáticamente
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                form.submit();
            }
        }, 500);
    }
    
    onMount(() => {
        // Llenar información de debug
        const urlInfo = document.getElementById('url-info');
        const deviceInfo = document.getElementById('device-info');
        const timeInfo = document.getElementById('time-info');
        const referrerInfo = document.getElementById('referrer-info');
        
        if (urlInfo) urlInfo.textContent = window.location.href;
        if (deviceInfo) deviceInfo.textContent = navigator.userAgent.substring(0, 60) + '...';
        if (timeInfo) timeInfo.textContent = new Date().toLocaleString();
        if (referrerInfo) referrerInfo.textContent = document.referrer || 'Directo';

        // Debug en consola
        console.log('=== PROMANAGER TEST LOGIN ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('URL:', window.location.href);
        console.log('User Agent:', navigator.userAgent);
        console.log('Screen:', screen.width + 'x' + screen.height);
        console.log('Viewport:', window.innerWidth + 'x' + window.innerHeight);
        
        // Log cuando se envía el formulario
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                console.log('=== ENVIANDO FORMULARIO ===');
                console.log('Usuario:', document.getElementById('username')?.value);
                console.log('Contraseña:', document.getElementById('password')?.value);
                console.log('Timestamp envío:', new Date().toISOString());
            });
        }
    });
</script>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProManager - Test Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
            font-size: 24px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        select, input, button {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e1e1;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        select:focus, input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.2);
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            font-weight: 500;
        }
        .error { background: #fee; color: #c33; border: 2px solid #fcc; }
        .success { background: #efe; color: #3c3; border: 2px solid #cfc; }
        .info { background: #eef; color: #33c; border: 2px solid #ccf; }
        .debug-info {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
        }
        .test-btn {
            background: #28a745;
            margin-top: 10px;
            padding: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ProManager Test Login</h1>
        
        <div class="info">
            ✅ Página independiente sin layout<br>
            ✅ Sin dependencias de Svelte<br>
            ✅ Debug completo activado
        </div>

        <form method="POST" action="/test-login">
            <div class="form-group">
                <label for="username">👤 Usuario:</label>
                <select name="username" id="username" required>
                    <option value="">-- Seleccionar Usuario --</option>
                    <option value="dueño">🏢 Dueño (Acceso Total)</option>
                    <option value="admin">👨‍💼 Admin (Gestión)</option>
                    <option value="juan">🔧 Juan (Técnico)</option>
                    <option value="rodrigo">🔧 Rodrigo (Técnico)</option>
                    <option value="franco">🔧 Franco (Técnico)</option>
                    <option value="vendedor">🛒 Vendedor</option>
                    <option value="cajero">💰 Cajero</option>
                </select>
            </div>

            <div class="form-group">
                <label for="password">🔑 Contraseña:</label>
                <input type="password" name="password" id="password" value="1234" required>
            </div>

            <button type="submit">🚀 ENTRAR AL SISTEMA</button>
        </form>

        <button class="test-btn" on:click={testLogin}>🧪 Test Rápido (Dueño)</button>

        <div class="debug-info">
            <strong>📊 Información de Debug:</strong><br>
            🌐 URL: <span id="url-info"></span><br>
            📱 Dispositivo: <span id="device-info"></span><br>
            ⏰ Timestamp: <span id="time-info"></span><br>
            🔗 Referrer: <span id="referrer-info"></span>
        </div>

        <div class="debug-info">
            <strong>🔧 Datos de Prueba:</strong><br>
            👤 Todos los usuarios tienen contraseña: <code>1234</code><br>
            🎯 Hash esperado: <code>170842</code><br>
            🔄 Esta página NO usa el layout principal
        </div>
    </div>

</body>
</html>