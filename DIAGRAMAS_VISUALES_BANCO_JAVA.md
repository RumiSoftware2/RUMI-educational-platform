# 🎨 DIAGRAMAS VISUALES - INTEGRACIÓN BANCO JAVA

Este documento contiene diagramas visuales del flujo de pagos.

---

## 🔄 FLUJO COMPLETO DE PAGOS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA GENERAL DEL SISTEMA                     │
└─────────────────────────────────────────────────────────────────────────┘

        FRONTEND (React)                BACKEND (Node.js)            BANCO (Java)
        ─────────────────               ─────────────────            ────────────

    ┌─────────────────┐
    │  Estudiante     │
    │  Click "Pagar"  │
    └────────┬────────┘
             │
             │ POST /api/payments/
             │ courses/{id}/pay
             │
             ├──────────────────────────►  ┌─────────────────────┐
             │                            │ Crear Pago          │
             │                            │ (MongoDB)           │
             │                            │ status: pending     │
             │                            └─────────┬───────────┘
             │                                      │
             │  Retorna: paymentId                  │
             │◄──────────────────────────────────────┤
             │         + bankPaymentUrl              │
             │                                       │
             │  Redirige a:                          │
             │  http://localhost:8080/api/           │
             │  transactions/initiate/{paymentId}    │
             │                                       │
             │                        ┌──────────────┴──────────┐
             │                        │                         │
             ├───────────────────────►│ ┌────────────────────┐  │
             │                        │ │ GET /initiate/     │  │
             │                        │ │ {paymentId}        │  │
             │                        │ └────────┬───────────┘  │
             │                        │          │              │
             │  Formulario de Pago    │  Obtener detalles       │
             │◄───────────────────────┤  del pago desde RUMI    │
             │                        │          │              │
             │ (Ingresa tarjeta)      │          │              │
             │                        │          │              │
             │                    ┌──┴──►POST /api/payments/   │
             │                    │   {paymentId}/confirm     │
             │                    │          │              │
             │ POST /api/          │          │  (Webhook)  │
             │ transactions/       │          │              │
             │ process             │          │              │
             │──────────────────────┼──────────┼──────────────┤
             │                     │  │       │              │
             │                     │  │  Procesar Pago        │
             │                     │  │  con Stripe/etc       │
             │                     │  │                       │
             │                     │  │  Generar              │
             │                     │  │  bankTransactionId    │
             │                     │  │                       │
             │                     │  │  Si exitoso:          │
             │                     │  │  POST a RUMI          │
             │                     │  │  (webhook)            │
             │                     │  │                       │
             │                     │  └──►┌──────────────────┐│
             │                     │      │ Update Payment   ││
             │                     │      │ status:completed ││
             │                     │      │ bankTransactionId││
             │                     │      └────────┬─────────┘│
             │                     │              │          │
             │  Confirmación       │              │          │
             │◄─────────────────────┤──────────────┤──────────┘
             │  success: true       │              │
             │                      │              │
             └──────────────────────┴──────────────┘

                   ✅ ESTUDIANTE TIENE ACCESO AL CURSO
```

---

## 📊 FLUJO DE DATOS - DETALLADO

```
┌──────────────────────────────────────────────────────────────────────┐
│                     1️⃣ INICIO - CREAR PAGO                          │
└──────────────────────────────────────────────────────────────────────┘

Frontend (React)
    ↓
    POST /api/payments/courses/{courseId}/pay
    Headers: Authorization: Bearer {STUDENT_TOKEN}
    ↓
Backend (Node.js) CREA PAGO
    ↓
    MongoDB Payment Document:
    ┌─────────────────────────────────────┐
    │ _id: "507f1f77bcf86cd799439011"    │ ← paymentId
    │ course: "507f1f77bcf86cd799439012" │
    │ student: "507f1f77bcf86cd799439013"│
    │ teacher: "507f1f77bcf86cd799439014"│
    │ amount: 49.99                       │
    │ currency: "USD"                     │
    │ status: "pending"                   │
    │ transactionId: "TXN-1704538..."     │
    │ bankTransactionId: null             │
    │ paidAt: null                        │
    └─────────────────────────────────────┘
    ↓
    Retorna Response:
    {
      "message": "Pago iniciado",
      "payment": { ... },
      "bankPaymentUrl": 
        "http://localhost:8080/api/transactions/
         initiate/507f1f77bcf86cd799439011"
    }
    ↓
Frontend recibe respuesta
    ↓
    window.location.href = bankPaymentUrl
    ↓
✅ Estudiante es redirigido a Tu Banco Java


┌──────────────────────────────────────────────────────────────────────┐
│                  2️⃣ MOSTRAR PANTALLA DE PAGO                        │
└──────────────────────────────────────────────────────────────────────┘

Tu Banco Java Recibe:
    ↓
    GET /api/transactions/initiate/{paymentId}
    GET /api/transactions/initiate/507f1f77bcf86cd799439011
    ↓
TÚ DEBES:
    1. Extraer paymentId de la URL
    2. Hacer GET a RUMI para obtener detalles del pago
       GET /api/payments/{paymentId}/status
       Headers: Authorization: Bearer {BANK_API_KEY}
    3. Mostrar pantalla de pago (HTML form)
    4. Esperar que estudiante ingrese datos de tarjeta

Response que retornas:
    {
      "paymentId": "507f1f77bcf86cd799439011",
      "amount": 49.99,
      "currency": "USD",
      "courseName": "Python Avanzado",
      "studentEmail": "juan@example.com",
      "message": "Por favor ingresa tus datos de pago"
    }
    ↓
✅ Estudiante ve pantalla con formulario de tarjeta


┌──────────────────────────────────────────────────────────────────────┐
│                 3️⃣ PROCESAR PAGO EN BANCO JAVA                      │
└──────────────────────────────────────────────────────────────────────┘

Frontend Envía Datos:
    ↓
    POST /api/transactions/process
    {
      "paymentId": "507f1f77bcf86cd799439011",
      "cardNumber": "4111111111111111",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "cvv": "123",
      "cardHolder": "Juan Pérez",
      "studentEmail": "juan@example.com"
    }
    ↓
Tu Banco Java Recibe:
    1. Validar datos
    2. Generar ID único: bankTransactionId
       Ej: "BANK-TXN-1704538200000-A1B2C3D4"
    3. Procesar con Stripe/MercadoPago/etc
    4. Si exitoso: status = "completed"
       Si falla: status = "failed"
    ↓
IMPORTANTE: ⭐ HACER POST A RUMI ⭐
    ↓
    POST /api/payments/{paymentId}/confirm
    URL: http://localhost:3000/api/payments/
         507f1f77bcf86cd799439011/confirm
    
    Headers:
      Content-Type: application/json
      Authorization: Bearer sk_rumi_bank_20260114_...
    
    Body:
    {
      "bankTransactionId": "BANK-TXN-1704538200000-A1B2C3D4",
      "status": "completed",
      "amount": 49.99,
      "currency": "USD",
      "timestamp": "2026-01-14T10:30:00Z"
    }
    ↓
RUMI Recibe Confirmación y:
    1. Actualiza Payment.status → "completed"
    2. Guarda bankTransactionId
    3. Agrega estudiante a course.paidStudents
    4. Suma $49.99 a earnings del docente
    ↓
Respuesta de RUMI (HTTP 200):
    {
      "message": "Pago confirmado exitosamente",
      "payment": {
        "_id": "507f1f77bcf86cd799439011",
        "status": "completed",
        "paidAt": "2026-01-14T10:30:00.000Z"
      }
    }
    ↓
✅ PAGO COMPLETADO
```

---

## 💰 FLUJO DE DINERO

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO FINANCIERO                         │
└─────────────────────────────────────────────────────────────┘

PASO 1: Estudiante Paga
┌──────────────────┐
│ Estudiante       │
│ $49.99           │
└────────┬─────────┘
         │ tarjeta
         ↓
┌──────────────────┐
│ Tu Banco Java    │ ← Procesa transacción
│ Procesa pago     │
└────────┬─────────┘
         │
         ↓

PASO 2: Dinero Ingresa a RUMI
┌──────────────────────┐
│ Cuenta RUMI          │
│ Balance: +$49.99     │
└────────┬─────────────┘
         │
         ↓

PASO 3: Ganancias del Docente
┌──────────────────────────────────┐
│ BankAccount (Docente)            │
│ totalEarnings: +$49.99           │
│ pendingPayouts: +$49.99          │
│ course: "Python Avanzado"        │
│ student: "Juan Pérez"            │
└────────┬─────────────────────────┘
         │
         ↓

PASO 4: Docente Solicita Payout
┌──────────────────────────────────┐
│ POST /bank-accounts/payouts/     │
│ request                          │
│ amount: $49.99                   │
└────────┬─────────────────────────┘
         │
         ↓

PASO 5: Tu Banco Transfiere
┌──────────────────────────────────┐
│ Tu Banco Java                    │
│ Procesa transferencia a:         │
│ - Titular: Dr. García            │
│ - Cuenta: XXXXX1234             │
│ - Monto: $49.99                  │
│ - Banco: Banco del Estado        │
└────────┬─────────────────────────┘
         │
         ↓

PASO 6: Docente Recibe Dinero
┌──────────────────┐
│ Docente          │
│ Dinero depositado│
└──────────────────┘

NOTA: En este ejemplo simplificado, RUMI actúa como intermediario
que recibe el dinero de los estudiantes y luego lo transfiere a 
los docentes. En producción, puede haber comisión de RUMI (5-10%).
```

---

## 🔄 MÁQUINA DE ESTADOS - PAYMENT

```
┌──────────────────────────────────────────────────────────────────┐
│                 ESTADOS DE UN PAGO                              │
└──────────────────────────────────────────────────────────────────┘

                          CREADO
                            │
                            ↓
                    [pending] ◇
                     (esperando)
                            │
                    ┌───────┴───────┐
                    │               │
          (procesado exitosamente)  (error)
                    │               │
                    ↓               ↓
              [completed]      [failed]
               ✅ Éxito        ❌ Rechazado
                    │               │
                    │          (puedo reintentar)
                    │               │
                    ├───────────────┘
                    │
                    ↓ (opcionalmente)
              [refunded]
             💵 Reembolsado


TRANSICIONES PERMITIDAS:
✅ pending    → completed  (pago exitoso)
✅ pending    → failed     (pago rechazado)
✅ completed  → refunded   (docente solicita reembolso)
❌ completed  → pending    (NO permitido - pago final)
❌ failed     → completed  (NO permitido - pago rechazado)
```

---

## 🏗️ MODELO DE DATOS

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTO PAYMENT                            │
└─────────────────────────────────────────────────────────────────┘

Payment (MongoDB Collection)
├── _id: ObjectId
│   └─ Identificador único del pago en RUMI
│
├── course: ObjectId
│   └─ Referencia al curso que se está pagando
│
├── student: ObjectId
│   └─ Estudiante que realiza el pago
│
├── teacher: ObjectId
│   └─ Docente que recibirá el dinero
│
├── amount: Decimal
│   └─ Monto a pagar (ej: 49.99)
│
├── currency: String
│   └─ Moneda (USD, COP, MXN, ARS)
│
├── status: String
│   └─ Estado actual (pending, completed, failed, refunded)
│
├── paymentMethod: String
│   └─ Método de pago (credit_card, debit_card, wallet)
│
├── transactionId: String
│   └─ ID de transacción de RUMI (TXN-1704538200000-a1b2c3d4e)
│
├── bankTransactionId: String ⭐ TÚ ASIGNAS ESTO
│   └─ ID de transacción de tu banco (BANK-TXN-20260114-001234)
│
├── paidAt: Date
│   └─ Fecha cuando se completó el pago
│
├── createdAt: Date
│   └─ Fecha de creación del pago
│
└── updatedAt: Date
    └─ Última actualización


┌─────────────────────────────────────────────────────────────────┐
│               DOCUMENTO BANK_TRANSACTION (Tu BD)                │
└─────────────────────────────────────────────────────────────────┘

BankTransaction (MySQL/BD del Banco)
├── id: String (PK)
│   └─ BANK-TXN-1704538200000-A1B2C3D4
│
├── paymentId: String (FK, UNIQUE)
│   └─ 507f1f77bcf86cd799439011 (referencia a RUMI)
│
├── amount: Decimal
│   └─ 49.99
│
├── currency: String
│   └─ USD
│
├── status: String
│   └─ completed, failed, pending
│
├── cardLastFour: String
│   └─ 1111 (últimos dígitos, no guardar tarjeta completa)
│
├── studentEmail: String
│   └─ juan@example.com
│
├── studentName: String
│   └─ Juan Pérez
│
├── courseTitle: String
│   └─ Python Avanzado
│
├── errorMessage: Text
│   └─ Si falló: "Fondos insuficientes" o null
│
├── createdAt: Timestamp
│   └─ 2026-01-14 10:25:00
│
└── updatedAt: Timestamp
    └─ 2026-01-14 10:30:00
```

---

## 🔀 SECUENCIA DE LLAMADAS HTTP

```
┌────────────────────────────────────────────────────────────────┐
│                  SECUENCIA TEMPORAL                            │
└────────────────────────────────────────────────────────────────┘

Tiempo    Actor           Acción

T0:00     Estudiante      Click en "Pagar Curso"

T0:01     Frontend React  POST http://localhost:3000/api/
                          payments/courses/{id}/pay

T0:02     Backend Node    Crea Payment en MongoDB
                          status: "pending"

T0:03     Backend Node    Retorna paymentId + bankPaymentUrl

T0:04     Frontend React  window.location.href = bankPaymentUrl
                          (redirige a Tu Banco)

T0:05     Frontend React  GET http://localhost:8080/api/
                          transactions/initiate/{paymentId}

T0:06     Tu Banco Java   GET /api/payments/{paymentId}/status
                          desde RUMI para obtener detalles

T0:07     RUMI Backend    Retorna detalles del pago

T0:08     Tu Banco Java   Retorna HTML/JSON con formulario

T0:09     Frontend React  Muestra pantalla de pago
                          (formulario de tarjeta)

T1:00     Estudiante      Ingresa datos de tarjeta

T1:01     Frontend React  POST http://localhost:8080/api/
                          transactions/process
                          (envía datos de tarjeta)

T1:02     Tu Banco Java   Procesa con Stripe/MercadoPago
                          Genera bankTransactionId

T1:03     Tu Banco Java   POST http://localhost:3000/api/
                          payments/{paymentId}/confirm
                          (WEBHOOK a RUMI)

T1:04     RUMI Backend    Recibe confirmación
                          Actualiza Payment.status = "completed"
                          Agrega a course.paidStudents
                          Suma a BankAccount.totalEarnings

T1:05     Tu Banco Java   Retorna respuesta al Frontend

T1:06     Frontend React  Recibe success: true
                          Redirige a curso

T2:00     Estudiante      Ya tiene acceso al curso
                          ✅ Puede ver todas las lecciones
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```
┌────────────────────────────────────────────────────────────────┐
│           VALIDACIÓN DE REQUESTS - HEADERS                     │
└────────────────────────────────────────────────────────────────┘

1. Cuando Frontend hace POST /api/payments/courses/{id}/pay

   Headers:
   ├── Authorization: Bearer {STUDENT_TOKEN}  ← Token JWT del estudiante
   ├── Content-Type: application/json
   └── User-Agent: Mozilla/5.0...

   Backend RUMI valida:
   ✅ Token es válido
   ✅ Usuario es estudiante
   ✅ Curso existe
   ✅ No ha pagado antes


2. Cuando Tu Banco hace POST /api/payments/{paymentId}/confirm

   Headers:
   ├── Authorization: Bearer sk_rumi_bank_20260114_...  ← BANK_API_KEY
   ├── Content-Type: application/json
   └── User-Agent: Java-HttpClient/11

   RUMI Backend valida:
   ✅ API Key es válida
   ✅ Signature del webhook es correcta
   ✅ paymentId existe
   ✅ No es una duplicación


3. Cuando Tu Banco hace GET /api/payments/{paymentId}/status

   Headers:
   ├── Authorization: Bearer sk_rumi_bank_20260114_...  ← BANK_API_KEY
   └── User-Agent: Java-HttpClient/11

   RUMI Backend valida:
   ✅ API Key es válida
   ✅ paymentId existe
   └─ Retorna información del pago
```

---

## 📍 MAPA DE URLS

```
┌────────────────────────────────────────────────────────────────┐
│                   UBICACIÓN DE SERVICIOS                       │
└────────────────────────────────────────────────────────────────┘

DESARROLLO:

Frontend (React):
  URL: http://localhost:5173
  Método: GET
  Muestra: Interfaz de usuario

Backend RUMI (Node.js):
  URL: http://localhost:3000/api
  Métodos: GET, POST, PUT, DELETE
  Endpoints: /payments, /courses, /users, etc.

Tu Banco (Java):
  URL: http://localhost:8080/api
  Métodos: GET, POST
  Endpoints: /transactions/initiate, /transactions/process, etc.


PRODUCCIÓN (EJEMPLO):

Frontend:
  URL: https://rumieducation.vercel.app
  Método: GET

Backend:
  URL: https://rumi-backend.tudominio.com/api
  Métodos: GET, POST, PUT, DELETE

Tu Banco:
  URL: https://banco.tudominio.com/api
  Métodos: GET, POST
```

---

## ⚡ VELOCIDADES ESPERADAS

```
┌────────────────────────────────────────────────────────────────┐
│                   TIMING DE OPERACIONES                        │
└────────────────────────────────────────────────────────────────┘

Operación                          Tiempo Esperado    Max Timeout
─────────────────────────────────  ──────────────────  ──────────
Frontend → Backend (crear pago)    100-300ms          2s
Backend → Frontend (retorna)       50-100ms           1s
Frontend → Banco (initiate)        200-500ms          3s
Banco → RUMI (obtener detalles)    300-800ms          10s
Banco → Proveedor pagos (Stripe)   1-3s               10s
Banco → RUMI (webhook confirm)     500-1500ms         30s
Total pago (inicio a fin)          5-10s              30s


RETRIES RECOMENDADOS:

Si POST a RUMI falla:
  └─ Reintentar después de 5 segundos
  └─ Máximo 3 intentos
  └─ Si aún falla: Marcar para revisión manual y loguear
```

---

**Documento Visual v1.0**  
**Última actualización: 14 de Enero de 2026**
