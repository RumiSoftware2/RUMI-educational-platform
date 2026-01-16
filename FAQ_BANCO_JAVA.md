# ❓ PREGUNTAS FRECUENTES (FAQ) - BANCO JAVA

**Para Desarrolladores, Tech Leads y Product Managers**

---

## 📋 TABLA DE CONTENIDOS

1. [Preguntas Técnicas](#preguntas-técnicas)
2. [Preguntas de Integración](#preguntas-de-integración)
3. [Preguntas de Seguridad](#preguntas-de-seguridad)
4. [Preguntas de Testing](#preguntas-de-testing)
5. [Preguntas de Producción](#preguntas-de-producción)
6. [Preguntas de Negocio](#preguntas-de-negocio)

---

## 🔧 PREGUNTAS TÉCNICAS

### P1: ¿Qué lenguaje/framework debes usar para el banco?

**R:** Puedes usar cualquiera, pero recomendamos:
- **Recomendado:** Spring Boot (Java) - Robusto, fácil de mantener
- **Alternativa:** Node.js + Express - Si ya tienes experiencia
- **Alternativa:** Python + Flask - Para MVP rápido

Nosotros esperamos HTTP REST, así que cualquier lenguaje funciona.

---

### P2: ¿Necesito crear una base de datos?

**R:** Opcional pero recomendado. Te sugerimos:

```
Almacenar:
✅ bankTransactionId
✅ paymentId (FK a RUMI)
✅ amount, currency
✅ status (completed, failed, pending)
✅ cardLastFour (últimos 4 dígitos)
✅ studentEmail
✅ timestamp

NO almacenar:
❌ Números de tarjeta completos
❌ CVV
❌ PINs u datos sensibles

Razones para tener BD:
✅ Auditoría: ver qué pasó con cada transacción
✅ Debugging: si falla webhook, puedo reintentar
✅ Reportes: cuántos pagos, cuánto dinero, etc.
✅ Seguridad: trazabilidad
```

---

### P3: ¿Qué librerías Java usar para HTTP?

**R:** Dos opciones principales:

**Opción 1: java.net.http (Nativa desde Java 11)**
```java
HttpClient httpClient = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://..."))
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();
HttpResponse<String> response = httpClient.send(request, 
    HttpResponse.BodyHandlers.ofString());
```
✅ Pro: No necesitas dependencias externas
❌ Contra: Requiere Java 11+

**Opción 2: Apache HttpClient**
```xml
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
</dependency>
```
✅ Pro: Más flexible, más features
❌ Contra: Dependencia extra

**Recomendación:** Usa java.net.http si tienes Java 11+. Si no, Apache HttpClient.

---

### P4: ¿Debo usar JSON o XML?

**R:** **JSON.** RUMI espera JSON.

```java
// ✅ CORRECTO
String json = new JSONObject()
    .put("bankTransactionId", "BANK-TXN-123")
    .put("status", "completed")
    .toString();

// ❌ INCORRECTO
String xml = "<?xml version='1.0'?><payment>...</payment>";
```

---

### P5: ¿Cómo genero el bankTransactionId?

**R:** Sigue este formato:

```
BANK-TXN-{timestamp}-{random}

Ejemplo: BANK-TXN-1704538200000-A1B2C3D4

Código Java:
long timestamp = System.currentTimeMillis();
String random = UUID.randomUUID().toString()
    .substring(0, 8)
    .toUpperCase();
String bankTransactionId = 
    String.format("BANK-TXN-%d-%s", timestamp, random);
```

**Requisitos:**
✅ Único (nunca dos iguales)
✅ Que incluya timestamp (para debugging)
✅ Que incluya aleatorio (para seguridad)
✅ Que sea fácil de leer

---

### P6: ¿Cómo debo validar los datos del pago?

**R:** Valida esto ANTES de procesar:

```java
public boolean isValidPaymentRequest(PaymentRequest request) {
    
    // Validar paymentId
    if (request.getPaymentId() == null || 
        request.getPaymentId().isEmpty()) {
        return false;
    }
    
    // Validar monto
    if (request.getAmount() == null || 
        request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
        return false;
    }
    
    // Validar tarjeta (13-19 dígitos)
    if (!request.getCardNumber().matches("\\d{13,19}")) {
        return false;
    }
    
    // Validar fecha de expiración
    if (request.getExpiryMonth() < 1 || 
        request.getExpiryMonth() > 12) {
        return false;
    }
    if (request.getExpiryYear() < 2024 || 
        request.getExpiryYear() > 2030) {
        return false;
    }
    
    // Validar CVV (3-4 dígitos)
    if (!request.getCvv().matches("\\d{3,4}")) {
        return false;
    }
    
    return true;
}
```

---

### P7: ¿Qué timeout debo usar?

**R:** Recomendaciones:

```java
HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))  // Conexión inicial
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .timeout(Duration.ofSeconds(30))  // Respuesta total
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();
```

**Valores sugeridos:**
- Connection Timeout: 10 segundos
- Read Timeout: 30 segundos
- Total Timeout: 5 minutos (para pago completo)

---

## 🔗 PREGUNTAS DE INTEGRACIÓN

### P8: ¿En qué orden se ejecutan las cosas?

**R:** Así:

```
1. Frontend hace POST a Backend RUMI (crear pago)
2. Backend RUMI retorna paymentId
3. Frontend redirige a Tu Banco: GET /api/transactions/initiate/{paymentId}
4. Tu Banco obtiene detalles del pago desde RUMI
5. Tu Banco muestra pantalla de pago
6. Estudiante ingresa datos de tarjeta
7. Frontend hace POST /api/transactions/process
8. Tu Banco procesa con Stripe/MercadoPago
9. Tu Banco hace POST a RUMI para confirmar
10. RUMI actualiza el pago a "completed"
11. Frontend recibe confirmación
12. ✅ Listo
```

---

### P9: ¿Qué pasa si mi POST a RUMI falla?

**R:** Manejo de errores recomendado:

```java
boolean rumiNotified = rumiIntegrationService.confirmPaymentCompleted(
    paymentId,
    bankTransactionId,
    amount,
    currency
);

if (!rumiNotified) {
    // El pago fue procesado pero RUMI no se enteró
    
    // Opción 1: Reintentar después de 5 segundos
    Thread.sleep(5000);
    rumiNotified = rumiIntegrationService.confirmPaymentCompleted(
        paymentId, bankTransactionId, amount, currency
    );
    
    // Opción 2: Si aún falla, loguear para revisión manual
    if (!rumiNotified) {
        logger.error(
            "CRÍTICO: Pago procesado pero NO se notificó a RUMI. " +
            "paymentId={}, bankTransactionId={}",
            paymentId, bankTransactionId
        );
        
        // Guardar para revisión posterior
        saveForManualReview(paymentId, bankTransactionId);
    }
}
```

---

### P10: ¿Debo validar que el paymentId existe en RUMI?

**R:** **SÍ, absolutamente.** Hazlo así:

```java
@GetMapping("/initiate/{paymentId}")
public ResponseEntity<?> initiatePay(@PathVariable String paymentId) {
    
    // 1. Verificar que paymentId existe en RUMI
    String paymentDetails = rumiIntegrationService.getPaymentDetails(
        paymentId
    );
    
    if (paymentDetails == null) {
        // paymentId no existe
        return ResponseEntity.badRequest()
            .body(new JSONObject()
                .put("error", "Pago no encontrado")
                .toString());
    }
    
    // 2. Si existe, proceder a mostrar pantalla
    // ...
}
```

**Por qué:** Evita que alguien intente pagar con un ID falso o manipulado.

---

### P11: ¿Cómo integro con Stripe/MercadoPago?

**R:** Depende de tu proveedor. Ejemplo con Stripe:

```java
// 1. Obtener librería de Stripe
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
</dependency>

// 2. Procesamiento
private boolean processWithStripe(PaymentRequest request) {
    try {
        Map<String, Object> params = new HashMap<>();
        params.put("amount", request.getAmount().intValue() * 100); // En centavos
        params.put("currency", request.getCurrency().toLowerCase());
        params.put("source", "tok_visa");  // Token de la tarjeta
        params.put("description", "RUMI Course Payment");
        
        Charge charge = Charge.create(params);
        
        if (charge.getPaid()) {
            logger.info("Pago de Stripe exitoso: {}", charge.getId());
            return true;
        } else {
            logger.error("Pago de Stripe rechazado");
            return false;
        }
    } catch (StripeException e) {
        logger.error("Error procesando con Stripe", e);
        return false;
    }
}
```

---

## 🔐 PREGUNTAS DE SEGURIDAD

### P12: ¿Cómo evito que manipulen el monto?

**R:** **Siempre valida el monto en RUMI.** No confíes en lo que envía el cliente:

```java
@PostMapping("/process")
public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
    
    String paymentId = request.getPaymentId();
    BigDecimal clientAmount = request.getAmount();
    
    // 1. Obtener el monto correcto desde RUMI
    String paymentDetails = rumiIntegrationService.getPaymentDetails(
        paymentId
    );
    JSONObject payment = new JSONObject(paymentDetails);
    BigDecimal rumiAmount = payment.getBigDecimal("amount");
    
    // 2. Comparar
    if (!clientAmount.equals(rumiAmount)) {
        logger.warn("ALERTA: Intento de manipulación de monto. " +
                   "Cliente: {}, RUMI: {}", clientAmount, rumiAmount);
        return ResponseEntity.badRequest()
            .body(new JSONObject()
                .put("error", "Monto no coincide")
                .toString());
    }
    
    // 3. Si coincide, proceder
    // ...
}
```

---

### P13: ¿Debo guardar números de tarjeta?

**R:** **NO. Nunca guardes números de tarjeta completos.**

```java
// ❌ INCORRECTO
bankTransaction.setCardNumber(request.getCardNumber()); // ¡NO!

// ✅ CORRECTO - Solo guarda últimos 4 dígitos
String cardNumber = request.getCardNumber();
String lastFour = cardNumber.substring(cardNumber.length() - 4);
bankTransaction.setCardLastFour(lastFour);  // Solo "1111"
```

**Por qué:**
- Cumplimiento PCI DSS
- Protección de datos del cliente
- Seguridad legal

---

### P14: ¿Cómo valido el Bearer Token?

**R:** Valida en cada request:

```java
private boolean isValidAuthorization(String authHeader) {
    
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        logger.warn("Authorization header inválido");
        return false;
    }
    
    String token = authHeader.substring("Bearer ".length());
    String expectedKey = System.getenv("RUMI_API_KEY");
    
    if (!token.equals(expectedKey)) {
        logger.warn("Token no coincide");
        return false;
    }
    
    return true;
}

@PostMapping("/confirm-webhook")
public ResponseEntity<?> confirmWebhook(
    @RequestHeader("Authorization") String authHeader,
    @RequestBody String body) {
    
    if (!isValidAuthorization(authHeader)) {
        return ResponseEntity.status(401).build();
    }
    
    // Proceder...
    return ResponseEntity.ok().build();
}
```

---

### P15: ¿Necesito HTTPS?

**R:**
- **Desarrollo:** HTTP está bien (localhost)
- **Staging:** HTTPS es recomendado
- **Producción:** HTTPS es **OBLIGATORIO**

```properties
# application.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=password
server.ssl.key-store-type=PKCS12
```

---

## 🧪 PREGUNTAS DE TESTING

### P16: ¿Cómo teseo el flujo completo?

**R:** Manual + Automatizado:

**Manual (Postman):**

```bash
# 1. Crear pago en RUMI
POST http://localhost:3000/api/payments/courses/507f1f77bcf86cd799439012/pay
Authorization: Bearer {STUDENT_TOKEN}

# 2. Obtener paymentId de respuesta
# Ej: "507f1f77bcf86cd799439011"

# 3. Iniciar pago en tu banco
GET http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011

# 4. Procesar pago
POST http://localhost:8080/api/transactions/process
{
  "paymentId": "507f1f77bcf86cd799439011",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "cvv": "123",
  "cardHolder": "Juan Pérez"
}

# 5. Verificar que RUMI recibió
GET http://localhost:3000/api/payments/507f1f77bcf86cd799439011/status
Authorization: Bearer {TEACHER_TOKEN}
# Debe retornar status: "completed"
```

**Automatizado (JUnit):**

```java
@SpringBootTest
public class PaymentIntegrationTest {
    
    @Autowired
    private PaymentController paymentController;
    
    @Test
    public void testCompletePaymentFlow() {
        // 1. Simular iniciación
        ResponseEntity<?> initResponse = paymentController
            .initiatePay("507f1f77bcf86cd799439011");
        
        assertEquals(200, initResponse.getStatusCodeValue());
        
        // 2. Simular procesamiento
        PaymentRequest request = new PaymentRequest();
        request.setPaymentId("507f1f77bcf86cd799439011");
        request.setCardNumber("4111111111111111");
        request.setAmount(new BigDecimal("49.99"));
        
        ResponseEntity<?> processResponse = paymentController
            .processPayment(request);
        
        assertEquals(200, processResponse.getStatusCodeValue());
    }
}
```

---

### P17: ¿Cómo simulo pagos exitosos y fallidos?

**R:** Usa tarjetas de test:

```java
// En tu PaymentProviderService

private boolean processWithMockProvider(PaymentRequest request) {
    String cardNumber = request.getCardNumber();
    
    // Tarjeta de éxito
    if (cardNumber.equals("4111111111111111")) {
        return true;
    }
    
    // Tarjeta rechazada
    if (cardNumber.equals("4000000000000002")) {
        return false;
    }
    
    // Tarjeta con error
    if (cardNumber.equals("4000000000000069")) {
        throw new Exception("Error procesando tarjeta");
    }
    
    return false;
}
```

**Tarjetas de test comunes:**
- `4111111111111111` - Éxito
- `4000000000000002` - Rechazada
- `4000000000000069` - Error
- `5555555555554444` - Éxito (Mastercard)

---

### P18: ¿Debo testear la integración con RUMI?

**R:** Sí. Hay dos niveles:

**Nivel 1: Mock** (más rápido)
```java
@MockBean
private RumiIntegrationService rumiService;

@Test
public void testPaymentWithMockRumi() {
    when(rumiService.confirmPaymentCompleted(
        anyString(), anyString(), any(), anyString()
    )).thenReturn(true);
    
    // Tu prueba aquí
}
```

**Nivel 2: Real** (más lento pero más confiable)
```java
@SpringBootTest
public class RumiIntegrationRealTest {
    
    @Autowired
    private RumiIntegrationService rumiService;
    
    @Test
    public void testRealIntegrationWithRumi() {
        // Asume que RUMI está corriendo en localhost:3000
        boolean result = rumiService.confirmPaymentCompleted(
            "507f1f77bcf86cd799439011",
            "BANK-TXN-TEST-001",
            new BigDecimal("49.99"),
            "USD"
        );
        
        assertTrue(result);
    }
}
```

---

## 🚀 PREGUNTAS DE PRODUCCIÓN

### P19: ¿Cómo despliego a producción?

**R:** Pasos recomendados:

```bash
# 1. Compilar
mvn clean package

# 2. Crear JAR ejecutable
mvn spring-boot:repackage

# 3. Enviar a servidor
scp target/rumi-bank-1.0.0.jar user@production:/opt/

# 4. Ejecutar en servidor
java -jar rumi-bank-1.0.0.jar \
    --rumi.api.url=https://rumi-backend.tudominio.com/api \
    --rumi.api.key=sk_rumi_bank_prod_...

# 5. O usar Docker:
docker build -t rumi-bank:1.0.0 .
docker run -p 8080:8080 \
    -e RUMI_API_URL=https://... \
    -e RUMI_API_KEY=sk_rumi_bank_prod_... \
    rumi-bank:1.0.0
```

---

### P20: ¿Cómo monitoreo errores en producción?

**R:** Usa logs y alertas:

```java
// 1. Configurar logging
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>

// 2. En tu código
logger.error("CRÍTICO: Error procesando pago", exception);
logger.warn("ADVERTENCIA: Reintentando webhook");
logger.info("INFO: Pago completado exitosamente");

// 3. application.properties
logging.level.com.rumi.bank=DEBUG
logging.file.name=/var/log/rumi-bank/app.log
logging.file.max-size=10MB
logging.file.max-history=30

// 4. Integrar con Sentry/Datadog/New Relic
// Para alertas automáticas de errores
```

---

### P21: ¿Cómo manejo picos de tráfico?

**R:** Recomendaciones:

```
1. Usa caché para paymentId frecuentes
   
   @Cacheable("payments")
   public String getPaymentDetails(String paymentId) { ... }

2. Implenta rate limiting
   
   @RateLimiter(limit = 100, duration = "1m")
   @PostMapping("/process")
   public ResponseEntity<?> processPayment(...) { ... }

3. Usa conexión pool para BD
   
   spring.datasource.hikari.maximum-pool-size=20
   spring.datasource.hikari.minimum-idle=5

4. Mejora con CDN para assets estáticos
5. Usa load balancing (Nginx, HAProxy)
```

---

### P22: ¿Cómo evito duplicación de pagos?

**R:** Valida el estado antes de procesar:

```java
@PostMapping("/process")
public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
    
    String paymentId = request.getPaymentId();
    
    // 1. Buscar si ya existe
    Optional<BankTransaction> existing = 
        repository.findByPaymentId(paymentId);
    
    if (existing.isPresent()) {
        BankTransaction transaction = existing.get();
        
        if ("completed".equals(transaction.getStatus())) {
            // Ya fue pagado - rechazar
            return ResponseEntity.badRequest()
                .body(new JSONObject()
                    .put("error", "Este pago ya fue procesado")
                    .toString());
        }
        
        if ("failed".equals(transaction.getStatus())) {
            // Falló antes - puede reintentar
            // (continuar con procesamiento)
        }
    }
    
    // 2. Proceder
    // ...
}
```

---

## 💼 PREGUNTAS DE NEGOCIO

### P23: ¿Quién se queda con el dinero?

**R:** Depende de tu modelo, pero típicamente:

```
Estudiante paga $49.99
        ↓
Tu Banco recibe $49.99
        ↓
Tu Banco transfiere a RUMI: $49.99
        ↓
RUMI transfiere al Docente: $47.49 (5% comisión de RUMI)
        ↓
Docente recibe: $47.49

O modelo alternativo:

Estudiante paga $49.99
        ↓
Tu Banco retiene comisión: 2% = $0.99
        ↓
Tu Banco transfiere a RUMI: $49.00
        ↓
RUMI da al Docente: $49.00
```

**Esto debe ser configurado por equipo RUMI/Financiero.**

---

### P24: ¿Qué pasa con los reembolsos?

**R:** Flujo de reembolso:

```
1. Docente solicita reembolso a estudiante
2. Estudiante acepta
3. RUMI llama a: POST /api/transactions/{paymentId}/refund
4. Tu Banco:
   - Valida que la transacción existe
   - Contacta a Stripe/MercadoPago para refund
   - Actualiza status a "refunded"
   - Devuelve dinero al estudiante
5. RUMI actualiza su registros
6. Ganancias del docente se restan
```

---

### P25: ¿Hay límites de pago?

**R:** Depende, pero sugerimos:

```
Mínimo por pago: $1 USD (o equivalente)
Máximo por pago: $9,999 USD

Mínimo para docente recibir payout: $50
Máximo por payout: $10,000

Estas son recomendaciones. Ajustar según negocio.
```

---

## 🆘 PREGUNTAS DE SOPORTE

### P26: ¿Dónde obtengo ayuda?

**R:** Canales de soporte:

```
1. Documentación:
   - ESPECIFICACION_BANCO_JAVA_PARA_DESARROLLADOR.md
   - GUIA_TECNICA_IMPLEMENTACION_BANCO_JAVA.md
   - DIAGRAMAS_VISUALES_BANCO_JAVA.md

2. Equipo RUMI:
   - Email: dev@rumi.com
   - Slack: #banco-java
   - Reunión técnica: Viernes 3pm

3. Stack Overflow:
   - Tag: rumi-payments
   - Tag: spring-boot-payments

4. Documentación Externa:
   - Spring Boot: https://spring.io
   - Java HttpClient: https://docs.oracle.com/en/java/javase
```

---

### P27: ¿Cuál es el SLA (Acuerdo de Nivel de Servicio)?

**R:** Objetivos de disponibilidad:

```
Disponibilidad objetivo:    99.5%
Tiempo de respuesta máx:    2 segundos
Uptime esperado:           99.5% del tiempo
Downtime permitido:        ~3.6 horas por mes

Mantenimiento planificado:  Domingos 2am-4am UTC
Notificación de cambios:    72 horas antes
```

---

### P28: ¿Qué hago si algo falla?

**R:** Proceso de escalamiento:

```
Paso 1: Loguear el error (siempre)
  └─ logger.error("ERROR: ...", exception)

Paso 2: Notificar a equipo RUMI
  └─ Slack en #banco-java
  └─ Email a dev@rumi.com

Paso 3: Intentar resolver
  └─ Revisar logs
  └─ Probar en staging
  └─ Hacer rollback si es necesario

Paso 4: Comunicación
  └─ Informar a Product Manager
  └─ Actualizar clientes si es necesario
```

---

## 📞 CONTACTO RÁPIDO

**Tech Lead:** [nombre] - [email] - [teléfono]
**Product Manager:** [nombre] - [email] - [teléfono]
**DevOps:** [nombre] - [email] - [teléfono]
**Emergencias:** [grupo Slack/WhatsApp]

---

## ✅ CHECKLIST DE DUDAS

Antes de comenzar:

- [ ] He leído esta FAQ completa
- [ ] He entendido el flujo de pagos
- [ ] He identificado qué es lo mío y qué es responsabilidad de RUMI
- [ ] Tengo claro cómo conectar mi banco con RUMI
- [ ] Sé qué endpoints debo crear
- [ ] Sé cómo procesar con mi proveedor de pagos
- [ ] Sé cómo hacer el webhook a RUMI
- [ ] Tengo preguntas clarificadas → He contactado a equipo RUMI

---

**FAQ v1.0**  
**Última actualización: 14 de Enero de 2026**  
**¿Más preguntas? Contacta a: dev@rumi.com**
