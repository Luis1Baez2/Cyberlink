<!DOCTYPE html>
<html>
<head>
    <title>ProManager - Login Simple</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { text-align: center; color: #333; }
        input, select, button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #0056b3; }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .debug {
            background: #e2e3e5;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 ProManager - Login Simple</h1>
        
        <form method="POST" action="/simple-login">
            <label>Usuario:</label>
            <select name="username" required>
                <option value="">Seleccionar usuario...</option>
                <option value="dueño">🏢 Dueño</option>
                <option value="admin">👨‍💼 Admin</option>
                <option value="juan">🔧 Juan (Técnico)</option>
                <option value="rodrigo">🔧 Rodrigo (Técnico)</option>
                <option value="franco">🔧 Franco (Técnico)</option>
                <option value="vendedor">👨‍💻 Vendedor</option>
                <option value="cajero">💰 Cajero</option>
            </select>
            
            <label>Contraseña:</label>
            <input type="password" name="password" value="1234" required>
            
            <button type="submit">🚀 Entrar</button>
        </form>
        
        <div class="debug">
            <strong>📋 Información de Debug:</strong><br>
            🌐 URL: <span id="current-url"></span><br>
            📱 Dispositivo: <span id="user-agent"></span><br>
            ⏰ Hora: <span id="current-time"></span><br>
            🔑 Contraseña: 1234 (para todos los usuarios)
        </div>
        
        <div class="debug">
            <strong>✅ Test Manual:</strong><br>
            1. Selecciona cualquier usuario<br>
            2. La contraseña ya está puesta (1234)<br>
            3. Haz clic en "Entrar"<br>
            4. Debería redirigir al sistema
        </div>
    </div>

    <script>
        // Información de debug
        document.getElementById('current-url').textContent = window.location.href;
        document.getElementById('user-agent').textContent = navigator.userAgent.substring(0, 50) + '...';
        document.getElementById('current-time').textContent = new Date().toLocaleString();
        
        // Log para debug
        console.log('=== PROMANAGER DEBUG ===');
        console.log('URL:', window.location.href);
        console.log('Timestamp:', new Date().toISOString());
        console.log('User Agent:', navigator.userAgent);
    </script>
</body>
</html>