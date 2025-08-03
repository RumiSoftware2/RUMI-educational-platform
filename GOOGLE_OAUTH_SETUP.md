# Configuración de Google OAuth para RUMI

## Resumen de la Implementación

Se ha implementado la autenticación con Google OAuth en RUMI, manteniendo la lógica de registro tradicional como opción alternativa. Los usuarios ahora pueden:

1. **Registrarse con Google** (1 clic)
2. **Iniciar sesión con Google** (1 clic)
3. **Mantener registro tradicional** con email/contraseña

## Configuración Requerida

### 1. Backend (.env)

Agregar las siguientes variables al archivo `.env` del backend:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs Configuration
FRONTEND_URL=https://rumieducation.vercel.app
BACKEND_URL=https://rumi-backend.onrender.com
GOOGLE_CALLBACK_URL=https://rumi-backend.onrender.com/auth/google/callback
```

### 2. Frontend (.env)

Crear un archivo `.env` en el directorio `frontend/` con:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# API Configuration
VITE_API_URL=https://rumi-backend.onrender.com/api
```

## Configuración en Google Cloud Console

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ API

### 2. Configurar Credenciales OAuth

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configura el tipo de aplicación:
   - **Web application** para el backend
   - **JavaScript** para el frontend

### 3. URLs Autorizadas

#### Para el Backend (Web application):
```
https://rumi-backend.onrender.com/auth/google/callback
```

#### Para el Frontend (JavaScript):
```
http://localhost:5173
https://rumieducation.vercel.app
```

## Instalación de Dependencias

### Backend
```bash
cd backend
npm install passport passport-google-oauth20 passport-jwt google-auth-library
```

### Frontend
```bash
cd frontend
npm install @react-oauth/google
```

## Funcionalidades Implementadas

### Backend
- ✅ Configuración de Passport con Google OAuth
- ✅ Modelo User actualizado para soportar Google OAuth
- ✅ Endpoints para autenticación con Google
- ✅ Manejo de usuarios existentes vs nuevos
- ✅ Verificación automática de email (Google ya verifica)

### Frontend
- ✅ Componente GoogleAuthButton reutilizable
- ✅ Integración en Register.jsx y Login.jsx
- ✅ Configuración de GoogleOAuthProvider
- ✅ Manejo de errores y estados de carga
- ✅ Redirección automática según rol

## Flujo de Autenticación

### Registro con Google:
1. Usuario hace clic en "Continuar con Google"
2. Se abre popup de Google OAuth
3. Usuario autoriza la aplicación
4. Backend recibe datos del usuario
5. Si es usuario nuevo: se crea cuenta automáticamente
6. Si es usuario existente: se actualiza con googleId
7. Se genera token JWT y se redirige al dashboard

### Login con Google:
1. Usuario hace clic en "Continuar con Google"
2. Se abre popup de Google OAuth
3. Usuario autoriza la aplicación
4. Backend verifica/crea usuario
5. Se genera token JWT y se redirige según rol

## Ventajas de la Implementación

1. **Experiencia de usuario mejorada**: Registro más rápido
2. **Mayor tasa de conversión**: Menos fricción
3. **Seguridad**: Google maneja la autenticación
4. **Información confiable**: Datos verificados por Google
5. **Compatibilidad**: Mantiene registro tradicional
6. **Flexibilidad**: Usuarios pueden elegir su método preferido

## Notas Importantes

- Los usuarios registrados con Google tienen `emailVerified: true` automáticamente
- El campo `password` es opcional cuando se usa Google OAuth
- Se mantiene la lógica de roles (estudiante/docente/admin)
- Los usuarios pueden vincular cuentas existentes con Google

## Troubleshooting

### Error: "Invalid Client ID"
- Verifica que el GOOGLE_CLIENT_ID sea correcto
- Asegúrate de que las URLs autorizadas estén configuradas

### Error: "Redirect URI mismatch"
- Verifica las URLs autorizadas en Google Cloud Console
- Asegúrate de que coincidan con tu dominio

### Error: "Token verification failed"
- Verifica que GOOGLE_CLIENT_SECRET sea correcto
- Asegúrate de que las variables de entorno estén configuradas

## Próximos Pasos

1. Configurar las variables de entorno en producción
2. Probar la funcionalidad en desarrollo
3. Desplegar y probar en producción
4. Monitorear logs para detectar errores
5. Considerar agregar más proveedores OAuth (Facebook, GitHub, etc.) 