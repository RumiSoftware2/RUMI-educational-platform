# 📊 SISTEMA DE PAGOS RUMI - Documentación Completa

## 📁 ARCHIVOS IMPLICADOS EN EL SISTEMA DE PAGOS

---

## 🔴 BACKEND

### 1. **Modelos (Models)**

#### `backend/models/Payment.js`
**Propósito:** Modelo de datos para transacciones de pago

**Campos principales:**
- `student`: ID del estudiante (referencia a User)
- `course`: ID del curso (referencia a Course)
- `amount`: Monto del pago
- `currency`: Moneda (default: 'USD')
- `status`: Estado del pago ['pending', 'completed', 'failed', 'refunded']
- `paymentMethod`: Método de pago ['stripe', 'paypal', 'manual']
- `transactionId`: ID único de la transacción
- `paymentDate`: Fecha del pago
- **Distribución de ganancias:**
  - `stripeFee`: Comisión de Stripe (2.9% + $0.30)
  - `platformFee`: Comisión de la plataforma (10%)
  - `teacherAmount`: Cantidad para el docente (87.1%)
  - `platformPercentage`: Porcentaje de la plataforma (default: 10%)
- **Información de Stripe:**
  - `stripePaymentIntentId`: ID del Payment Intent
  - `stripeTransferId`: ID de la transferencia a la cuenta del docente
- `metadata`: Metadatos adicionales

#### `backend/models/Course.js`
**Campos relacionados con pagos:**
- `price`: Precio del curso (Number, default: 0)
- `isPaidCourse`: Boolean que indica si el curso es de pago (default: false)
- `paidFromLesson`: Número de lección desde la cual se requiere pago (Number, default: null)

#### `backend/models/User.js`
**Campos relacionados con pagos (solo para docentes):**
- `stripeAccountId`: ID de la cuenta Stripe Connect del docente
- `stripeAccountStatus`: Estado de la cuenta ['pending', 'active', 'restricted', 'disabled']
- `totalEarnings`: Ganancias totales acumuladas
- `monthlyEarnings`: Ganancias del mes actual

---

### 2. **Servicios (Services)**

#### `backend/services/stripeService.js`
**Propósito:** Servicio centralizado para todas las operaciones con Stripe

**Métodos principales:**

1. **`isStripeConfigured()`**
   - Verifica si Stripe está configurado correctamente
   - Retorna true si existe `STRIPE_SECRET_KEY` y comienza con 'sk_'

2. **`calculateFeeDistribution(amount, platformPercentage = 10)`**
   - Calcula la distribución de ganancias:
     - Stripe Fee: 2.9% + $0.30
     - Platform Fee: 10% (configurable)
     - Teacher Amount: Resto (87.1% aproximadamente)
   - Retorna objeto con las tres cantidades

3. **`createPaymentIntent(amount, currency = 'usd', metadata = {})`**
   - Crea un Payment Intent en Stripe
   - Convierte el monto a centavos (Stripe usa centavos)
   - Incluye metadata con información del curso, estudiante y docente
   - Modo de prueba si Stripe no está configurado

4. **`confirmPayment(paymentIntentId, courseId, teacherId)`**
   - Verifica el estado del Payment Intent
   - Si el pago fue exitoso:
     - Calcula distribución de ganancias
     - Crea transferencia automática a la cuenta Stripe del docente (Stripe Connect)
     - Retorna información del pago y distribución

5. **`createTeacherAccount(teacherEmail, teacherName)`**
   - Crea una cuenta Stripe Connect Express para el docente
   - Configura capacidades: transfers, card_payments, sepa_debit_payments
   - Business type: individual
   - MCC: 8299 (Educational Services)

6. **`createOnboardingLink(accountId, returnUrl)`**
   - Genera link de onboarding para que el docente complete su información
   - Tipo: account_onboarding
   - Expira en 24 horas

7. **`getPlatformBalance()`**
   - Obtiene el balance de la cuenta principal de RUMI

8. **`getTeacherBalance(teacherStripeAccountId)`**
   - Obtiene el balance de la cuenta Stripe del docente

---

### 3. **Controladores (Controllers)**

#### `backend/controllers/paymentController.js`
**Propósito:** Maneja todas las peticiones HTTP relacionadas con pagos

**Funciones principales:**

1. **`createPaymentIntent(req, res)`**
   - **Ruta:** `POST /api/payments/create-intent`
   - **Autenticación:** Requerida
   - **Validaciones:**
     - Verifica que el curso existe
     - Verifica que el curso es de pago (`isPaidCourse: true`)
     - Verifica que el estudiante no haya pagado ya
   - **Proceso:**
     - Obtiene información del docente y su cuenta Stripe
     - Crea Payment Intent con metadata
     - Retorna `clientSecret` para el frontend

2. **`createPayment(req, res)`**
   - **Ruta:** `POST /api/payments`
   - **Autenticación:** Requerida
   - **Validaciones:**
     - Verifica curso y que es de pago
     - Verifica que no haya pagado previamente
   - **Proceso:**
     - Confirma el pago con Stripe
     - Crea registro en la base de datos con distribución de ganancias
     - Agrega estudiante al curso automáticamente
     - Actualiza ganancias del docente (`totalEarnings`, `monthlyEarnings`)

3. **`getUserPayments(req, res)`**
   - **Ruta:** `GET /api/payments/user`
   - **Autenticación:** Requerida
   - Retorna todos los pagos del usuario autenticado

4. **`checkPaymentStatus(req, res)`**
   - **Ruta:** `GET /api/payments/course/:courseId/status`
   - **Autenticación:** Requerida
   - Verifica si el usuario ha pagado por un curso específico
   - Retorna `{ hasPaid: boolean, payment: Payment | null }`

5. **`getCoursePaymentStats(req, res)`**
   - **Ruta:** `GET /api/payments/course/:courseId/stats`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docente del curso o admin
   - Calcula estadísticas:
     - `totalRevenue`: Ingresos totales
     - `totalPayments`: Número de pagos
     - `totalTeacherEarnings`: Ganancias del docente
     - `totalPlatformFees`: Comisiones de la plataforma
   - Retorna lista de pagos con información de estudiantes

6. **`createTeacherStripeAccount(req, res)`**
   - **Ruta:** `POST /api/payments/teacher/stripe-account`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docentes o admin
   - **Validaciones:**
     - Verifica que no tenga cuenta ya configurada
   - **Proceso:**
     - Crea cuenta Stripe Connect
     - Actualiza usuario con `stripeAccountId` y `stripeAccountStatus: 'pending'`
     - Genera link de onboarding
     - Retorna `accountId` y `onboardingUrl`

7. **`getTeacherBalance(req, res)`**
   - **Ruta:** `GET /api/payments/teacher/balance`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docentes o admin
   - **Validaciones:**
     - Verifica que tenga cuenta Stripe configurada
   - Retorna balance de Stripe y ganancias acumuladas

#### `backend/controllers/courseController.js`
**Funciones relacionadas con pagos:**

1. **`setCourseAsPaid(req, res)`**
   - **Ruta:** `PUT /api/courses/:courseId/set-paid`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docente del curso o admin
   - **Parámetros:**
     - `paidFromLesson`: Número de lección desde la cual se requiere pago
     - `price`: Precio del curso
   - **Validaciones:**
     - Verifica que la lección especificada existe
   - Configura `isPaidCourse: true` y actualiza `paidFromLesson` y `price`

2. **`removeCoursePayment(req, res)`**
   - **Ruta:** `PUT /api/courses/:courseId/remove-paid`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docente del curso o admin
   - Remueve configuración de pago: `isPaidCourse: false`, `paidFromLesson: null`

---

### 4. **Rutas (Routes)**

#### `backend/routes/paymentRoutes.js`
**Rutas de pagos:**
- `POST /api/payments/create-intent` → `createPaymentIntent`
- `POST /api/payments` → `createPayment`
- `GET /api/payments/user` → `getUserPayments`
- `GET /api/payments/course/:courseId/status` → `checkPaymentStatus`
- `GET /api/payments/course/:courseId/stats` → `getCoursePaymentStats`
- `POST /api/payments/teacher/stripe-account` → `createTeacherStripeAccount`
- `GET /api/payments/teacher/balance` → `getTeacherBalance`

**Todas las rutas requieren autenticación (`authMiddleware`)**

#### `backend/routes/courseRoutes.js`
**Rutas relacionadas con pagos:**
- `PUT /api/courses/:courseId/set-paid` → `setCourseAsPaid`
- `PUT /api/courses/:courseId/remove-paid` → `removeCoursePayment`

---

## 🟢 FRONTEND

### 1. **Servicios (Services)**

#### `frontend/src/services/api.js`
**Funciones relacionadas con pagos:**

```javascript
// Crear Payment Intent
export const createPaymentIntent = (paymentData) => 
  api.post('/payments/create-intent', paymentData);

// Crear un pago
export const createPayment = (paymentData) => 
  api.post('/payments', paymentData);

// Obtener pagos del usuario
export const getUserPayments = () => 
  api.get('/payments/user');

// Verificar estado de pago
export const checkPaymentStatus = (courseId) => 
  api.get(`/payments/course/${courseId}/status`);

// Obtener estadísticas de pagos de un curso
export const getCoursePaymentStats = (courseId) => 
  api.get(`/payments/course/${courseId}/stats`);

// Crear cuenta Stripe para docente
export const createTeacherStripeAccount = (data) => 
  api.post('/payments/teacher/stripe-account', data);

// Obtener balance del docente
export const getTeacherBalance = () => 
  api.get('/payments/teacher/balance');
```

---

### 2. **Componentes (Components)**

#### `frontend/src/components/PaymentButton.jsx`
**Propósito:** Componente principal para procesar pagos de estudiantes

**Funcionalidad:**
1. **Verificación de estado de pago:**
   - Al montar, verifica si el estudiante ya pagó
   - Si ya pagó, muestra mensaje de confirmación

2. **Inicio de pago:**
   - Al hacer clic en "Pagar y Continuar":
     - Llama a `createPaymentIntent` con `courseId` y `amount`
     - Recibe `clientSecret`
     - Muestra formulario de pago de Stripe

3. **Formulario de pago (CheckoutForm):**
   - Usa `@stripe/react-stripe-js` (PaymentElement)
   - Al enviar:
     - Valida formulario
     - Confirma pago con Stripe
     - Si es exitoso, llama a `createPayment` en el backend
     - Ejecuta callback `onPaymentSuccess`

4. **Estados:**
   - `loading`: Cargando estado de pago
   - `paymentStatus`: Estado del pago
   - `showPaymentForm`: Mostrar/ocultar formulario
   - `clientSecret`: Secret del Payment Intent

**Props:**
- `courseId`: ID del curso
- `lessonOrder`: Orden de la lección (opcional)
- `onPaymentSuccess`: Callback cuando el pago es exitoso
- `coursePrice`: Precio del curso (default: 29.99)

---

#### `frontend/src/components/PaymentConfigModal.jsx`
**Propósito:** Modal para que docentes configuren cursos como de pago

**Funcionalidad:**
1. **Configurar curso como pago:**
   - Formulario con:
     - Selector de lección desde la cual se requiere pago
     - Campo de precio (validación de números decimales)
   - Al enviar: `PUT /api/courses/:courseId/set-paid`

2. **Editar configuración:**
   - Si el curso ya es de pago, muestra configuración actual
   - Permite actualizar o remover configuración

3. **Remover configuración:**
   - Botón para remover pago: `PUT /api/courses/:courseId/remove-paid`

**Props:**
- `isOpen`: Controla visibilidad del modal
- `onClose`: Callback para cerrar
- `course`: Objeto del curso
- `onSuccess`: Callback cuando la operación es exitosa

---

#### `frontend/src/components/PaymentStats.jsx`
**Propósito:** Muestra estadísticas de pagos para docentes

**Funcionalidad:**
1. **Carga de estadísticas:**
   - Al montar, llama a `getCoursePaymentStats(courseId)`

2. **Visualización:**
   - **Tarjetas de métricas:**
     - Ingresos Totales
     - Pagos Realizados
     - Ganancias del Docente (87.1%)
     - Comisión Plataforma (10%)
   - **Lista de pagos recientes:**
     - Nombre del estudiante
     - Fecha del pago
     - Monto
     - Método de pago

**Props:**
- `courseId`: ID del curso

---

#### `frontend/src/components/TeacherStripeSetup.jsx`
**Propósito:** Configuración de cuenta Stripe para docentes

**Funcionalidad:**
1. **Verificación de estado:**
   - Al montar, verifica si tiene cuenta Stripe (`getTeacherBalance`)
   - Estados posibles:
     - `not_configured`: No tiene cuenta
     - `pending`: Cuenta creada pero onboarding incompleto
     - `active`: Cuenta activa

2. **Crear cuenta:**
   - Botón para crear cuenta Stripe Connect
   - Llama a `createTeacherStripeAccount`
   - Si hay `onboardingUrl`, redirige al docente

3. **Visualización de balance:**
   - Si la cuenta está activa, muestra:
     - Ganancias Totales
     - Ganancias del Mes
     - Porcentaje del docente (87.1%)

---

### 3. **Páginas (Pages)**

#### `frontend/src/pages/StudentCourseDetail.jsx`
**Integración de pagos:**

1. **Verificación de pago:**
   ```javascript
   useEffect(() => {
     const checkPaymentStatus = async () => {
       if (course?.isPaidCourse) {
         const response = await api.get(`/payments/course/${courseId}/status`);
         setHasPaid(response.data.hasPaid);
       }
     };
     checkPaymentStatus();
   }, [courseId, course?.isPaidCourse]);
   ```

2. **Lógica de acceso a lecciones:**
   ```javascript
   const requiresPayment = course.isPaidCourse && 
                          course.paidFromLesson && 
                          lesson.order >= course.paidFromLesson &&
                          !hasPaid;
   ```

3. **Renderizado condicional:**
   - Si `requiresPayment === true`:
     - Muestra componente `<PaymentButton />`
   - Si `hasPaid === true`:
     - Muestra lección normalmente

4. **Información de pago en intro:**
   - Si el curso es de pago, muestra:
     - Precio
     - Lecciones gratuitas vs premium
     - Mensaje informativo

---

#### `frontend/src/pages/CourseDetail.jsx`
**Integración para docentes:**

1. **Modal de configuración:**
   - Botón para abrir `PaymentConfigModal`
   - Estado: `showPaymentConfig`

2. **Estadísticas de pagos:**
   - Componente `<PaymentStats courseId={id} />`
   - Muestra métricas y pagos recientes

3. **Información de pago:**
   - Muestra si el curso es de pago
   - Muestra precio y lección desde la cual se requiere pago

---

#### `frontend/src/pages/TeacherCourses.jsx`
**Integración:**

1. **Configuración de Stripe:**
   - Componente `<TeacherStripeSetup />`
   - Permite a docentes configurar su cuenta Stripe

---

#### `frontend/src/pages/PaymentSuccess.jsx`
**Propósito:** Página de confirmación después del pago

**Funcionalidad:**
- Muestra mensaje de éxito
- Cuenta regresiva de 5 segundos
- Redirige automáticamente a `/student/courses`
- Botón manual para ir a cursos

---

## 🔄 FLUJO COMPLETO DE PAGO

### **Flujo para Estudiantes:**

1. **Estudiante accede a curso de pago:**
   - Ve lecciones gratuitas (antes de `paidFromLesson`)
   - Al llegar a lección premium, ve `<PaymentButton />`

2. **Inicio de pago:**
   - Click en "Pagar y Continuar"
   - Frontend: `POST /api/payments/create-intent`
   - Backend: Crea Payment Intent en Stripe
   - Frontend recibe `clientSecret`

3. **Formulario de pago:**
   - Stripe PaymentElement se renderiza
   - Estudiante ingresa datos de tarjeta
   - Click en "Pagar"

4. **Confirmación:**
   - Stripe procesa el pago
   - Frontend: `POST /api/payments` con `paymentIntentId`
   - Backend:
     - Verifica pago en Stripe
     - Calcula distribución de ganancias
     - Crea transferencia a cuenta del docente (Stripe Connect)
     - Guarda registro en BD
     - Agrega estudiante al curso
     - Actualiza ganancias del docente

5. **Redirección:**
   - Frontend redirige a `/payment-success`
   - Después de 5 segundos, redirige a `/student/courses`

---

### **Flujo para Docentes:**

1. **Configurar cuenta Stripe:**
   - Docente ve `<TeacherStripeSetup />`
   - Click en "Configurar Cuenta de Stripe"
   - Backend crea cuenta Stripe Connect Express
   - Genera link de onboarding
   - Docente completa información en Stripe

2. **Configurar curso como pago:**
   - Docente abre `PaymentConfigModal`
   - Selecciona lección desde la cual se requiere pago
   - Ingresa precio
   - Guarda configuración

3. **Ver estadísticas:**
   - Docente ve `<PaymentStats />` en detalle del curso
   - Muestra ingresos, pagos, ganancias

---

## 💰 DISTRIBUCIÓN DE GANANCIAS

**Fórmula:**
```
Monto Total = $100.00

Stripe Fee = (Monto × 2.9%) + $0.30
           = ($100 × 0.029) + $0.30
           = $2.90 + $0.30
           = $3.20

Platform Fee = Monto × 10%
             = $100 × 0.10
             = $10.00

Teacher Amount = Monto - Stripe Fee - Platform Fee
               = $100 - $3.20 - $10.00
               = $86.80
               ≈ 87.1% del monto total
```

**Ejemplo con $29.99:**
- Stripe Fee: $1.17
- Platform Fee: $3.00
- Teacher Amount: $25.82 (86.1%)

---

## 🔐 VARIABLES DE ENTORNO

### Backend:
```env
STRIPE_SECRET_KEY=sk_test_...  # Clave secreta de Stripe
FRONTEND_URL=https://...       # URL del frontend (para onboarding)
```

### Frontend:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Clave pública de Stripe
VITE_API_URL=https://...                 # URL del backend
```

---

## 📝 NOTAS IMPORTANTES

1. **Modo de Prueba:**
   - El sistema tiene modo de prueba si Stripe no está configurado
   - Simula operaciones sin llamadas reales a Stripe

2. **Stripe Connect:**
   - Los docentes usan cuentas Stripe Connect Express
   - Las transferencias son automáticas después del pago
   - El docente recibe 87.1% automáticamente

3. **Validaciones:**
   - No se permite pagar dos veces por el mismo curso
   - Solo docentes pueden configurar cursos como de pago
   - Solo el docente del curso puede ver estadísticas

4. **Seguridad:**
   - Todos los endpoints requieren autenticación
- Los Payment Intents se crean en el backend (nunca en el frontend)
- El `clientSecret` se envía de forma segura al frontend

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Webhooks de Stripe:**
   - Implementar webhooks para actualizar estados de pago
   - Manejar reembolsos automáticamente

2. **Notificaciones:**
   - Email al docente cuando recibe un pago
   - Email al estudiante confirmando pago

3. **Reportes:**
   - Dashboard de ganancias para docentes
   - Reportes mensuales/anuales

4. **Reembolsos:**
   - Sistema de solicitud de reembolsos
   - Aprobación manual o automática

5. **Múltiples métodos de pago:**
   - PayPal
   - Transferencias bancarias
   - Criptomonedas

---

**Última actualización:** 2024
**Versión del sistema:** 1.0.0

