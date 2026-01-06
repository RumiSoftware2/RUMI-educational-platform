# 🎯 RESUMEN VISUAL - Módulo de Pagos RUMI

## 📊 Arquitectura del Sistema de Pagos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ESTUDIANTE (Cliente)                           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  StudentCourseDetail│
                    │  (PaymentButton)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   POST /payments/courses   │
                    │   /{courseId}/pay          │
                    └──────────┬──────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
        ▼                                             ▼
   ┌─────────────┐                         ┌──────────────────┐
   │   MongoDB   │                         │  RUMI Backend    │
   │  (Payments  │◄─────────────────────────  (Port 3000)     │
   │   Records)  │                         └──────────────────┘
   └─────────────┘                                  │
                                                    │
                                     ┌──────────────▼──────────────┐
                                     │   paymentController.js      │
                                     │  - createPayment()          │
                                     │  - confirmPayment()         │
                                     │  - hasStudentPaid()         │
                                     └──────────────┬──────────────┘
                                                    │
                                    Redirección a: │
                                    bankPaymentUrl │
                                                    │
                    ┌───────────────────────────────▼───────────────────┐
                    │         BANCO JAVA (Puerto 8080)                  │
                    │  ┌──────────────────────────────────────────────┐ │
                    │  │ - Procesa pago                               │ │
                    │  │ - Valida tarjeta                             │ │
                    │  │ - Crea transacción (BANK-TXN-...)            │ │
                    │  │ - Almacena en BD del banco                   │ │
                    │  └──────────────────────────────────────────────┘ │
                    └───────────────────┬────────────────────────────────┘
                                        │
                      Webhook Response: │
                      POST /payments/   │
                      {paymentId}/confirm
                                        │
                    ┌───────────────────▼─────────────────────┐
                    │    RUMI confirmPayment()                │
                    │    ✓ Actualiza status: completed        │
                    │    ✓ Agrega a course.paidStudents       │
                    │    ✓ Actualiza BankAccount.totalEarnings│
                    └───────────────────┬─────────────────────┘
                                        │
            ┌───────────────────────────┴───────────────────────────┐
            │                                                       │
            ▼                                                       ▼
   ┌─────────────────────┐                             ┌──────────────────┐
   │  course.paidStudents│                             │  BankAccount     │
   │  [Estudiante añadido]                             │  totalEarnings ↑ │
   └─────────────────────┘                             │  pendingPayouts↑ │
                                                       └──────────────────┘
```

---

## 🔄 Flujos de Usuario

### Flujo 1: DOCENTE - Crear Curso de Pago

```
DOCENTE
   │
   └─ CourseForm
       │
       ├─ Título: "JavaScript Avanzado"
       ├─ Video: (URL YouTube)
       ├─ Descripción: "..."
       │
       ├─ ✓ ¿Es curso de pago? → SÍ
       ├─ Precio: 49.99
       └─ Moneda: USD
            │
            └─ POST /api/courses
                 │
                 └─ Curso creado con:
                    - isPaid: true
                    - price: 49.99
                    - currency: USD
                    - students: []
                    - paidStudents: []
```

### Flujo 2: DOCENTE - Registrar Cuenta Bancaria

```
DOCENTE
   │
   └─ Profile
       │
       └─ BankAccountForm
           │
           ├─ Titular: "Juan García"
           ├─ Número: "1234567890"
           ├─ Banco: "Banco de Bogotá"
           ├─ Tipo: "Corriente"
           │
           └─ POST /api/bank-accounts
               │
               ├─ Guardada en BankAccount
               │
               ├─ Click "Verificar Cuenta"
               │   └─ Email: Código enviado
               │
               └─ Ingresa código
                   └─ POST /api/bank-accounts/verify/confirm-code
                       │
                       └─ isVerified: true ✓
```

### Flujo 3: ESTUDIANTE - Pagar por Curso

```
ESTUDIANTE
   │
   └─ StudentCourseDetail (curso pagado)
       │
       ├─ Puede ver:
       │  ✓ Video introductorio
       │  ✓ Descripción
       │
       ├─ NO puede ver:
       │  ✗ Lecciones
       │  ✗ Quiz
       │
       └─ Click "Pagar y Desbloquear"
           │
           ├─ POST /api/payments/courses/{courseId}/pay
           │   │
           │   └─ Crea Payment:
           │      - status: "pending"
           │      - transactionId: "TXN-..."
           │      - amount: 49.99
           │
           └─ Redirección a Banco Java
               │
               ├─ Ingresa datos de tarjeta
               ├─ Banco procesa pago
               │
               └─ Webhook POST /payments/{paymentId}/confirm
                   │
                   └─ ✓ Payment status → "completed"
                      ✓ Estudiante añadido a course.paidStudents
                      ✓ Docente gana dinero (BankAccount.totalEarnings ↑)
                      ✓ Estudiante ahora VE todas las lecciones
```

---

## 💾 Modelos de Base de Datos

### Course (Modificado)
```javascript
{
  _id: ObjectId,
  title: "JavaScript Avanzado",
  description: "...",
  teacher: ObjectId,
  videoUrl: "https://...",
  lessons: [...],
  students: [ObjectId, ObjectId],    // Inscritos (todos)
  
  // NUEVO: Soporte para pagos
  isPaid: true,
  price: 49.99,
  currency: "USD",
  paidStudents: [
    {
      student: ObjectId,
      paidAt: Date,
      transactionId: "BANK-TXN-..."
    }
  ]
}
```

### Payment (Nuevo)
```javascript
{
  _id: ObjectId,
  course: ObjectId,
  student: ObjectId,
  teacher: ObjectId,
  amount: 49.99,
  currency: "USD",
  status: "completed",              // pending, processing, completed, failed, refunded
  paymentMethod: "credit_card",
  transactionId: "TXN-...",
  bankTransactionId: "BANK-TXN-...",
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### BankAccount (Nuevo)
```javascript
{
  _id: ObjectId,
  teacher: ObjectId,                // Relación 1:1
  accountHolder: "Juan García",
  accountNumber: "****7890",        // Encriptada en producción
  accountType: "checking",
  bankName: "Banco de Bogotá",
  bankCode: "012",
  routingNumber: "011000015",
  country: "CO",
  isVerified: true,
  totalEarnings: 599.99,
  pendingPayouts: 599.99,
  lastPayout: Date
}
```

---

## 🔐 Flujo de Dinero

```
ESTUDIANTE
   │ paga
   ▼
┌─────────────────────────┐
│  BANCO JAVA             │
│  (Procesa Transacción)  │
└──────────┬──────────────┘
           │
           ├─ Descuenta de tarjeta del estudiante
           │
           └─ Acumula dinero en:
               ┌────────────────────────────────┐
               │  Cuenta Maestra de RUMI        │
               │  (ej: banco.rumi@banco.com)    │
               └────────────────────────────────┘
                        │
                        ├─ 95% → Docente (menos comisión)
                        └─ 5% → RUMI (comisión)
                            │
                            ▼
                    ┌──────────────────┐
                    │  BankAccount     │
                    │ totalEarnings ↑  │
                    │ pendingPayouts ↑ │
                    └──────────────────┘
                            │
                    Docente solicita:
                    POST /bank-accounts/
                    payouts/request
                            │
                            ▼
                    ┌──────────────────┐
                    │  BANCO JAVA      │
                    │  (Procesa Payout)│
                    └──────────────────┘
                            │
                            ▼
                    Transferencia a:
                    Cuenta Bancaria del Docente
```

---

## 📋 Acceso a Funcionalidades

### Estudiante - Curso GRATUITO
- ✅ Ver video introductorio
- ✅ Ver todas las lecciones
- ✅ Hacer quizzes
- ✅ Ver feedback

### Estudiante - Curso PAGADO (No pagó)
- ✅ Ver video introductorio
- ✅ Ver PaymentButton
- ❌ Ver lecciones
- ❌ Hacer quizzes
- ❌ Ver feedback

### Estudiante - Curso PAGADO (Pagó)
- ✅ Ver video introductorio
- ✅ Ver todas las lecciones
- ✅ Hacer quizzes
- ✅ Ver feedback

### Docente - Sus Cursos
- ✅ Ver cursos creados
- ✅ Ver estudiantes inscritos
- ✅ Ver pagos recibidos (si es pago)
- ✅ Ver ingresos totales
- ✅ Solicitar payouts
- ✅ Reembolsar pagos

### Admin
- ✅ Ver todos los pagos
- ✅ Hacer reembolsos
- ✅ Ver estadísticas de ingresos
- ✅ Ver cuentas bancarias

---

## 🚀 Endpoints Rápido

### Pagos
```
POST   /api/payments/courses/{courseId}/pay
POST   /api/payments/{paymentId}/confirm (webhook)
GET    /api/payments/student/history
GET    /api/payments/course/{courseId}
GET    /api/payments/{paymentId}/status
GET    /api/payments/courses/{courseId}/has-paid
GET    /api/payments/teacher/earnings
POST   /api/payments/{paymentId}/refund
```

### Cuentas Bancarias
```
POST   /api/bank-accounts
GET    /api/bank-accounts
POST   /api/bank-accounts/verify/send-code
POST   /api/bank-accounts/verify/confirm-code
GET    /api/bank-accounts/payouts/status
POST   /api/bank-accounts/payouts/request
```

---

## 🔗 Integraciones Externas

```
┌───────────────┐
│ RUMI Frontend │ (React/Vite)
│ Port 5173     │
└───────┬───────┘
        │ HTTP/CORS
        ▼
┌───────────────────────┐
│  RUMI Backend         │ (Node.js/Express)
│  Port 3000            │
│  - Controllers        │
│  - Routes             │
│  - Models             │
└───────┬───────────────┘
        │ HTTP API Calls
        ▼
┌────────────────────┐         ┌──────────────┐
│  MongoDB           │         │  BANCO JAVA  │
│  (Base de datos)   │◄────────│  Port 8080   │
└────────────────────┘ Webhooks└──────────────┘
```

---

## 📞 Contacto y Documentación

Para más detalles, consulta:
- `MODULO_PAGOS_DOCUMENTACION.md` - Documentación completa
- `INTEGRACION_BANCO_JAVA.md` - Integración con banco
- `CONFIGURACION_ENV_PAGOS.md` - Variables de entorno

---

**Sistema completamente funcional y listo para integración con banco Java**
**Última actualización:** Enero 2026
