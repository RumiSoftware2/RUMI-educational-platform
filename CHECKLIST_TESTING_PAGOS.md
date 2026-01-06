# ✅ Checklist de Testing - Módulo de Pagos RUMI

Use este checklist para verificar que todos los componentes del sistema de pagos funcionan correctamente.

---

## 🔧 Requisitos Previos

- [ ] MongoDB corriendo localmente o en Atlas
- [ ] RUMI Backend corriendo en `http://localhost:3000`
- [ ] RUMI Frontend corriendo en `http://localhost:5173`
- [ ] Banco Java corriendo en `http://localhost:8080` (para testing)
- [ ] Variables `.env` configuradas correctamente
- [ ] Node.js versión 14+ instalado

---

## 📦 Testing Backend

### 1. Verificación de Modelos

- [ ] El archivo `backend/models/Payment.js` existe
- [ ] El archivo `backend/models/BankAccount.js` existe
- [ ] El modelo `Course.js` tiene campos:
  - [ ] `isPaid: Boolean`
  - [ ] `price: Number`
  - [ ] `currency: String`
  - [ ] `paidStudents: Array`

### 2. Verificación de Controladores

- [ ] El archivo `backend/controllers/paymentController.js` existe con:
  - [ ] `createPayment()`
  - [ ] `confirmPayment()`
  - [ ] `getStudentPayments()`
  - [ ] `getCoursePayments()`
  - [ ] `getPaymentStatus()`
  - [ ] `hasStudentPaid()`
  - [ ] `getTeacherEarnings()`
  - [ ] `refundPayment()`

- [ ] El archivo `backend/controllers/bankAccountController.js` existe con:
  - [ ] `createOrUpdateBankAccount()`
  - [ ] `getBankAccount()`
  - [ ] `verifyBankAccount()`
  - [ ] `confirmBankAccountVerification()`
  - [ ] `getPayoutStatus()`
  - [ ] `requestPayout()`

### 3. Verificación de Rutas

- [ ] El archivo `backend/routes/paymentRoutes.js` existe y define:
  - [ ] `POST /courses/:courseId/pay`
  - [ ] `POST /:paymentId/confirm`
  - [ ] `GET /student/history`
  - [ ] `GET /course/:courseId`
  - [ ] `GET /:paymentId/status`
  - [ ] `GET /courses/:courseId/has-paid`
  - [ ] `GET /teacher/earnings`
  - [ ] `POST /:paymentId/refund`

- [ ] El archivo `backend/routes/bankAccountRoutes.js` existe y define:
  - [ ] `POST /`
  - [ ] `GET /`
  - [ ] `POST /verify/send-code`
  - [ ] `POST /verify/confirm-code`
  - [ ] `GET /payouts/status`
  - [ ] `POST /payouts/request`

### 4. Verificación de Integración en Index.js

- [ ] En `backend/index.js`:
  - [ ] Importa `paymentRoutes`
  - [ ] Importa `bankAccountRoutes`
  - [ ] `app.use('/api/payments', paymentRoutes)`
  - [ ] `app.use('/api/bank-accounts', bankAccountRoutes)`

### 5. Test de API - Pagos

```bash
# 1. Crear un curso de prueba (como docente)
POST http://localhost:3000/api/courses
Headers:
  Authorization: Bearer {TEACHER_TOKEN}
  Content-Type: application/json
Body:
{
  "title": "Test Course",
  "description": "Test description",
  "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "isPaid": true,
  "price": 10,
  "currency": "USD"
}

Response: { _id: "COURSE_ID", isPaid: true, price: 10 }

# [ ] Verificar que se creó correctamente
```

```bash
# 2. Iniciar un pago (como estudiante)
POST http://localhost:3000/api/payments/courses/COURSE_ID/pay
Headers:
  Authorization: Bearer {STUDENT_TOKEN}
  Content-Type: application/json

Response: 
{
  "message": "Pago iniciado",
  "payment": { _id: "PAYMENT_ID", status: "pending" },
  "bankPaymentUrl": "..."
}

# [ ] Verificar que se retorna PAYMENT_ID
```

```bash
# 3. Verificar si el estudiante pagó (antes de pagar)
GET http://localhost:3000/api/payments/courses/COURSE_ID/has-paid
Headers:
  Authorization: Bearer {STUDENT_TOKEN}

Response: { hasPaid: false, isPaidCourse: true }

# [ ] Verificar que hasPaid es false
```

```bash
# 4. Confirmar pago (simular webhook del banco)
POST http://localhost:3000/api/payments/PAYMENT_ID/confirm
Headers:
  Content-Type: application/json
Body:
{
  "bankTransactionId": "BANK-TXN-TEST-001",
  "status": "completed"
}

Response: 
{
  "message": "Pago confirmado exitosamente",
  "payment": { ..., status: "completed" }
}

# [ ] Verificar que status cambió a "completed"
```

```bash
# 5. Verificar si el estudiante pagó (después de pagar)
GET http://localhost:3000/api/payments/courses/COURSE_ID/has-paid
Headers:
  Authorization: Bearer {STUDENT_TOKEN}

Response: { hasPaid: true, isPaidCourse: true }

# [ ] Verificar que hasPaid es true
```

```bash
# 6. Obtener historial de pagos del estudiante
GET http://localhost:3000/api/payments/student/history
Headers:
  Authorization: Bearer {STUDENT_TOKEN}

Response: [{ course: {...}, amount: 10, status: "completed" }]

# [ ] Verificar que aparece el pago
```

```bash
# 7. Obtener pagos de un curso (como docente)
GET http://localhost:3000/api/payments/course/COURSE_ID
Headers:
  Authorization: Bearer {TEACHER_TOKEN}

Response: [{ student: {...}, amount: 10, status: "completed" }]

# [ ] Verificar que aparece el pago
```

```bash
# 8. Obtener ingresos del docente
GET http://localhost:3000/api/payments/teacher/earnings
Headers:
  Authorization: Bearer {TEACHER_TOKEN}

Response: 
{
  "totalEarnings": 10,
  "totalTransactions": 1,
  "payments": [...]
}

# [ ] Verificar que earnings es 10
```

### 6. Test de API - Cuentas Bancarias

```bash
# 1. Crear cuenta bancaria (como docente)
POST http://localhost:3000/api/bank-accounts
Headers:
  Authorization: Bearer {TEACHER_TOKEN}
  Content-Type: application/json
Body:
{
  "accountHolder": "Juan García",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "bankName": "Banco de Bogotá",
  "bankCode": "012",
  "routingNumber": "011000015",
  "country": "CO"
}

Response: { message: "...", bankAccount: { _id: "BANK_ACCOUNT_ID" } }

# [ ] Verificar que se creó correctamente
```

```bash
# 2. Obtener cuenta bancaria
GET http://localhost:3000/api/bank-accounts
Headers:
  Authorization: Bearer {TEACHER_TOKEN}

Response: 
{
  "accountHolder": "Juan García",
  "bankName": "Banco de Bogotá",
  "isVerified": false,
  "totalEarnings": 10
}

# [ ] Verificar que aparecen los datos
```

```bash
# 3. Enviar código de verificación
POST http://localhost:3000/api/bank-accounts/verify/send-code
Headers:
  Authorization: Bearer {TEACHER_TOKEN}

Response: { message: "Código de verificación enviado a tu correo" }

# [ ] Verificar que no da error
# [ ] En mongosh/Atlas, buscar el código: 
#     db.bankaccounts.findOne({teacher: TEACHER_ID})
```

```bash
# 4. Confirmar código de verificación
POST http://localhost:3000/api/bank-accounts/verify/confirm-code
Headers:
  Authorization: Bearer {TEACHER_TOKEN}
  Content-Type: application/json
Body:
{
  "verificationCode": "123456"  // Usar código de paso 3
}

Response: { message: "Cuenta bancaria verificada exitosamente" }

# [ ] Verificar que se verifica correctamente
```

```bash
# 5. Obtener estado de payouts
GET http://localhost:3000/api/bank-accounts/payouts/status
Headers:
  Authorization: Bearer {TEACHER_TOKEN}

Response: 
{
  "totalEarnings": 10,
  "pendingPayouts": 10,
  "lastPayout": null,
  "isVerified": true
}

# [ ] Verificar valores correctos
```

```bash
# 6. Solicitar payout
POST http://localhost:3000/api/bank-accounts/payouts/request
Headers:
  Authorization: Bearer {TEACHER_TOKEN}
  Content-Type: application/json
Body:
{
  "amount": 10
}

Response: 
{
  "message": "Payout solicitado exitosamente",
  "payout": { amount: 10, status: "processing" }
}

# [ ] Verificar que se solicita correctamente
```

---

## 🎨 Testing Frontend

### 1. Verificación de Componentes

- [ ] Archivo `frontend/src/components/BankAccountForm.jsx` existe
- [ ] Archivo `frontend/src/components/PaymentButton.jsx` existe
- [ ] Archivo `frontend/src/pages/CourseForm.jsx` fue modificado
- [ ] Archivo `frontend/src/pages/Profile.jsx` fue modificado
- [ ] Archivo `frontend/src/pages/StudentCourseDetail.jsx` fue modificado

### 2. Test - CourseForm (Crear Curso de Pago)

- [ ] Navega a `/teacher/create-course`
- [ ] Ingresa título: "Test Course"
- [ ] Ingresa URL de video
- [ ] Ingresa descripción
- [ ] Marca checkbox: "¿Es un curso de pago?"
- [ ] Aparecen campos: Precio y Moneda
- [ ] Ingresa precio: 49.99
- [ ] Selecciona moneda: USD
- [ ] Click "Crear curso"
- [ ] Mensaje: "✅ Curso creado exitosamente"
- [ ] Redirecciona a `/teacher/courses`
- [ ] El nuevo curso aparece en la lista
- [ ] El curso muestra el precio (49.99 USD)

### 3. Test - Profile (Registrar Cuenta Bancaria)

- [ ] Como docente, navega a `/profile`
- [ ] Aparece sección "💳 Información Bancaria"
- [ ] Llena formulario:
  - [ ] Titular: "Tu Nombre"
  - [ ] Número de Cuenta
  - [ ] Tipo: Corriente/Ahorros
  - [ ] Banco: Tu banco
  - [ ] Código: Código del banco
  - [ ] Routing: Número de ruta
- [ ] Click "Guardar Datos Bancarios"
- [ ] Mensaje: "✅ Cuenta bancaria guardada exitosamente"
- [ ] Aparece tarjeta verde con datos guardados
- [ ] Click "Verificar Cuenta"
- [ ] Ingresa código de verificación
- [ ] Click "Confirmar"
- [ ] Estado cambió a: "✅ Verificada"

### 4. Test - StudentCourseDetail (Pagar por Curso)

**Curso Gratuito:**
- [ ] Como estudiante, accede a un curso gratuito
- [ ] Aparece pantalla introductoria
- [ ] Botón: "Comenzar lecciones" está disponible
- [ ] NO aparece PaymentButton
- [ ] Click "Comenzar lecciones"
- [ ] Puede ver todas las lecciones normalmente

**Curso de Pago (Sin Pagar):**
- [ ] Como estudiante, accede a un curso de pago
- [ ] Aparece pantalla: "🔒 Curso Premium"
- [ ] Muestra el precio (49.99 USD)
- [ ] Aparece PaymentButton
- [ ] Botón: "Comenzar lecciones" NO aparece
- [ ] NO pueden ver las lecciones
- [ ] Click "🔓 Pagar y Desbloquear Curso"
- [ ] Aparece modal de confirmación
- [ ] Muestra nombre del curso y precio
- [ ] Click "💳 Proceder a Pagar"
- [ ] Es redirigido a banco: `http://localhost:8080/...`

**Curso de Pago (Ya Pagó):**
- [ ] Después de simular pago confirmado en backend
- [ ] Recarga la página o navega nuevamente
- [ ] Aparece mensaje verde: "✅ Ya tienes acceso a este curso"
- [ ] Botón: "Comenzar lecciones" está disponible
- [ ] Puede ver todas las lecciones normalmente

### 5. Test - Responsive

- [ ] BankAccountForm se ve bien en móvil
- [ ] PaymentButton se ve bien en móvil
- [ ] CourseForm se ve bien en móvil
- [ ] Profile se ve bien en móvil

---

## 🔄 Testing del Flujo Completo

### Escenario 1: Estudiante Paga por Curso

1. [ ] Crea un curso de pago como docente
2. [ ] Registra cuenta bancaria como docente
3. [ ] Verifica la cuenta bancaria
4. [ ] Como estudiante, accede al curso
5. [ ] Intenta pagar
6. [ ] Es redirigido al banco
7. [ ] Simula confirmación de pago en backend
8. [ ] Estudiante ahora tiene acceso completo
9. [ ] Docente ve el pago en su historial
10. [ ] Docente ve el ingreso en sus ganancias

### Escenario 2: Reembolso

1. [ ] Completa el escenario 1
2. [ ] Como docente, ve el pago en `/payments/course/{id}`
3. [ ] Click "Reembolsar"
4. [ ] El pago cambia a status "refunded"
5. [ ] El estudiante pierde acceso al curso
6. [ ] Los ingresos se restan de las ganancias del docente

### Escenario 3: Payout

1. [ ] Completa el escenario 1 (con acceso confirmado)
2. [ ] Como docente, navega a Profile
3. [ ] Ve: "totalEarnings: 49.99"
4. [ ] Ve: "pendingPayouts: 49.99"
5. [ ] Click "Solicitar Payout"
6. [ ] Ingresa amount: 49.99
7. [ ] Mensaje: "✅ Payout solicitado exitosamente"
8. [ ] "pendingPayouts" se reduce a 0
9. [ ] "lastPayout" se actualiza con la fecha

---

## 🐛 Debugging

### Si algo no funciona:

**Backend no inicia:**
```bash
cd backend
npm install
npm start
# Verificar consola por errores
```

**Rutas no existen:**
```bash
# Verificar que están importadas en index.js
grep "paymentRoutes\|bankAccountRoutes" backend/index.js
```

**Modelos no se crean:**
```javascript
// En mongosh
use rumi
db.payments.find()
db.bankaccounts.find()
```

**Webhook no llega:**
```bash
# Verificar que URL es correcta
# Verificar headers incluyen Authorization
# Revisar logs del backend
```

**Token JWT inválido:**
```bash
# Asegurar que JWT_SECRET es el mismo en todos lados
# Generar nuevo token de prueba
```

---

## 📊 Checklist Final

### Antes de Producción

- [ ] Todos los tests anterior pasan
- [ ] No hay errores en consola (frontend ni backend)
- [ ] Variables `.env` están configuradas
- [ ] BD de MongoDB funciona
- [ ] Banco Java está integrado y funcionando
- [ ] CORS está configurado correctamente
- [ ] JWT_SECRET es seguro y largo
- [ ] BANK_API_KEY es seguro
- [ ] Email notifications funcionan
- [ ] HTTPS está habilitado en producción
- [ ] Logs están activos para debugging
- [ ] Backups de BD están configurados

### Documentación

- [ ] `MODULO_PAGOS_DOCUMENTACION.md` ✓
- [ ] `INTEGRACION_BANCO_JAVA.md` ✓
- [ ] `CONFIGURACION_ENV_PAGOS.md` ✓
- [ ] `RESUMEN_VISUAL_PAGOS.md` ✓
- [ ] Este checklist ✓

---

## ✅ Conclusión

Si todos los ítems están marcados ✓, el módulo de pagos está completamente funcional y listo para producción.

**Última actualización:** Enero 2026
