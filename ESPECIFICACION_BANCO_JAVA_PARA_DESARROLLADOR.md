# 📋 ESPECIFICACIÓN TÉCNICA - BANCO JAVA PARA PROGRAMADOR

**Proyecto:** RUMI - Plataforma de Educación en Línea  
**Componente:** Mini Banco Java - Servicio de Pagos  
**Fecha:** Enero 2026  
**Versión:** 1.0  

---

## 🎯 OBJETIVO

Crear un **API REST en Java** que actúe como un mini banco/procesador de pagos para la plataforma RUMI. Este servicio será consumido por:

1. **Frontend (React)** - Interfaz de usuario donde estudiantes pagan
2. **Backend (Node.js/Express)** - Sistema principal de RUMI que gestiona datos educativos

---

## 📊 FLUJO COMPLETO DE PAGOS

```
┌─────────────────────────────────────────────────────────────────┐
│                       FLUJO DE PAGOS RUMI                       │
└─────────────────────────────────────────────────────────────────┘

1. INICIO (Frontend React)
   └─ Estudiante hace click en "Pagar y Desbloquear Curso"
   └─ Frontend envía: POST /api/payments/courses/{courseId}/pay
   
2. CREACIÓN DE PAGO (Backend Node.js)
   └─ RUMI crea registro de pago en MongoDB
   └─ Retorna: paymentId + bankPaymentUrl
   └─ Frontend redirige a: http://localhost:8080/api/transactions/initiate/{paymentId}

3. PROCESAMIENTO (Tu Banco Java) ⭐ AQUÍ ENTRA TU CÓDIGO
   └─ Recibe paymentId
   └─ Procesa pago (válida tarjeta, procesa dinero)
   └─ Crea transacción bancaria (ej: BANK-TXN-20260114-001234)
   └─ Guarda relación: paymentId ↔ bankTransactionId

4. CONFIRMACIÓN (Tu Banco Java → Backend Node.js) ⭐ TÚ ENVÍAS WEBHOOK
   └─ POST /api/payments/{paymentId}/confirm
   └─ Incluye: bankTransactionId, status, amount, currency

5. ACTUALIZACIÓN (Backend Node.js)
   └─ Actualiza payment status a "completed"
   └─ Agrega estudiante a course.paidStudents
   └─ Suma dinero a earnings del docente
   └─ Frontend recibe confirmación

6. ACCESO (Frontend React)
   └─ Estudiante ya puede ver TODAS las lecciones del curso
```

---

## 📥 QUÉ RECIBE TU BANCO JAVA DEL FRONTEND

### Cuando el Estudiante Inicia el Pago

El **Frontend** hace click en botón de pago y **RUMI Backend** crea un registro:

```javascript
{
  "_id": "507f1f77bcf86cd799439011",           // ← Usar como paymentId
  "course": "507f1f77bcf86cd799439012",        // ID del curso
  "student": {
    "_id": "507f1f77bcf86cd799439013",         // ID del estudiante
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "teacher": {
    "_id": "507f1f77bcf86cd799439014",         // ID del docente
    "name": "Dr. García",
    "email": "garcia@example.com"
  },
  "amount": 49.99,                              // ← Monto a pagar
  "currency": "USD",                            // ← Moneda: USD, COP, MXN, ARS
  "status": "pending",
  "paymentMethod": "credit_card",
  "transactionId": "TXN-1704538200000-a1b2c3d4e",  // Referencia de RUMI
  "bankTransactionId": null,                   // ← Tú lo asignas
  "paidAt": null,
  "createdAt": "2026-01-06T10:25:00.000Z",
  "updatedAt": "2026-01-06T10:25:00.000Z"
}
```

### El Cliente es Redirigido a Tu Banco Con

Tu banco recibe por URL:
```
GET http://localhost:8080/api/transactions/initiate/{paymentId}

Ejemplo:
GET http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011
```

**Tú debes:**
1. Parsear el `paymentId` de la URL
2. Hacer una llamada a RUMI Backend para obtener los detalles del pago (ver endpoint más abajo)
3. Mostrar pantalla de pago al usuario
4. Procesar la transacción

---

## 📤 QUÉ ENVÍA TU BANCO JAVA A RUMI

### Endpoint Donde Confirmar el Pago (Webhook)

Después de procesar exitosamente el pago, **TÚ debes hacer un POST** a este endpoint de RUMI:

```bash
POST http://localhost:3000/api/payments/{paymentId}/confirm

Headers:
  Content-Type: application/json
  Authorization: Bearer {BANK_API_KEY}

Body (JSON):
{
  "bankTransactionId": "BANK-TXN-20260114-001234",    // ← Tu ID de transacción
  "status": "completed",                               // ← O "failed"
  "amount": 49.99,
  "currency": "USD",
  "timestamp": "2026-01-14T10:30:00Z"
}
```

**Respuesta Exitosa (HTTP 200):**
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
    "bankTransactionId": "BANK-TXN-20260114-001234",
    "paidAt": "2026-01-14T10:30:00.000Z"
  }
}
```

**Respuesta Error (HTTP 400):**
```json
{
  "message": "El pago no fue completado",
  "payment": { /* detalles */ }
}
```

---

## 🔐 SEGURIDAD - AUTENTICACIÓN

### El Token Bearer

RUMI espera un header: `Authorization: Bearer {BANK_API_KEY}`

El `BANK_API_KEY` será compartido por el equipo de RUMI. Ejemplo:
```
BANK_API_KEY=sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0
```

**En tu código Java:**
```java
String BANK_API_KEY = "sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0";
String authHeader = "Bearer " + BANK_API_KEY;
```

---

## 📡 ENDPOINTS QUE TU BANCO DEBE TENER

### 1️⃣ Endpoint para Iniciar Pago (GET)

```
GET /api/transactions/initiate/{paymentId}
```

**Propósito:** Mostrar pantalla de pago al usuario

**Parámetros URL:**
- `paymentId` - String - ID del pago en RUMI

**Respuesta Esperada:**
```html
<!-- Puedes retornar HTML con formulario de pago -->
<!-- O redirigir a una página de procesamiento -->
<!-- O retornar JSON para que Frontend maneje UI -->

Ejemplo JSON:
{
  "paymentId": "507f1f77bcf86cd799439011",
  "amount": 49.99,
  "currency": "USD",
  "courseName": "Python Avanzado",
  "studentEmail": "juan@example.com"
}
```

### 2️⃣ Endpoint para Procesar Pago (POST)

```
POST /api/transactions/process
```

**Propósito:** Procesar datos de tarjeta de crédito o método de pago

**Body (JSON):**
```json
{
  "paymentId": "507f1f77bcf86cd799439011",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "cvv": "123",
  "cardHolder": "Juan Pérez"
}
```

**Procesa:**
1. Valida datos de tarjeta
2. Realiza transacción (depende de tu proveedor de pagos)
3. Si es exitoso → Genera `bankTransactionId`
4. Envía webhook a RUMI (endpoint descrito arriba)

**Respuesta:**
```json
{
  "success": true,
  "bankTransactionId": "BANK-TXN-20260114-001234",
  "message": "Pago procesado"
}
```

### 3️⃣ Endpoint para Obtener Detalles del Pago (GET)

```
GET /api/transactions/{paymentId}/details
```

**Propósito:** Que el cliente pueda obtener información de su transacción

**Respuesta:**
```json
{
  "paymentId": "507f1f77bcf86cd799439011",
  "bankTransactionId": "BANK-TXN-20260114-001234",
  "status": "completed",
  "amount": 49.99,
  "currency": "USD"
}
```

---

## 🔄 MÉTODO DE CONEXIÓN

### OPCIÓN 1: HTTP REST (Recomendado)

**Protocolo:** HTTP/HTTPS  
**Método:** REST (GET, POST, PUT, DELETE)  
**Autenticación:** Bearer Token en header  
**Formato de Datos:** JSON

**Ejemplo en Java usando HttpClient:**

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Instant;
import org.json.JSONObject;

public class RumiPaymentIntegration {
    
    private static final String RUMI_BASE_URL = "http://localhost:3000/api";
    private static final String BANK_API_KEY = "sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    
    /**
     * Confirmar pago en RUMI después de procesar en el banco
     */
    public static boolean confirmPaymentInRumi(
        String paymentId, 
        String bankTransactionId,
        BigDecimal amount,
        String currency,
        String status) {
        
        try {
            // Construir URL
            String url = RUMI_BASE_URL + "/payments/" + paymentId + "/confirm";
            
            // Construir body JSON
            JSONObject bodyJson = new JSONObject();
            bodyJson.put("bankTransactionId", bankTransactionId);
            bodyJson.put("status", status);  // "completed" o "failed"
            bodyJson.put("amount", amount);
            bodyJson.put("currency", currency);
            bodyJson.put("timestamp", Instant.now().toString());
            
            // Crear request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + BANK_API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson.toString()))
                .build();
            
            // Enviar request
            HttpResponse<String> response = httpClient.send(
                request, 
                HttpResponse.BodyHandlers.ofString()
            );
            
            // Verificar respuesta
            if (response.statusCode() == 200) {
                System.out.println("✓ Pago confirmado en RUMI");
                return true;
            } else {
                System.err.println("✗ Error confirmando pago: " + response.body());
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("✗ Excepción al confirmar pago: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Obtener detalles del pago desde RUMI
     */
    public static String getPaymentDetails(String paymentId) {
        try {
            String url = RUMI_BASE_URL + "/payments/" + paymentId + "/status";
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + BANK_API_KEY)
                .GET()
                .build();
            
            HttpResponse<String> response = httpClient.send(
                request, 
                HttpResponse.BodyHandlers.ofString()
            );
            
            if (response.statusCode() == 200) {
                return response.body();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

### OPCIÓN 2: Webhooks Síncronos

```java
@RestController
@RequestMapping("/api/transactions")
public class PaymentController {
    
    private final RumiPaymentIntegration rumiClient;
    
    /**
     * Endpoint que recibe el pago iniciado
     */
    @GetMapping("/initiate/{paymentId}")
    public ResponseEntity<?> initiatePay(@PathVariable String paymentId) {
        
        // Obtener detalles del pago
        String paymentDetails = rumiClient.getPaymentDetails(paymentId);
        
        // Mostrar página de pago al usuario
        // (puede ser HTML, redirección, o retornar JSON para frontend)
        
        return ResponseEntity.ok()
            .body(new JSONObject()
                .put("paymentId", paymentId)
                .put("message", "Por favor ingresa tus datos de pago"));
    }
    
    /**
     * Endpoint que recibe datos del formulario de pago
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest paymentRequest) {
        
        String paymentId = paymentRequest.getPaymentId();
        BigDecimal amount = paymentRequest.getAmount();
        String currency = paymentRequest.getCurrency();
        
        try {
            // Procesar pago (integrar con proveedor de pagos real)
            String bankTransactionId = processWithPaymentProvider(paymentRequest);
            
            if (bankTransactionId != null) {
                
                // Confirmar en RUMI
                boolean confirmed = rumiClient.confirmPaymentInRumi(
                    paymentId,
                    bankTransactionId,
                    amount,
                    currency,
                    "completed"
                );
                
                if (confirmed) {
                    return ResponseEntity.ok()
                        .body(new JSONObject()
                            .put("success", true)
                            .put("bankTransactionId", bankTransactionId)
                            .put("message", "Pago completado"));
                }
            }
            
        } catch (Exception e) {
            // Notificar a RUMI que falló
            rumiClient.confirmPaymentInRumi(
                paymentId,
                null,
                amount,
                currency,
                "failed"
            );
        }
        
        return ResponseEntity.badRequest()
            .body(new JSONObject()
                .put("success", false)
                .put("message", "Error procesando pago"));
    }
    
    private String processWithPaymentProvider(PaymentRequest request) {
        // AQUÍ: Integrar con servicio de pagos real
        // (Stripe, PayPal, MercadoPago, etc.)
        
        // Ejemplo simulado:
        String bankTransactionId = "BANK-TXN-" + System.currentTimeMillis();
        return bankTransactionId;
    }
}

class PaymentRequest {
    private String paymentId;
    private String cardNumber;
    private String cardHolder;
    private BigDecimal amount;
    private String currency;
    
    // Getters y setters...
}
```

---

## 📋 DATOS QUE RUMI ENVÍA

### Información del Estudiante

```json
{
  "student": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "role": "student"
  }
}
```

### Información del Docente (Receptor del Dinero)

```json
{
  "teacher": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Dr. García Rodríguez",
    "email": "garcia@example.com",
    "role": "teacher"
  }
}
```

### Información del Curso

```json
{
  "course": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Python Avanzado - Desarrollo Web",
    "price": 49.99,
    "currency": "USD"
  }
}
```

---

## 💱 MONEDAS SOPORTADAS

RUMI soporta estas monedas:

| Código | Moneda | País |
|--------|--------|------|
| USD | Dólares estadounidenses | USA |
| COP | Pesos colombianos | Colombia |
| MXN | Pesos mexicanos | México |
| ARS | Pesos argentinos | Argentina |

Tu sistema debe poder procesar pagos en todas estas monedas.

---

## 🏦 TIPOS DE CUENTAS BANCARIAS (Para Futuro)

Eventualmente RUMI querrá guardar información de docentes para payouts:

```json
{
  "teacher": "507f1f77bcf86cd799439014",
  "accountHolder": "Dr. García Rodríguez",
  "accountNumber": "1234567890",
  "accountType": "checking",  // checking | savings
  "bankName": "Banco del Estado",
  "bankCode": "010",
  "routingNumber": "021000021",
  "country": "CO",  // Código de país ISO
  "isVerified": true
}
```

---

## 🧪 ESCENARIOS DE PRUEBA

### Test 1: Pago Exitoso

```bash
# 1. Iniciar pago
GET http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011

# 2. Procesar pago
POST http://localhost:8080/api/transactions/process
Body: { cardNumber: "4111111111111111", ... }

# 3. Verificar que RUMI recibió confirmación
GET http://localhost:3000/api/payments/507f1f77bcf86cd799439011/status
Response: { status: "completed" }
```

### Test 2: Pago Rechazado

```bash
# 1. Enviar tarjeta rechazada (ej: 4000000000000002)
POST http://localhost:8080/api/transactions/process
Body: { cardNumber: "4000000000000002", ... }

# 2. Verificar que RUMI recibió fallo
GET http://localhost:3000/api/payments/507f1f77bcf86cd799439011/status
Response: { status: "failed" }
```

### Test 3: Pago Duplicado

```bash
# No permitir procesar el mismo paymentId dos veces
# Validar status del pago antes de procesar
```

---

## 🔧 VARIABLES DE CONFIGURACIÓN

Crear un archivo `.properties` o `.env`:

```properties
# Puerto del banco
server.port=8080

# RUMI Backend
rumi.api.url=http://localhost:3000/api
rumi.api.key=sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0

# Base de datos del banco (opcional, si deseas guardar transacciones)
spring.datasource.url=jdbc:mysql://localhost:3306/rumi_bank
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# Proveedor de pagos (Stripe, MercadoPago, etc.)
payment.provider=stripe
payment.provider.api.key=sk_test_abc123...
```

---

## 📊 ESTRUCTURA DE TABLA RECOMENDADA (si usas BD)

```sql
CREATE TABLE bank_transactions (
    id VARCHAR(255) PRIMARY KEY,
    payment_id VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- completed, failed, pending
    card_last_four VARCHAR(4),
    student_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Validación de Requests
- Siempre validar que `paymentId` existe antes de procesar
- Validar que el monto coincida con lo esperado
- Rechazar si status ya es "completed" (evitar duplicados)

### 2. Manejo de Errores
- No revelar detalles de tarjetas en mensajes de error
- Loguear todos los errores para debugging
- Enviar email de confirmación/error al estudiante

### 3. Retry Logic
- Si el POST a RUMI falla, reintentar después de X segundos
- Máximo 3 intentos antes de marcar como error
- Guardar el webhook fallido para retry manual

### 4. Timeout
- Timeout de conexión: 10 segundos
- Timeout de socket: 30 segundos
- Timeout general de transacción: 5 minutos

### 5. Logging
```java
logger.info("Pago iniciado: paymentId={}", paymentId);
logger.debug("Confirmando en RUMI: {}", paymentData);
logger.error("Error confirmando pago:", exception);
```

---

## 📞 CONTACTO Y PREGUNTAS

**Equipo RUMI:**
- Email: dev@rumi.com
- Teléfono: +[TU_PAÍS] [NÚMERO]
- Chat: [Slack/Discord/Whatsapp]

**Para este desarrollador Java:**
- Preguntas sobre especificación: Contactar Product Manager
- Preguntas técnicas: Contactar Tech Lead
- Emergencias: Contactar CTO

---

## ✅ CHECKLIST PARA DESARROLLADOR JAVA

- [ ] He entendido el flujo completo de pagos
- [ ] He identificado los 2 endpoints principales que necesito crear:
  - [ ] GET /api/transactions/initiate/{paymentId}
  - [ ] POST /api/transactions/process
- [ ] He entendido que debo hacer POST a `/api/payments/{paymentId}/confirm` en RUMI
- [ ] He configurado las variables de entorno correctamente
- [ ] He creado la clase/modelo para PaymentRequest
- [ ] He implementado la integración HTTP con RUMI
- [ ] He configurado autenticación Bearer Token
- [ ] He creado una BD para guardar transacciones (opcional)
- [ ] He testeado los 3 escenarios de prueba
- [ ] He preparado manejo de errores y logging
- [ ] He documentado mi API en Postman/Swagger
- [ ] He comunicado la URL de mi banco al equipo RUMI

---

## 📚 RECURSOS ÚTILES

### Librerías Java Recomendadas
```xml
<!-- HTTP Client -->
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
</dependency>

<!-- JSON Processing -->
<dependency>
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
</dependency>

<!-- Spring Boot (si usas Spring) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### Documentación Externa
- [HTTP Client Java 11+](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html)
- [Spring Boot REST](https://spring.io/guides/gs/rest-service/)
- [JSON en Java](https://www.json.org/json-en.html)

---

**Documento versión:** 1.0  
**Última actualización:** 14 de Enero de 2026  
**Responsable:** Equipo de RUMI
