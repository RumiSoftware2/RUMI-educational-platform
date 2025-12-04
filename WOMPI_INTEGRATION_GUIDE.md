# 🎯 Guía de Integración Wompi - RUMI Platform

## 📋 Resumen de Implementación Completada

El módulo de pagos con Wompi ha sido completamente implementado en la plataforma RUMI. Este documento describe todos los componentes, flujos y pasos necesarios para activar el sistema de pagos.

---

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express + MongoDB)

#### 1. **Modelo de Datos** (`backend/models/Payment.js`)
```javascript
// Campos principales:
- student: User ID (pagador)
- course: Course ID (curso comprado)
- amount: COP (monto total)
- currency: COP (por defecto)
- status: "pending" | "completed" | "failed" | "refunded"
- wompiTransactionId: ID único de Wompi
- wompiFee: Comisión de Wompi (2%)
- platformFee: Comisión plataforma (8%)
- teacherAmount: Dinero para el docente (90%)
- createdAt: Timestamp
```

#### 2. **Servicio Wompi** (`backend/services/wompiService.js`)
Centraliza todas las interacciones con la API de Wompi:

**Funciones:**
- `isWompiConfigured()` - Verifica si existe WOMPI_PRIVATE_KEY
- `calculateFeeDistribution(amount)` - Calcula distribución de comisiones
- `createTransaction(amount, currency, metadata)` - Crea transacción en Wompi
  - Endpoint: `POST https://sandbox.wompi.co/v1/transactions`
  - Retorna: `{ id, status, checkoutUrl }`
- `verifyTransaction(wompiTransactionId)` - Verifica estado de transacción
  - Endpoint: `GET https://sandbox.wompi.co/v1/transactions/:id`

**Modo Sandbox:**
- Si no existe `WOMPI_PRIVATE_KEY`, retorna respuestas simuladas
- Permite desarrollo local sin credenciales reales

#### 3. **Controlador de Pagos** (`backend/controllers/paymentController.js`)

**Endpoints:**

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/payments/create-transaction` | ✓ | Crea transacción pendiente y obtiene URL de checkout |
| POST | `/api/payments/confirm` | ✓ | Verifica pago con Wompi y actualiza estado |
| GET | `/api/payments/user` | ✓ | Obtiene historial de pagos del usuario |
| GET | `/api/payments/course/:courseId/status` | ✓ | Verifica si usuario pagó un curso |
| GET | `/api/payments/course/:courseId/stats` | ✓ | Estadísticas de ingresos para docente |
| POST | `/api/payments/teacher/payout-account` | ✓ | Registra información bancaria del docente |
| GET | `/api/payments/teacher/balance` | ✓ | Obtiene saldo y estado de ganancias |
| POST | `/api/payments/webhook` | ✗ | Procesa webhooks de Wompi (no requiere auth) |

#### 4. **Rutas de Pagos** (`backend/routes/paymentRoutes.js`)
```javascript
// Todos los endpoints protegidos con authMiddleware
// EXCEPTO webhook que no requiere autenticación
```

### Frontend (React + Axios)

#### 1. **Servicio API** (`frontend/src/services/api.js`)
Funciones para comunicación con backend:

```javascript
createTransaction(paymentData)        // POST /payments/create-transaction
confirmPayment(paymentData)           // POST /payments/confirm
getUserPayments()                     // GET /payments/user
checkPaymentStatus(courseId)          // GET /payments/course/:courseId/status
getCoursePaymentStats(courseId)       // GET /payments/course/:courseId/stats
createTeacherPayoutAccount(payoutData) // POST /payments/teacher/payout-account
getTeacherBalance()                   // GET /payments/teacher/balance
```

#### 2. **Componentes**

##### a) **PaymentButton** (`frontend/src/components/PaymentButton.jsx`)
- Botón para iniciar compra de curso
- Verifica si usuario ya pagó
- Muestra "✓ Acceso comprado" si ya tiene acceso
- Redirige a checkout de Wompi
- Props: `courseId`, `coursePrice`, `onPaymentSuccess`

```jsx
<PaymentButton 
  courseId="course123" 
  coursePrice={29.99}
  onPaymentSuccess={() => setHasPaid(true)}
/>
```

##### b) **TeacherPayoutSetup** (`frontend/src/components/TeacherPayoutSetup.jsx`)
- Formulario para que docentes registren cuenta bancaria
- Muestra saldo de ganancias
- Estado: `not_configured` → `pending` → `active`
- Campos: Banco, Número de Cuenta, Tipo de Cuenta, Cédula
- Integrado en modal de TeacherCourses

```jsx
<TeacherPayoutSetup />
```

##### c) **PaymentSuccess** (`frontend/src/pages/PaymentSuccess.jsx`)
- Página de confirmación de pago
- Estados: loading, success, pending, error
- Redirige automáticamente a `/student/courses` en 5 segundos
- URL: `/payment-success?courseId=...&transactionId=...`

#### 3. **Integración en Páginas**

##### StudentCourseDetail (`frontend/src/pages/StudentCourseDetail.jsx`)
- Verifica si curso requiere pago (`course.isPaidCourse`)
- En intro muestra PaymentButton si curso es de pago
- Restringe acceso a lecciones hasta completar pago
- Actualiza `hasPaid` después de compra exitosa

##### TeacherCourses (`frontend/src/pages/TeacherCourses.jsx`)
- Nuevo botón "💰 Configurar Ganancias"
- Abre modal con TeacherPayoutSetup
- Permite docentes registrar datos bancarios y ver balance

---

## 🔄 Flujos de Transacción

### Flujo 1: Compra de Curso (Estudiante)

```
1. Estudiante accede a /student/course/:id
   ↓
2. Sistema verifica:
   - ¿Es curso de pago? (course.isPaidCourse)
   - ¿Ya pagó? (checkPaymentStatus)
   ↓
3. Si necesita pagar:
   - Muestra PaymentButton
   - Estudiante hace clic en "Pagar"
   ↓
4. Frontend llama createTransaction()
   - Envía: { courseId, amount }
   - Backend crea Payment con status="pending"
   - Wompi crea transacción y retorna checkoutUrl
   ↓
5. Frontend redirige a checkoutUrl
   - Usuario llena datos de tarjeta en Wompi
   ↓
6. Wompi procesa pago:
   - Si APROBADO: envia webhook al backend
   - Si RECHAZADO: envia webhook con error
   ↓
7. Backend recibe webhook (handleWompiWebhook):
   - Verifica transactionId
   - Actualiza Payment.status = "completed"
   - Agrega estudiante al course.students
   - Suma monto a Teacher.totalEarnings
   ↓
8. Estudiante es redirigido a /payment-success
   - Confirmación visual del pago
   - Link a /student/courses
```

### Flujo 2: Configuración de Pagos (Docente)

```
1. Docente accede a /teacher/courses
   ↓
2. Ve botón "💰 Configurar Ganancias"
   - Abre modal con TeacherPayoutSetup
   ↓
3. Completa formulario:
   - Nombre del banco
   - Número de cuenta
   - Tipo de cuenta (ahorro/corriente)
   - Cédula
   ↓
4. Hace clic en "Guardar Información"
   - Frontend envia createTeacherPayoutAccount()
   - Backend guarda en User.payoutInfo
   - Status: "pending"
   ↓
5. Docente puede ver su balance:
   - Ganancias totales
   - Ganancias este mes
   - Estado de pago (pending/active)
```

### Flujo 3: Webhook de Wompi

```
Wompi → POST /api/payments/webhook
{
  event: "transaction.updated",
  data: {
    transaction: {
      id: "wompi-tx-id",
      status: "APPROVED" | "DECLINED",
      amountInCents: 2999900
    }
  }
}
   ↓
Backend procesa:
1. Busca Payment con wompiTransactionId
2. Si APPROVED:
   - Actualiza status = "completed"
   - Suma a earnings del docente
   - Agrega estudiante al curso
3. Si DECLINED:
   - Actualiza status = "failed"
   - Mantiene Payment para auditoría
```

---

## 🔐 Variables de Entorno Requeridas

### Backend (`.env`)

```env
# Wompi
WOMPI_PRIVATE_KEY=pk_live_xxxxxxxxxxxxx    # O pk_test_ para sandbox
FRONTEND_URL=http://localhost:5173          # Para redirecciones

# Otros (si aplica)
MONGODB_URI=mongodb://...
JWT_SECRET=...
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api     # URL del backend
VITE_WOMPI_PUBLIC_KEY=pub_live_xxxxx       # Opcional, si Wompi lo requiere
```

---

## 🚀 Pasos para Activar (Setup Manual)

### 1️⃣ Registrarse en Wompi

**Sandbox (Testing):**
1. Ir a https://sandbox.wompi.co/
2. Crear cuenta de prueba
3. Obtener `WOMPI_PRIVATE_KEY` (starts with `pk_test_`)
4. Obtener `WOMPI_PUBLIC_KEY` (opcional)

**Producción:**
1. Ir a https://www.wompi.co/
2. Completar registro como empresa
3. KYC/AML verification
4. Recibir `WOMPI_PRIVATE_KEY` (starts with `pk_live_`)

### 2️⃣ Configurar Variables de Entorno

**Backend (crear/actualizar `backend/.env`):**
```bash
WOMPI_PRIVATE_KEY=pk_test_xxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

**Frontend (crear/actualizar `frontend/.env`):**
```bash
VITE_API_URL=http://localhost:3000/api
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxx
```

### 3️⃣ Instalar Dependencias

```bash
# Backend (si no está instalado)
cd backend
npm install axios mongoose express

# Frontend (si no está instalado)
cd frontend
npm install axios react-router-dom
```

### 4️⃣ Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm start
# Corre en http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Corre en http://localhost:5173
```

### 5️⃣ Pruebas en Sandbox

**Para simular pago aprobado:**
1. Docente crea curso de pago
2. Estudiante intenta comprar
3. En Wompi checkout usa tarjeta de prueba:
   - Número: `4111 1111 1111 1111`
   - Mes/Año: Cualquiera futura
   - CVV: Cualquiera
4. Wompi simula aprobación
5. Webhook notifica al backend
6. Estudiante obtiene acceso

**Para simular pago rechazado:**
1. Usa tarjeta: `5555 5555 5555 4444`
2. Wompi simula rechazo
3. Estudiante ve error en PaymentSuccess

### 6️⃣ Verificar Webhooks (Importante para Producción)

En panel de Wompi:
1. Settings → Webhooks
2. URL: `https://tudominio.com/api/payments/webhook`
3. Eventos: `transaction.updated`
4. Wompi enviará notificaciones a ese endpoint

---

## 📊 Estados de Transacción

| Status | Descripción | Estudiante | Docente |
|--------|-------------|-----------|---------|
| `pending` | Esperando confirmación | No accede | No gana |
| `completed` | Pago confirmado | ✓ Acceso | ✓ Gana dinero |
| `failed` | Pago rechazado | No accede | No gana |
| `refunded` | Reembolso procesado | Acceso revocado | Dinero regresado |

---

## 💰 Distribución de Comisiones

Para un pago de **$100,000 COP**:

```
$100,000.00 (Total pagado por estudiante)
   ├─ $2,000.00 (2%) → Wompi
   ├─ $8,000.00 (8%) → Plataforma RUMI
   └─ $90,000.00 (90%) → Docente
```

**Nota:** Los porcentajes están en `wompiService.js` y pueden ajustarse:
```javascript
const WOMPI_FEE_PERCENT = 0.02;     // 2%
const PLATFORM_FEE_PERCENT = 0.08;  // 8%
const TEACHER_PERCENT = 0.90;       // 90%
```

---

## 🔍 Debugging

### Problema: "No checkoutUrl returned"

**Causa:** WOMPI_PRIVATE_KEY no configurado o inválido

**Solución:**
1. Verificar `.env` en backend
2. Reiniciar servidor backend
3. En sandbox, se retorna URL simulada

### Problema: Webhook no se recibe

**Causa:** URL de webhook incorrecta o Wompi no logra conectar

**Solución:**
1. En Wompi settings, verificar URL webhook
2. Asegurarse que endpoint es público (no localhost)
3. Usar herramienta como `ngrok` para exponer localhost:
   ```bash
   ngrok http 3000
   # Usar URL de ngrok en webhook settings
   ```

### Problema: Payment status muestra pending indefinidamente

**Causa:** Webhook no procesó o transacción rechazada

**Solución:**
1. Usar endpoint `POST /api/payments/confirm` manualmente:
   ```javascript
   fetch('/api/payments/confirm', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       paymentId: 'payment-id',
       wompiTransactionId: 'wompi-tx-id'
     })
   })
   ```
2. O verificar webhook logs en panel de Wompi

---

## 📁 Estructura de Archivos Implementados

```
backend/
├── models/
│   └── Payment.js                    ✓ Schema Mongoose
├── services/
│   └── wompiService.js               ✓ Lógica Wompi
├── controllers/
│   └── paymentController.js          ✓ Endpoints
├── routes/
│   └── paymentRoutes.js              ✓ Rutas (7)
└── index.js                          ✓ Registro de rutas

frontend/
├── src/
│   ├── services/
│   │   └── api.js                    ✓ Funciones API
│   ├── components/
│   │   ├── PaymentButton.jsx         ✓ Botón compra
│   │   └── TeacherPayoutSetup.jsx    ✓ Formulario docente
│   ├── pages/
│   │   ├── StudentCourseDetail.jsx   ✓ Integrado PaymentButton
│   │   ├── TeacherCourses.jsx        ✓ Integrado Payout Setup
│   │   └── PaymentSuccess.jsx        ✓ Página confirmación
│   └── styles/
│       └── PaymentSuccess.css        ✓ Estilos
```

---

## ✅ Checklist de Implementación

- [x] Modelo Payment creado
- [x] Servicio Wompi implementado
- [x] Controlador de pagos con 8 endpoints
- [x] Rutas registradas en servidor
- [x] API frontend con funciones de pago
- [x] Componente PaymentButton
- [x] Componente TeacherPayoutSetup
- [x] Página PaymentSuccess
- [x] Integración en StudentCourseDetail
- [x] Integración en TeacherCourses
- [x] Webhook handler implementado
- [x] Modo sandbox para desarrollo local
- [ ] Registrarse en Wompi (acción manual)
- [ ] Configurar .env variables (acción manual)
- [ ] Probar en sandbox (acción manual)
- [ ] Configurar webhook en producción (acción manual)

---

## 📞 Soporte y Recursos

- **Docs de Wompi:** https://developers.wompi.co/
- **Sandbox de Wompi:** https://sandbox.wompi.co/
- **Tarjetas de prueba:** https://developers.wompi.co/testing
- **Contact:** api@wompi.co

---

## 🎓 Próximos Pasos

1. **Registrarse en Wompi** (sandbox o producción)
2. **Obtener WOMPI_PRIVATE_KEY**
3. **Configurar .env variables**
4. **Iniciar servidores (backend + frontend)**
5. **Crear curso de pago y probar compra**
6. **Configurar webhook en Wompi (producción)**
7. **Docentes registran cuenta bancaria**
8. **Procesar primeros pagos reales**

---

**Última actualización:** Diciembre 1, 2025
**Estado:** ✅ Implementación Completa
**Modo:** Sandbox ready, Production pending Wompi signup
