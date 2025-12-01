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
 - `paymentMethod`: Método de pago ['wompi', 'paypal', 'manual']
- `transactionId`: ID único de la transacción
- `paymentDate`: Fecha del pago
- **Distribución de ganancias:**
   - `wompiFee`: Comisión de Wompi (configurable, p.ej. porcentaje + tarifa fija)
  - `platformFee`: Comisión de la plataforma (10%)
  - `teacherAmount`: Cantidad para el docente (87.1%)
  - `platformPercentage`: Porcentaje de la plataforma (default: 10%)
 - **Información de Wompi:**
    - `wompiTransactionId`: ID de la transacción en Wompi
    - `wompiTransferId`: ID de la transferencia a la cuenta del docente (si aplica)
- `metadata`: Metadatos adicionales

#### `backend/models/Course.js`
**Campos relacionados con pagos:**
- `price`: Precio del curso (Number, default: 0)
- `isPaidCourse`: Boolean que indica si el curso es de pago (default: false)
- `paidFromLesson`: Número de lección desde la cual se requiere pago (Number, default: null)

#### `backend/models/User.js`
**Campos relacionados con pagos (solo para docentes):**
 - `teacherPayoutId`: ID del registro de métodos/payout del docente
 - `teacherPayoutStatus`: Estado del método de pago/payout ['not_configured', 'pending', 'active']
- `totalEarnings`: Ganancias totales acumuladas
- `monthlyEarnings`: Ganancias del mes actual

---

### 2. **Servicios (Services)**

#### `backend/services/wompiService.js`
**Propósito:** Servicio centralizado para todas las operaciones con Wompi (crear transacciones, verificar estado, modo prueba)

**Métodos principales:**

1. **`isWompiConfigured()`**
   - Verifica si Wompi está configurado correctamente
   - Retorna true si existe `WOMPI_PRIVATE_KEY`

2. **`calculateFeeDistribution(amount, platformPercentage = 10)`**
   - Calcula la distribución de ganancias:
   - Wompi Fee: configurable (p.ej. porcentaje + tarifa fija)
     - Platform Fee: 10% (configurable)
     - Teacher Amount: Resto (87.1% aproximadamente)
   - Retorna objeto con las tres cantidades

3. **`createTransaction(amount, currency = 'COP', metadata = {})`**
   - Crea una transacción en Wompi (checkout hospedado)
   - Convierte/normaliza el monto según la moneda
   - Incluye metadata con información del curso, estudiante y docente
   - Retorna `checkoutUrl` y `wompiTransactionId`
   - Modo de prueba si `WOMPI_PRIVATE_KEY` no está configurado (simulación)

4. **`verifyTransaction(wompiTransactionId, courseId, teacherId)`**
   - Verifica el estado de la transacción en Wompi (o se activa mediante webhook)
   - Si el pago fue exitoso:
      - Calcula distribución de ganancias (wompiFee, platformFee, teacherAmount)
      - Registra la transacción en la base de datos
      - Marca al estudiante como inscrito en el curso
      - Retorna información del pago y distribución

5. **`createTeacherPayoutAccount(teacherData)`**
   - Crea/actualiza el registro interno para que el docente reciba pagos (almacena datos bancarios o método de retiro)
   - Valida información mínima requerida (nombre, documento, banco, cuenta)
   - Retorna `teacherPayoutId` y estado (`pending` / `active`)

6. **`createOnboardingLink(accountId, returnUrl)`**
   - Genera link de onboarding para que el docente complete su información
   - Tipo: account_onboarding
   - Expira en 24 horas

7. **`getPlatformBalance()`**
   - Obtiene el balance de la cuenta principal de RUMI

8. **`getTeacherBalance(teacherPayoutId)`**
   - Obtiene el balance o ganancias acumuladas del docente (registro interno)

---

### 3. **Controladores (Controllers)**

#### `backend/controllers/paymentController.js`
**Propósito:** Maneja todas las peticiones HTTP relacionadas con pagos

**Funciones principales:**

1. **`createTransaction(req, res)`**
   - **Ruta:** `POST /api/payments/create-transaction`
   - **Autenticación:** Requerida
   - **Validaciones:**
      - Verifica que el curso existe
      - Verifica que el curso es de pago (`isPaidCourse: true`)
      - Verifica que el estudiante no haya pagado ya
   - **Proceso:**
      - Obtiene información del docente y su registro de payout
      - Crea transacción en Wompi con metadata (curso, estudiante, monto)
      - Retorna `checkoutUrl` y `wompiTransactionId` para que el frontend redirija al usuario

2. **`confirmPayment(req, res)`**
   - **Ruta:** `POST /api/payments/confirm`
   - **Autenticación:** Requerida
   - **Validaciones:**
      - Verifica curso y que es de pago
      - Verifica que no haya pagado previamente
   - **Proceso:**
      - Verifica/valida la transacción en Wompi (o procesa la confirmación recibida por webhook)
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

6. **`createTeacherPayoutAccount(req, res)`**
    - **Ruta:** `POST /api/payments/teacher/payout-account`
    - **Autenticación:** Requerida
    - **Autorización:** Solo docentes o admin
    - **Validaciones:**
       - Verifica que no tenga método de retiro ya configurado
    - **Proceso:**
       - Crea/actualiza registro de payout del docente
       - Actualiza usuario con `teacherPayoutId` y `teacherPayoutStatus: 'pending'` o `active`
       - Retorna `teacherPayoutId` y `onboardingUrl` (si aplica)

7. **`getTeacherBalance(req, res)`**
   - **Ruta:** `GET /api/payments/teacher/balance`
   - **Autenticación:** Requerida
   - **Autorización:** Solo docentes o admin
    - **Validaciones:**
       - Verifica que tenga método de payout configurado
    - Retorna balance del docente y ganancias acumuladas (registro interno)

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
- `POST /api/payments/create-transaction` → `createTransaction`
- `POST /api/payments/confirm` → `confirmPayment`
- `GET /api/payments/user` → `getUserPayments`
- `GET /api/payments/course/:courseId/status` → `checkPaymentStatus`
- `GET /api/payments/course/:courseId/stats` → `getCoursePaymentStats`
- `POST /api/payments/teacher/payout-account` → `createTeacherPayoutAccount`
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
// Crear transacción (Wompi)
export const createTransaction = (paymentData) => 
   api.post('/payments/create-transaction', paymentData);

// Confirmar/registrar pago (después de verificación/webhook)
export const confirmPayment = (paymentData) => 
   api.post('/payments/confirm', paymentData);

// Obtener pagos del usuario
export const getUserPayments = () => 
  api.get('/payments/user');

// Verificar estado de pago
export const checkPaymentStatus = (courseId) => 
  api.get(`/payments/course/${courseId}/status`);

// Obtener estadísticas de pagos de un curso
export const getCoursePaymentStats = (courseId) => 
  api.get(`/payments/course/${courseId}/stats`);

// Crear registro de payout para docente
export const createTeacherPayoutAccount = (data) => 
   api.post('/payments/teacher/payout-account', data);

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
     - Llama a `createTransaction` con `courseId` y `amount`
     - Recibe `checkoutUrl` y `wompiTransactionId`
     - Redirige al usuario al `checkoutUrl` (Wompi hosted checkout)

3. **Confirmación y webhook:**
   - Wompi procesa el pago en su checkout hospedado
   - Wompi enviará una notificación (webhook) al backend cuando el pago cambie de estado
   - Alternativamente, el frontend puede consultar el endpoint de `checkPaymentStatus` para verificar si la transacción quedó registrada
   - Si el pago es exitoso, el backend registra el pago y ejecuta `onPaymentSuccess`

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

#### `frontend/src/components/TeacherPayoutSetup.jsx`
**Propósito:** Configuración de método de payout para docentes (datos bancarios / retiro)

**Funcionalidad:**
1. **Verificación de estado:**
   - Al montar, verifica si tiene método de payout configurado (`getTeacherBalance`)
   - Estados posibles:
      - `not_configured`: No tiene método de retiro
      - `pending`: Datos enviados pero verificación pendiente
      - `active`: Método de pago activo

2. **Configurar método de retiro:**
   - Formulario para que el docente registre datos bancarios o instrucción de retiro
   - Llama a `createTeacherPayoutAccount`
   - Si hay `onboardingUrl` o pasos adicionales, redirige/guía al docente

3. **Visualización de balance:**
   - Si el método está activo, muestra:
      - Ganancias Totales
      - Ganancias del Mes
      - Porcentaje del docente (ej. 87.1%)

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

1. **Configuración de método de retiro:**
   - Componente `<TeacherPayoutSetup />`
   - Permite a docentes configurar su método de retiro/payout (datos bancarios)

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
   - Frontend: `POST /api/payments/create-transaction`
   - Backend: Crea transacción en Wompi y retorna `checkoutUrl`
   - Frontend redirige al usuario al `checkoutUrl` (Wompi hosted checkout)

3. **Pago en el checkout de Wompi:**
   - El estudiante completa el pago en la pasarela alojada por Wompi

4. **Confirmación y registro:**
   - Wompi notifica al backend mediante webhook cuando la transacción cambia de estado
   - El backend valida la transacción (o el frontend puede consultar `checkPaymentStatus`)
   - Si el pago fue exitoso, el backend:
     - Calcula distribución de ganancias
     - Guarda registro en BD
     - Agrega estudiante al curso
     - Actualiza ganancias del docente

5. **Redirección:**
   - Frontend redirige a `/payment-success`
   - Después de 5 segundos, redirige a `/student/courses`

---

### **Flujo para Docentes:**

1. **Configurar método de retiro:**
   - Docente ve `<TeacherPayoutSetup />`
   - Click en "Configurar método de retiro"
   - Backend crea/guarda registro de payout (`teacherPayoutId`) y puede generar pasos de verificación
   - Docente completa información de retiro en la plataforma (datos bancarios o instrucciones)

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

**Fórmula (conceptual):**

Wompi Fee = (Monto × wompi_percentage) + wompi_fixed_fee  (configurable según proveedor)

Platform Fee = Monto × platformPercentage (p.ej. 10%)

Teacher Amount = Monto - Wompi Fee - Platform Fee

**Ejemplo (conceptual) con $29.99:**
- Wompi Fee (ejemplo): $1.17 (si la tarifa fuera equivalente)
- Platform Fee: $3.00
- Teacher Amount: ~$25.82 (aprox. 86%)

---

## 🔐 VARIABLES DE ENTORNO

### Backend:
```env
WOMPI_PRIVATE_KEY=wompi_test_...  # Clave privada de Wompi
FRONTEND_URL=https://...          # URL del frontend (para onboarding / callbacks)
```

### Frontend:
```env
VITE_WOMPI_PUBLIC_KEY=pk_wompi_...  # Clave pública de Wompi (si aplica para integraciones frontend)
VITE_API_URL=https://...            # URL del backend
```

---

## 📝 NOTAS IMPORTANTES

1. **Modo de Prueba:**
   - El sistema tiene modo de prueba si `WOMPI_PRIVATE_KEY` no está configurada
   - Simula operaciones sin llamadas reales a Wompi

2. **Payouts a docentes:**
   - Los docentes configuran su método de retiro en la plataforma (datos bancarios o instrucciones)
   - Las transferencias a docentes pueden ser automatizadas o gestionadas manualmente según la integración disponible
   - La plataforma calcula y registra la distribución de ganancias (wompiFee, platformFee, teacherAmount)

3. **Validaciones:**
   - No se permite pagar dos veces por el mismo curso
   - Solo docentes pueden configurar cursos como de pago
   - Solo el docente del curso puede ver estadísticas

4. **Seguridad:**
   - Todos los endpoints requieren autenticación
   - Las transacciones se inician desde el backend (el backend crea la transacción y retorna `checkoutUrl`)
   - La confirmación definitiva del pago se realiza mediante webhook o verificación en backend

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Webhooks de Wompi:**
   - Implementar webhooks para actualizar estados de pago
   - Manejar reembolsos y cambios de estado automáticamente

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

