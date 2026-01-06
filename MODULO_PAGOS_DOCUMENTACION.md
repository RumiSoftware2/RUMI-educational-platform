# Sistema de Pagos RUMI - Documentación Técnica

## Overview

Se ha implementado un **sistema completo de pagos** para RUMI que permite:

1. **Docentes**: Crear cursos de pago y recibir ingresos
2. **Estudiantes**: Pagar para acceder a cursos de pago
3. **Administradores**: Gestionar pagos y hacer reembolsos

---

## 📦 Componentes Implementados

### Backend

#### Modelos Creados

**1. `models/Payment.js`** - Registro de pagos
```javascript
- course: ID del curso
- student: ID del estudiante
- teacher: ID del docente
- amount: Monto del pago
- currency: Moneda (USD, COP, MXN, ARS)
- status: pending, processing, completed, failed, refunded
- transactionId: ID único de la transacción
- bankTransactionId: ID del banco en Java
- paidAt: Fecha de pago
```

**2. `models/BankAccount.js`** - Cuentas bancarias de docentes
```javascript
- teacher: ID del docente
- accountHolder: Titular de la cuenta
- accountNumber: Número de cuenta
- accountType: checking | savings
- bankName: Nombre del banco
- bankCode: Código del banco
- routingNumber: Número de ruta
- country: País de la cuenta
- isVerified: Si la cuenta fue verificada
- totalEarnings: Ganancias totales
- pendingPayouts: Pendientes de pago
- lastPayout: Último pago realizado
```

**3. `models/Course.js`** - Modificado para soporte de pagos
```javascript
- isPaid: Boolean - Si es un curso de pago
- price: Número - Precio del curso
- currency: Moneda del precio
- paidStudents: Array de estudiantes que pagaron
  - student: ID del estudiante
  - paidAt: Fecha del pago
  - transactionId: ID de la transacción
```

#### Controladores Creados

**1. `controllers/paymentController.js`**
- `createPayment()` - Inicia un pago
- `confirmPayment()` - Confirma pago desde webhook del banco
- `getStudentPayments()` - Historial de pagos del estudiante
- `getCoursePayments()` - Pagos de un curso (docente)
- `getPaymentStatus()` - Estado de un pago específico
- `hasStudentPaid()` - Verifica si un estudiante pagó un curso
- `getTeacherEarnings()` - Ingresos totales del docente
- `refundPayment()` - Reembolsa un pago

**2. `controllers/bankAccountController.js`**
- `createOrUpdateBankAccount()` - Registrar datos bancarios
- `getBankAccount()` - Obtener cuenta del docente
- `verifyBankAccount()` - Iniciar verificación
- `confirmBankAccountVerification()` - Confirmar código de verificación
- `getPayoutStatus()` - Estado de pagos pendientes
- `requestPayout()` - Solicitar un payout

#### Rutas Creadas

**1. `routes/paymentRoutes.js`**
```
POST   /payments/courses/:courseId/pay           - Crear pago (estudiante)
POST   /payments/:paymentId/confirm              - Confirmar pago (webhook)
GET    /payments/student/history                 - Historial de estudiante
GET    /payments/course/:courseId                - Pagos de un curso
GET    /payments/:paymentId/status               - Estado de pago
GET    /payments/courses/:courseId/has-paid      - Verificar si pagó
GET    /payments/teacher/earnings                - Ingresos del docente
POST   /payments/:paymentId/refund               - Reembolsar pago
```

**2. `routes/bankAccountRoutes.js`**
```
POST   /bank-accounts/                           - Crear/actualizar cuenta
GET    /bank-accounts/                           - Obtener cuenta
POST   /bank-accounts/verify/send-code           - Enviar código verificación
POST   /bank-accounts/verify/confirm-code        - Confirmar verificación
GET    /bank-accounts/payouts/status             - Estado de payouts
POST   /bank-accounts/payouts/request            - Solicitar payout
```

### Frontend

#### Componentes Creados

**1. `components/BankAccountForm.jsx`**
- Formulario para docentes para registrar datos bancarios
- Verificación de cuenta mediante código enviado por correo
- Mostrar datos bancarios guardados
- Integrado en el perfil del docente

**2. `components/PaymentButton.jsx`**
- Botón de pago para estudiantes en cursos pagados
- Verifica si el estudiante ya pagó
- Interfaz de confirmación de pago
- Redirige al sistema de pagos del banco Java

#### Páginas Modificadas

**1. `pages/CourseForm.jsx`**
Agregado:
- Checkbox para marcar si es un curso de pago
- Input para el precio del curso
- Selector de moneda (USD, COP, MXN, ARS)
- Información sobre limitaciones de cursos pagados

**2. `pages/Profile.jsx`**
Agregado:
- Import del componente `BankAccountForm`
- Mostrar el formulario solo para docentes
- Mejor estructura visual del perfil

**3. `pages/StudentCourseDetail.jsx`**
Agregado:
- Import del componente `PaymentButton`
- Verificación de pago al cargar el curso
- Pantalla diferente si es curso de pago sin pagar
- Solo muestra video introductorio para cursos pagados sin acceso
- `hasPaid` state para control de acceso

---

## 🔄 Flujo de Pagos

### Flujo del Docente (Crear Curso de Pago)

1. Docente va a crear curso
2. Marca opción "¿Es un curso de pago?"
3. Ingresa precio y moneda
4. Crea el curso
5. **Opcionalmente**: En perfil, registra datos bancarios
6. Verifica su cuenta bancaria (para recibir pagos)
7. Puede ver ingresos en `/payments/teacher/earnings`

### Flujo del Estudiante (Pagar por Curso)

1. Estudiante accede a un curso de pago
2. Ve video introductorio (sin acceso a lecciones)
3. Click en botón "Pagar y Desbloquear Curso"
4. Confirma el pago
5. Es redirigido al sistema de pagos del banco Java
6. Completa pago en el banco
7. Banco envía webhook a `/payments/:paymentId/confirm`
8. Se confirma el pago y se habilita acceso al curso
9. Se agrega a `course.paidStudents`
10. Ingresos se registran en cuenta bancaria del docente
11. Estudiante ya puede ver todas las lecciones

### Flujo de Payout (Docente Retira Ganancias)

1. Docente tiene ganancias pendientes en BankAccount
2. Verifica su cuenta bancaria
3. Solicita un payout de sus ganancias
4. El monto se resta de `pendingPayouts`
5. Se procesa desde el sistema de banco en Java
6. Dinero es transferido a la cuenta bancaria registrada

---

## 🏦 Integración con Banco en Java

### Variables de Entorno (Backend)

```env
BANK_API_URL=http://localhost:8080/api
BANK_API_KEY=your-api-key
```

### Webhook del Banco

El banco en Java debe hacer un POST a:
```
POST /api/payments/:paymentId/confirm
Body:
{
  "bankTransactionId": "BANK-TXN-123456",
  "status": "completed" | "failed"
}
```

### Datos Enviados al Banco

Cuando se inicia un pago, se crea un registro con:
- `transactionId`: ID único de RUMI (TXN-timestamp-random)
- `amount`: Monto a pagar
- `currency`: Moneda
- `student`: ID del estudiante
- `course`: ID del curso

El sistema devuelve:
```json
{
  "message": "Pago iniciado",
  "payment": { /* Payment object */ },
  "bankPaymentUrl": "http://localhost:8080/api/transactions/initiate/{paymentId}"
}
```

### Integración en Código

**En `paymentController.js`:**
```javascript
const BANK_API_URL = process.env.BANK_API_URL || 'http://localhost:8080/api';
const BANK_API_KEY = process.env.BANK_API_KEY || 'your-api-key';
```

Se puede expandir para:
- Validar pagos directamente con el banco
- Sincronizar estados de transacciones
- Procesar reembolsos automáticos

---

## 🔐 Seguridad

1. **Verificación de Autenticación**: Todas las rutas de pago requieren `authMiddleware`
2. **Verificación de Rol**: Se valida que solo docentes puedan tener cuentas bancarias
3. **Datos Sensibles**: Los números de cuenta se ocultan (solo últimos 4 dígitos)
4. **Tokens Únicos**: Cada transacción tiene un ID único
5. **Códigos de Verificación**: Expiran después de 24 horas
6. **Intentos Limitados**: Máximo 3 intentos para confirmar código

---

## 📊 Monedas Soportadas

- **USD** - Dólares estadounidenses
- **COP** - Pesos colombianos
- **MXN** - Pesos mexicanos
- **ARS** - Pesos argentinos

Puede expandirse fácilmente en los enums de los modelos.

---

## 🚀 Cómo Usar

### Para Docentes

1. **Crear Curso de Pago:**
   - Ir a "Crear Curso"
   - Marcar "¿Es un curso de pago?"
   - Ingresar precio y moneda
   - Guardar

2. **Registrar Cuenta Bancaria:**
   - Ir a Perfil
   - Rellenar formulario de Información Bancaria
   - Hacer clic en "Verificar Cuenta"
   - Ingresar código de verificación enviado por correo

3. **Ver Ingresos:**
   - En el perfil, ver ganancias totales y pendientes

### Para Estudiantes

1. **Ver Cursos Pagados:**
   - Los cursos de pago muestran el precio
   - Solo video introductorio visible sin pagar

2. **Pagar por un Curso:**
   - Click en "Pagar y Desbloquear Curso"
   - Confirmar el pago
   - Será redirigido al banco
   - Después de pagar, tendrá acceso total

---

## 📝 Notas Importantes

1. **Video Introductorio**: Es el primer video del curso, siempre visible
2. **Acceso de Lecciones**: Solo se muestran si el estudiante pagó
3. **Payouts**: Requiere cuenta verificada
4. **Reembolsos**: Solo pueden hacerlos docentes y admins
5. **Histórico**: Todos los pagos quedan registrados

---

## 🔧 Próximas Mejoras

- [ ] Email automático de confirmación de pago
- [ ] Dashboard de pagos para docentes
- [ ] Descuentos y códigos promocionales
- [ ] Pagos recurrentes/suscripciones
- [ ] Integración con más sistemas de pago
- [ ] Reportes de ingresos en PDF
- [ ] SMS de confirmación de pago

---

## 📞 Soporte

Para preguntas sobre la integración del banco en Java, contactar al equipo de desarrollo.

**Último actualizado:** Enero 2026
