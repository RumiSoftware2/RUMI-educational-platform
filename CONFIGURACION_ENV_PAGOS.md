# Guía de Configuración de Variables de Entorno - RUMI con Pagos

Este archivo documenta todas las variables de entorno necesarias para ejecutar RUMI con el módulo de pagos.

## 📋 Plantilla Completa

Copia y pega esto en tu archivo `.env` en el directorio `backend/`:

```env
# ============================================
# PUERTO Y ENTORNO
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# BASE DE DATOS
# ============================================
MONGODB_URI=mongodb://localhost:27017/rumi
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/rumi?retryWrites=true&w=majority

# ============================================
# AUTENTICACIÓN Y JWT
# ============================================
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_aqui
JWT_EXPIRE=7d

# ============================================
# GOOGLE OAUTH
# ============================================
GOOGLE_CLIENT_ID=tu_client_id_de_google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# ============================================
# EMAIL (Nodemailer)
# ============================================
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app_gmail

# ============================================
# FRONTEND
# ============================================
FRONTEND_URL=http://localhost:5173
# En producción:
# FRONTEND_URL=https://rumieducation.vercel.app

# ============================================
# 🏦 SISTEMA DE PAGOS - BANCO JAVA
# ============================================

# URL del API del banco en Java
BANK_API_URL=http://localhost:8080/api

# API Key para autenticarse con el banco
BANK_API_KEY=tu-api-key-segura-del-banco

# Modo de pago (development o production)
PAYMENT_MODE=development

# Webhook secret (para validar webhooks del banco)
WEBHOOK_SECRET=tu-webhook-secret-seguro

# Comisión de RUMI en pagos (porcentaje, ej: 0.05 = 5%)
RUMI_COMMISSION=0.05

# Monto mínimo de payout (en USD)
MIN_PAYOUT_AMOUNT=10

# Máximo intentos de verificación de cuenta bancaria
MAX_VERIFICATION_ATTEMPTS=3

# Duración del código de verificación (en horas)
VERIFICATION_CODE_DURATION=24
```

## 🏦 Configuración Específica del Banco Java

### URL del Banco

**Desarrollo:**
```
BANK_API_URL=http://localhost:8080/api
```

**Producción:**
```
BANK_API_URL=https://tu-banco-api.com/api
```

### API Key

Genera una key segura y larga:
```bash
# En Linux/Mac
openssl rand -hex 32

# En Windows (PowerShell)
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Luego úsala en:
```
BANK_API_KEY=5f2a8c4e9b1d3f7a6c2e8d4b9f1a3c5e7b2d8f4a6c9e1b3d5f7a9c2e4b6d8f
```

## 🔄 Flujo de Configuración

1. **Localiza el archivo .env:**
   ```
   backend/.env
   ```

2. **Si no existe, cópialo del ejemplo:**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edita las variables con tus valores:**
   ```bash
   nano .env    # Linux/Mac
   # o
   code .env    # Visual Studio Code
   ```

4. **Reinicia el servidor:**
   ```bash
   npm start
   ```

## ✅ Variables Requeridas Mínimas para Pagos

Estas son las variables MÍNIMAS para que funcione el módulo de pagos:

```env
BANK_API_URL=http://localhost:8080/api
BANK_API_KEY=tu-clave-api-segura
MONGODB_URI=mongodb://localhost:27017/rumi
JWT_SECRET=tu-secreto-jwt
EMAIL_USER=tu@email.com
EMAIL_PASSWORD=tu-contraseña
```

## 🧪 Verificación de Configuración

Para verificar que tus variables están configuradas correctamente:

1. **Inicia el servidor:**
   ```bash
   cd backend
   npm start
   ```

2. **Debería ver en la consola:**
   ```
   🚀 Servidor corriendo en http://localhost:3000
   Conectado a MongoDB
   [INFO] Sistema de pagos iniciado
   [INFO] Banco API URL: http://localhost:8080/api
   ```

3. **Prueba un endpoint de pagos:**
   ```bash
   curl -X GET http://localhost:3000/api/payments/student/history \
     -H "Authorization: Bearer {tu_token_jwt}"
   ```

## 🔐 Seguridad

### En Desarrollo
- Usa valores de prueba
- Las variables pueden ser menos complejas
- `NODE_ENV=development`

### En Producción
- Usa valores REALES y SEGUROS
- Guarda .env en el servidor, NO en git
- `NODE_ENV=production`
- Agrega a `.gitignore`:
  ```
  backend/.env
  backend/.env.local
  backend/.env.*.local
  ```

### Variables Sensibles
Estas NUNCA deben estar en git:
- `BANK_API_KEY`
- `JWT_SECRET`
- `EMAIL_PASSWORD`
- `GOOGLE_CLIENT_SECRET`
- `WEBHOOK_SECRET`

## 🚀 Deployment

### Heroku
```bash
heroku config:set BANK_API_URL=https://tu-banco.com/api
heroku config:set BANK_API_KEY=tu-clave-segura
heroku config:set MONGODB_URI=mongodb+srv://...
```

### Railway / Render
En el panel de control, agregar las variables en "Environment"

### Docker
En `docker-compose.yml`:
```yaml
environment:
  - BANK_API_URL=http://banco:8080/api
  - BANK_API_KEY=${BANK_API_KEY}
  - MONGODB_URI=${MONGODB_URI}
```

## 📝 Checklist de Configuración

Antes de ejecutar pagos:

- [ ] `BANK_API_URL` está configurada correctamente
- [ ] `BANK_API_KEY` es segura y larga
- [ ] `MONGODB_URI` apunta a una BD válida
- [ ] `JWT_SECRET` está configurada
- [ ] `EMAIL_USER` y `EMAIL_PASSWORD` son válidos
- [ ] `FRONTEND_URL` coincide con tu frontend
- [ ] En producción: `NODE_ENV=production`
- [ ] En producción: Variables sensibles en servidor, no en código

## 🐛 Troubleshooting

### Error: "Cannot find BANK_API_URL"
```
✓ Asegúrate de que BANK_API_URL esté en .env
✓ Reinicia el servidor después de cambiar .env
```

### Error: "Bank API connection failed"
```
✓ Verifica que BANK_API_URL es correcta
✓ Verifica que el banco Java está corriendo
✓ Verifica que BANK_API_KEY es correcta
```

### Error: "Invalid JWT"
```
✓ Verifica que JWT_SECRET es la misma en todos los servidores
✓ Genera un token válido
```

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs del servidor: `npm start`
2. Verifica que todas las variables estén presentes
3. Contacta al equipo de desarrollo

---

**Última actualización:** Enero 2026
