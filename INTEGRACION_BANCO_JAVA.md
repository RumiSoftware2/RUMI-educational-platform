# Guía de Integración - Sistema de Pagos RUMI con Banco Java

## 📋 Descripción General

Este documento explica cómo integrar el **mini banco en Java** con el **sistema de pagos de RUMI**.

---

## 🔌 Endpoints que RUMI Expone

### 1. Confirmar Pago (Webhook)

**Endpoint:** `POST /api/payments/{paymentId}/confirm`

Este endpoint debe ser llamado por el banco Java después de procesar un pago.

**Headers Recomendados:**
```
Content-Type: application/json
Authorization: Bearer {BANK_API_KEY}
```

**Body:**
```json
{
  "bankTransactionId": "BANK-TXN-20260106-001234",
  "status": "completed",
  "amount": 49.99,
  "currency": "USD",
  "timestamp": "2026-01-06T10:30:00Z"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Pago confirmado exitosamente",
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "course": "507f1f77bcf86cd799439012",
    "student": "507f1f77bcf86cd799439013",
    "teacher": "507f1f77bcf86cd799439014",
    "amount": 49.99,
    "currency": "USD",
    "status": "completed",
    "paidAt": "2026-01-06T10:30:00.000Z"
  }
}
```

**Respuesta Error (400):**
```json
{
  "message": "El pago no fue completado",
  "payment": { /* payment object */ }
}
```

---

## 🏦 Información del Pago

### Datos Disponibles Cuando se Inicia un Pago

Cuando el cliente JavaScript hace:
```javascript
POST /api/payments/courses/{courseId}/pay
```

RUMI crea un registro de pago con:

```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "course": "507f1f77bcf86cd799439012",
  "student": "507f1f77bcf86cd799439013",
  "teacher": "507f1f77bcf86cd799439014",
  "amount": 49.99,
  "currency": "USD",
  "status": "pending",
  "paymentMethod": "credit_card",
  "transactionId": "TXN-1704538200000-a1b2c3d4e",
  "bankTransactionId": null,
  "paidAt": null,
  "createdAt": "2026-01-06T10:25:00.000Z",
  "updatedAt": "2026-01-06T10:25:00.000Z"
}
```

### Parámetros Importantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | String | ID único del pago en RUMI (usar como paymentId en URL) |
| `transactionId` | String | ID de transacción temporal (puede usar como reference) |
| `course` | ObjectId | ID del curso siendo pagado |
| `student` | ObjectId | ID del estudiante pagando |
| `teacher` | ObjectId | ID del docente que recibirá el dinero |
| `amount` | Number | Monto a pagar |
| `currency` | String | Moneda (USD, COP, MXN, ARS) |

---

## 🔄 Flujo de Integración Completo

### Paso 1: El Estudiante Inicia el Pago (RUMI)

```
Cliente → RUMI
POST /api/payments/courses/507f1f77bcf86cd799439012/pay
```

**Respuesta RUMI:**
```json
{
  "message": "Pago iniciado",
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "transactionId": "TXN-1704538200000-a1b2c3d4e",
    "amount": 49.99,
    "currency": "USD",
    "status": "pending"
  },
  "bankPaymentUrl": "http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011"
}
```

### Paso 2: Cliente es Redirigido al Banco (Java)

El cliente JavaScript recibe la `bankPaymentUrl` y es redirigido:

```javascript
window.location.href = "http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011"
```

### Paso 3: El Banco Procesa el Pago (Java)

Tu sistema de banco en Java:
1. Recibe el `paymentId` (507f1f77bcf86cd799439011)
2. Procesa el pago
3. Crea una transacción bancaria (ej: BANK-TXN-20260106-001234)
4. Almacena la relación: RUMI_PaymentId ↔ BANK_TransactionId

### Paso 4: El Banco Notifica a RUMI (Java → RUMI)

Después de procesar:

```bash
curl -X POST "http://localhost:3000/api/payments/507f1f77bcf86cd799439011/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "bankTransactionId": "BANK-TXN-20260106-001234",
    "status": "completed",
    "amount": 49.99,
    "currency": "USD"
  }'
```

### Paso 5: RUMI Confirma y Actualiza (RUMI)

RUMI actualiza el registro:
- Cambia status de `pending` a `completed`
- Guarda el `bankTransactionId`
- Agrega el estudiante a `course.paidStudents`
- Actualiza ganancias del docente en BankAccount

---

## 💳 Flujo de Dinero

```
Estudiante
   ↓ paga
Banco Java (procesa)
   ↓ retiene
Cuenta RUMI (o cuenta intermedia)
   ↓ distribuye
Cuenta del Docente (cuando solicita payout)
```

### Cuentas a Considerar

1. **Cuenta Maestra de RUMI**: Recibe pagos de estudiantes
2. **Cuentas de Docentes**: Tienen ganancias pendientes en RUMI
3. **Sistema de Payout**: Transfiere dinero de cuenta RUMI a docentes

---

## 🔐 Seguridad de Integración

### 1. Validación de Webhook

Antes de procesar un webhook, valida:

```java
// Pseudo-código Java
public boolean validateWebhook(String requestBody, String signature) {
    String expectedSignature = HMAC_SHA256(requestBody, BANK_API_SECRET);
    return signature.equals(expectedSignature);
}
```

### 2. API Key

RUMI espera que el banco incluya un header:
```
Authorization: Bearer {BANK_API_KEY}
```

Configurable en backend `.env`:
```env
BANK_API_KEY=your-secure-api-key-here
```

### 3. HTTPS en Producción

En producción, todos los webhooks deben ser HTTPS:
```
https://rumieducation.vercel.app/api/payments/{paymentId}/confirm
```

---

## 🧪 Testing de la Integración

### 1. Test Local

**Requisitos:**
- RUMI backend corriendo en `http://localhost:3000`
- Banco Java corriendo en `http://localhost:8080`

### 2. Simular Pago Completado

```bash
# 1. Crear un curso de pago
POST http://localhost:3000/api/courses
Headers: Authorization: Bearer {TEACHER_TOKEN}
Body: {
  "title": "Test Course",
  "description": "Test",
  "videoUrl": "https://www.youtube.com/embed/...",
  "isPaid": true,
  "price": 10,
  "currency": "USD"
}

# Respuesta: courseId = 507f1f77bcf86cd799439012
```

```bash
# 2. Crear un pago
POST http://localhost:3000/api/payments/courses/507f1f77bcf86cd799439012/pay
Headers: Authorization: Bearer {STUDENT_TOKEN}

# Respuesta: paymentId = 507f1f77bcf86cd799439011
```

```bash
# 3. Confirmar pago (simular webhook del banco)
POST http://localhost:3000/api/payments/507f1f77bcf86cd799439011/confirm
Headers: 
  Content-Type: application/json
  Authorization: Bearer {BANK_API_KEY}
Body: {
  "bankTransactionId": "BANK-TXN-TEST-001",
  "status": "completed"
}

# Respuesta: Payment status changed to "completed"
```

```bash
# 4. Verificar que el estudiante tiene acceso
GET http://localhost:3000/api/payments/courses/507f1f77bcf86cd799439012/has-paid
Headers: Authorization: Bearer {STUDENT_TOKEN}

# Respuesta: { "hasPaid": true, "isPaidCourse": true }
```

---

## 🛠️ Implementación en Java

### Ejemplo de Controlador en Java

```java
@RestController
@RequestMapping("/api/transactions")
public class PaymentWebhookController {
    
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
        @PathVariable String paymentId,
        @RequestBody PaymentConfirmRequest request,
        @RequestHeader("Authorization") String authHeader) {
        
        // Validar auth
        if (!isValidAuthorization(authHeader)) {
            return ResponseEntity.status(401).build();
        }
        
        // Validar que existe la transacción en banco
        BankTransaction bankTxn = bankService.getTransaction(request.getBankTransactionId());
        if (bankTxn == null) {
            return ResponseEntity.badRequest().body("Transaction not found");
        }
        
        // Hacer HTTP POST a RUMI para confirmar
        String confirmUrl = "http://localhost:3000/api/payments/" + paymentId + "/confirm";
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create(confirmUrl))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + RUMI_API_KEY)
            .POST(HttpRequest.BodyPublishers.ofString(
                new JSONObject()
                    .put("bankTransactionId", request.getBankTransactionId())
                    .put("status", request.getStatus())
                    .toString()
            ))
            .build();
        
        try {
            HttpResponse<String> response = client.send(httpRequest, 
                HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                return ResponseEntity.ok(new JSONObject()
                    .put("message", "Payment confirmed successfully"));
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error confirming payment");
        }
    }
    
    private boolean isValidAuthorization(String authHeader) {
        // Validar token Bearer
        return authHeader != null && authHeader.startsWith("Bearer ");
    }
}

// Clase para recibir el request
class PaymentConfirmRequest {
    private String bankTransactionId;
    private String status;
    private BigDecimal amount;
    private String currency;
    
    // Getters y setters
}
```

---

## 📊 Estados de Pago

En RUMI, un pago puede estar en estos estados:

| Estado | Significado | Acción |
|--------|-------------|--------|
| `pending` | Esperando procesamiento | Nada |
| `processing` | Se está procesando | Esperar confirmación |
| `completed` | Pagado exitosamente | Dar acceso al curso |
| `failed` | Pago rechazado | Notificar al estudiante |
| `refunded` | Pago reembolsado | Quitar acceso al curso |

---

## 🔄 Sincronización de Dinero

### Flujo de Ganancias del Docente

1. **Cuando se completa un pago:**
   - Amount se suma a `BankAccount.totalEarnings`
   - Amount se suma a `BankAccount.pendingPayouts`

2. **Cuando docente solicita payout:**
   - El amount se resta de `pendingPayouts`
   - Se registra el payout en el banco

3. **El banco procesa el payout:**
   - Transfiere dinero a cuenta bancaria del docente
   - Actualiza `BankAccount.lastPayout`

---

## ⚙️ Variables de Configuración

**Backend `.env`:**
```env
# Port de RUMI
PORT=3000

# Base de datos
MONGODB_URI=mongodb://...

# Banco
BANK_API_URL=http://localhost:8080/api
BANK_API_KEY=your-secure-api-key

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Banco Java `.properties`:**
```properties
# Port del banco
server.port=8080

# RUMI
rumi.api.url=http://localhost:3000/api
rumi.api.key=your-secure-api-key
```

---

## 🚨 Manejo de Errores Comunes

### Error: "Payment not found"
- El paymentId no existe en RUMI
- Verificar que la transacción fue creada correctamente

### Error: "Invalid authorization"
- API key no coincide
- Header Authorization no tiene formato correcto

### Error: "Amount mismatch"
- El amount confirmado no coincide con el registrado
- Verificar conversión de monedas

### Error: "Course not found"
- El courseId no es válido
- Verificar que el curso existe

---

## 📈 Monitoreo y Logs

Asegúrate de loguear:

1. **En Java (Banco):**
   - Transacciones recibidas
   - Confirmaciones enviadas a RUMI
   - Errores en webhooks

2. **En RUMI:**
   - Pagos creados
   - Confirmaciones recibidas
   - Ganancias actualizadas
   - Payouts procesados

---

## 🔗 URLs de Referencia

**Desarrollo:**
- RUMI Frontend: `http://localhost:5173`
- RUMI Backend: `http://localhost:3000`
- Banco Java: `http://localhost:8080`

**Producción:**
- RUMI Frontend: `https://rumieducation.vercel.app`
- RUMI Backend: `https://rumi-backend.herokuapp.com` (o tu hosting)
- Banco Java: `https://banco-rumi.tudominio.com` (o tu hosting)

---

## 📞 Contacto y Soporte

Para consultas sobre la integración:
- Email: dev@rumi.com
- Docs: https://rumi-docs.com/payments

**Última actualización:** Enero 2026
