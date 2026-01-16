# 🔧 GUÍA TÉCNICA DE IMPLEMENTACIÓN - BANCO JAVA

**Para:** Desarrollador Java  
**Tema:** Implementar endpoints de procesamiento de pagos  
**Stack:** Spring Boot + Java HttpClient  

---

## 📋 TABLA DE CONTENIDOS

1. Estructura del Proyecto
2. Modelos de Datos
3. Implementación de Endpoints
4. Integración con RUMI
5. Ejemplos Completos
6. Testing

---

## 📁 ESTRUCTURA DEL PROYECTO RECOMENDADA

```
rumi-bank/
├── src/main/java/com/rumi/bank/
│   ├── controller/
│   │   ├── PaymentController.java          ← GET/POST de transacciones
│   │   └── WebhookController.java          ← Recibir eventos de RUMI
│   │
│   ├── model/
│   │   ├── BankTransaction.java            ← Modelo de BD
│   │   ├── PaymentRequest.java             ← Request de pago
│   │   └── PaymentResponse.java            ← Response
│   │
│   ├── service/
│   │   ├── PaymentProcessingService.java   ← Lógica de procesamiento
│   │   ├── RumiIntegrationService.java     ← Llamadas a RUMI
│   │   └── PaymentProviderService.java     ← Integración con Stripe/etc
│   │
│   ├── repository/
│   │   └── BankTransactionRepository.java  ← Acceso a BD
│   │
│   ├── util/
│   │   ├── HttpClientUtil.java             ← Cliente HTTP
│   │   └── ValidationUtil.java             ← Validaciones
│   │
│   └── BankApplication.java                ← Main
│
├── src/main/resources/
│   ├── application.properties
│   └── application-dev.properties
│
├── pom.xml
└── README.md
```

---

## 🏗️ MODELOS DE DATOS

### 1. Model: BankTransaction (BD)

```java
package com.rumi.bank.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {
    
    @Id
    private String bankTransactionId;  // BANK-TXN-20260114-001234
    
    @Column(nullable = false, unique = true)
    private String paymentId;  // ID de RUMI
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(nullable = false, length = 3)
    private String currency;  // USD, COP, MXN, ARS
    
    @Column(nullable = false)
    private String status;  // completed, failed, pending, refunded
    
    @Column(length = 4)
    private String cardLastFour;  // Últimos 4 dígitos
    
    @Column(length = 255)
    private String studentEmail;
    
    @Column(length = 255)
    private String studentName;
    
    @Column(length = 255)
    private String courseTitle;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;  // Si falló, guardar error
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // ========== CONSTRUCTORES ==========
    public BankTransaction() {}
    
    public BankTransaction(String bankTransactionId, String paymentId, 
                          BigDecimal amount, String currency) {
        this.bankTransactionId = bankTransactionId;
        this.paymentId = paymentId;
        this.amount = amount;
        this.currency = currency;
        this.status = "pending";
    }
    
    // ========== GETTERS Y SETTERS ==========
    public String getBankTransactionId() { return bankTransactionId; }
    public void setBankTransactionId(String bankTransactionId) { 
        this.bankTransactionId = bankTransactionId; 
    }
    
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCardLastFour() { return cardLastFour; }
    public void setCardLastFour(String cardLastFour) { 
        this.cardLastFour = cardLastFour; 
    }
    
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { 
        this.studentEmail = studentEmail; 
    }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { 
        this.studentName = studentName; 
    }
    
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { 
        this.courseTitle = courseTitle; 
    }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { 
        this.errorMessage = errorMessage; 
    }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { 
        this.updatedAt = updatedAt; 
    }
}
```

### 2. DTO: PaymentRequest

```java
package com.rumi.bank.model.dto;

import java.math.BigDecimal;

public class PaymentRequest {
    
    private String paymentId;           // ID del pago en RUMI
    private BigDecimal amount;
    private String currency;
    private String cardNumber;          // Número de tarjeta
    private int expiryMonth;            // Mes de vencimiento
    private int expiryYear;             // Año de vencimiento
    private String cvv;                 // Código de seguridad
    private String cardHolder;          // Titular de tarjeta
    private String studentEmail;
    private String studentName;
    
    // ========== CONSTRUCTORES ==========
    public PaymentRequest() {}
    
    public PaymentRequest(String paymentId, BigDecimal amount, String currency) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.currency = currency;
    }
    
    // ========== GETTERS Y SETTERS ==========
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    
    public int getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(int expiryMonth) { 
        this.expiryMonth = expiryMonth; 
    }
    
    public int getExpiryYear() { return expiryYear; }
    public void setExpiryYear(int expiryYear) { this.expiryYear = expiryYear; }
    
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
    
    public String getCardHolder() { return cardHolder; }
    public void setCardHolder(String cardHolder) { 
        this.cardHolder = cardHolder; 
    }
    
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { 
        this.studentEmail = studentEmail; 
    }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { 
        this.studentName = studentName; 
    }
}
```

### 3. DTO: PaymentResponse

```java
package com.rumi.bank.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    
    private boolean success;
    private String message;
    private String bankTransactionId;
    private String paymentId;
    private String status;           // completed, failed, pending
    private BigDecimal amount;
    private String currency;
    private LocalDateTime processedAt;
    
    // ========== CONSTRUCTORES ==========
    public PaymentResponse() {
        this.success = false;
        this.message = "";
    }
    
    public PaymentResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public PaymentResponse(boolean success, String message, String bankTransactionId) {
        this.success = success;
        this.message = message;
        this.bankTransactionId = bankTransactionId;
    }
    
    // ========== GETTERS Y SETTERS ==========
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getBankTransactionId() { return bankTransactionId; }
    public void setBankTransactionId(String bankTransactionId) { 
        this.bankTransactionId = bankTransactionId; 
    }
    
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { 
        this.processedAt = processedAt; 
    }
}
```

---

## 🎯 SERVICIOS

### 1. RumiIntegrationService - Integración con RUMI

```java
package com.rumi.bank.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.math.BigDecimal;
import java.time.Duration;

@Service
public class RumiIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(
        RumiIntegrationService.class
    );
    
    @Value("${rumi.api.url}")
    private String rumiApiUrl;  // http://localhost:3000/api
    
    @Value("${rumi.api.key}")
    private String rumiApiKey;  // sk_rumi_bank_...
    
    private final HttpClient httpClient;
    
    public RumiIntegrationService() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }
    
    /**
     * Confirmar pago completado en RUMI
     * Llamar esto después de procesar exitosamente el pago
     */
    public boolean confirmPaymentCompleted(
        String paymentId,
        String bankTransactionId,
        BigDecimal amount,
        String currency) {
        
        return confirmPaymentInRumi(
            paymentId,
            bankTransactionId,
            amount,
            currency,
            "completed",
            null
        );
    }
    
    /**
     * Confirmar pago fallido en RUMI
     */
    public boolean confirmPaymentFailed(
        String paymentId,
        String errorMessage) {
        
        return confirmPaymentInRumi(
            paymentId,
            null,
            null,
            null,
            "failed",
            errorMessage
        );
    }
    
    /**
     * Confirmar pago en RUMI (método genérico)
     */
    private boolean confirmPaymentInRumi(
        String paymentId,
        String bankTransactionId,
        BigDecimal amount,
        String currency,
        String status,
        String errorMessage) {
        
        try {
            // Construir URL
            String url = rumiApiUrl + "/payments/" + paymentId + "/confirm";
            
            logger.info("Confirmando pago en RUMI: paymentId={}, status={}", 
                paymentId, status);
            
            // Construir JSON del body
            JSONObject bodyJson = new JSONObject();
            
            if ("completed".equals(status)) {
                bodyJson.put("bankTransactionId", bankTransactionId);
                bodyJson.put("amount", amount);
                bodyJson.put("currency", currency);
            }
            
            bodyJson.put("status", status);
            bodyJson.put("timestamp", Instant.now().toString());
            
            if (errorMessage != null) {
                bodyJson.put("errorMessage", errorMessage);
            }
            
            // Crear HTTP Request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + rumiApiKey)
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson.toString()))
                .build();
            
            logger.debug("Enviando request a: {}", url);
            logger.debug("Body: {}", bodyJson.toString());
            
            // Enviar request
            HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );
            
            // Verificar respuesta
            if (response.statusCode() == 200) {
                logger.info("✓ Confirmación exitosa en RUMI");
                logger.debug("Respuesta: {}", response.body());
                return true;
            } else {
                logger.error("✗ Error confirmando en RUMI. Status: {}, Body: {}",
                    response.statusCode(), response.body());
                return false;
            }
            
        } catch (Exception e) {
            logger.error("✗ Excepción al confirmar pago en RUMI", e);
            return false;
        }
    }
    
    /**
     * Obtener detalles del pago desde RUMI
     */
    public String getPaymentDetails(String paymentId) {
        try {
            String url = rumiApiUrl + "/payments/" + paymentId + "/status";
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + rumiApiKey)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
            
            logger.info("Obteniendo detalles de pago: {}", paymentId);
            
            HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );
            
            if (response.statusCode() == 200) {
                logger.debug("Detalles obtenidos: {}", response.body());
                return response.body();
            } else {
                logger.error("Error obteniendo detalles: {}", response.statusCode());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Excepción obteniendo detalles de pago", e);
            return null;
        }
    }
}
```

### 2. PaymentProcessingService - Lógica de Procesamiento

```java
package com.rumi.bank.service;

import com.rumi.bank.model.BankTransaction;
import com.rumi.bank.model.dto.PaymentRequest;
import com.rumi.bank.model.dto.PaymentResponse;
import com.rumi.bank.repository.BankTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(
        PaymentProcessingService.class
    );
    
    @Autowired
    private BankTransactionRepository bankTransactionRepository;
    
    @Autowired
    private RumiIntegrationService rumiIntegrationService;
    
    @Autowired
    private PaymentProviderService paymentProviderService;  // Stripe, etc.
    
    /**
     * Procesar pago del estudiante
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        
        PaymentResponse response = new PaymentResponse();
        String paymentId = request.getPaymentId();
        
        try {
            logger.info("Iniciando procesamiento de pago: {}", paymentId);
            
            // 1. Validar request
            if (!isValidPaymentRequest(request)) {
                response.setSuccess(false);
                response.setMessage("Datos de pago inválidos");
                logger.warn("Request inválido para paymentId: {}", paymentId);
                return response;
            }
            
            // 2. Verificar si ya existe transacción
            Optional<BankTransaction> existingTransaction = 
                bankTransactionRepository.findByPaymentId(paymentId);
            
            if (existingTransaction.isPresent() && 
                "completed".equals(existingTransaction.get().getStatus())) {
                response.setSuccess(false);
                response.setMessage("Este pago ya fue procesado");
                logger.warn("Intento de procesar pago duplicado: {}", paymentId);
                return response;
            }
            
            // 3. Generar ID único de transacción bancaria
            String bankTransactionId = generateBankTransactionId();
            
            // 4. Crear registro en BD (status: pending)
            BankTransaction transaction = new BankTransaction(
                bankTransactionId,
                paymentId,
                request.getAmount(),
                request.getCurrency()
            );
            transaction.setStudentEmail(request.getStudentEmail());
            transaction.setStudentName(request.getStudentName());
            transaction.setCardLastFour(request.getCardNumber().substring(
                request.getCardNumber().length() - 4
            ));
            
            bankTransactionRepository.save(transaction);
            logger.info("Transacción creada en BD: {}", bankTransactionId);
            
            // 5. Procesar con proveedor de pagos
            boolean paymentProcessed = paymentProviderService.processCardPayment(request);
            
            if (paymentProcessed) {
                
                // 6. Actualizar status a completed
                transaction.setStatus("completed");
                transaction.setUpdatedAt(LocalDateTime.now());
                bankTransactionRepository.save(transaction);
                logger.info("Pago procesado exitosamente: {}", bankTransactionId);
                
                // 7. Notificar a RUMI
                boolean rumiNotified = rumiIntegrationService.confirmPaymentCompleted(
                    paymentId,
                    bankTransactionId,
                    request.getAmount(),
                    request.getCurrency()
                );
                
                if (rumiNotified) {
                    response.setSuccess(true);
                    response.setMessage("Pago completado exitosamente");
                    response.setBankTransactionId(bankTransactionId);
                    response.setStatus("completed");
                    response.setAmount(request.getAmount());
                    response.setCurrency(request.getCurrency());
                    response.setProcessedAt(LocalDateTime.now());
                } else {
                    // Pago procesado pero fallo notificación a RUMI
                    logger.error(
                        "Pago procesado pero fallo notificación a RUMI: {}", 
                        paymentId
                    );
                    // Reintentar más tarde o marcar para revisión manual
                }
                
            } else {
                
                // 6. Actualizar status a failed
                transaction.setStatus("failed");
                transaction.setErrorMessage("Tarjeta rechazada o fondos insuficientes");
                transaction.setUpdatedAt(LocalDateTime.now());
                bankTransactionRepository.save(transaction);
                logger.warn("Pago rechazado: {}", bankTransactionId);
                
                // 7. Notificar a RUMI
                rumiIntegrationService.confirmPaymentFailed(
                    paymentId,
                    "Tarjeta rechazada"
                );
                
                response.setSuccess(false);
                response.setMessage("Pago rechazado. Intenta con otra tarjeta.");
                response.setStatus("failed");
            }
            
        } catch (Exception e) {
            logger.error("Excepción procesando pago", e);
            
            // Notificar a RUMI del error
            rumiIntegrationService.confirmPaymentFailed(
                paymentId,
                "Error interno: " + e.getMessage()
            );
            
            response.setSuccess(false);
            response.setMessage("Error procesando el pago. Intenta más tarde.");
        }
        
        return response;
    }
    
    /**
     * Validar datos del request
     */
    private boolean isValidPaymentRequest(PaymentRequest request) {
        
        if (request.getPaymentId() == null || 
            request.getPaymentId().isEmpty()) {
            return false;
        }
        
        if (request.getAmount() == null || 
            request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        
        if (request.getCardNumber() == null || 
            !request.getCardNumber().matches("\\d{13,19}")) {
            return false;
        }
        
        if (request.getExpiryMonth() < 1 || 
            request.getExpiryMonth() > 12) {
            return false;
        }
        
        if (request.getExpiryYear() < 2024 || 
            request.getExpiryYear() > 2030) {
            return false;
        }
        
        if (request.getCvv() == null || 
            !request.getCvv().matches("\\d{3,4}")) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Generar ID único de transacción bancaria
     */
    private String generateBankTransactionId() {
        long timestamp = System.currentTimeMillis();
        String random = UUID.randomUUID().toString()
            .substring(0, 8)
            .toUpperCase();
        return String.format("BANK-TXN-%d-%s", timestamp, random);
    }
}
```

### 3. PaymentProviderService - Integración con Proveedor

```java
package com.rumi.bank.service;

import com.rumi.bank.model.dto.PaymentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Este es un ejemplo genérico.
 * En producción, integrar con Stripe, MercadoPago, etc.
 */
@Service
public class PaymentProviderService {
    
    private static final Logger logger = LoggerFactory.getLogger(
        PaymentProviderService.class
    );
    
    @Value("${payment.provider:mock}")
    private String paymentProvider;  // mock, stripe, mercadopago, etc.
    
    /**
     * Procesar pago con tarjeta
     */
    public boolean processCardPayment(PaymentRequest request) {
        
        logger.info("Procesando pago con proveedor: {}", paymentProvider);
        
        switch (paymentProvider) {
            case "stripe":
                return processWithStripe(request);
            case "mercadopago":
                return processWithMercadoPago(request);
            case "mock":
            default:
                return processWithMockProvider(request);
        }
    }
    
    /**
     * Procesar con Stripe (pseudocódigo)
     */
    private boolean processWithStripe(PaymentRequest request) {
        // TODO: Implementar integración con Stripe
        // 1. Tokenizar tarjeta
        // 2. Crear charge
        // 3. Capturar en BD
        logger.info("Procesando con Stripe");
        return false;  // Por ahora
    }
    
    /**
     * Procesar con MercadoPago (pseudocódigo)
     */
    private boolean processWithMercadoPago(PaymentRequest request) {
        // TODO: Implementar integración con MercadoPago
        logger.info("Procesando con MercadoPago");
        return false;  // Por ahora
    }
    
    /**
     * Procesador Mock para testing
     * Simula pagos exitosos y fallidos según el número de tarjeta
     */
    private boolean processWithMockProvider(PaymentRequest request) {
        
        String cardNumber = request.getCardNumber();
        
        // Tarjeta de test exitosa
        if (cardNumber.equals("4111111111111111")) {
            logger.info("✓ Mock: Pago exitoso");
            return true;
        }
        
        // Tarjeta de test fallida
        if (cardNumber.equals("4000000000000002")) {
            logger.info("✗ Mock: Tarjeta rechazada");
            return false;
        }
        
        // Por defecto, rechazar
        logger.warn("✗ Mock: Tarjeta no reconocida");
        return false;
    }
}
```

---

## 🎮 CONTROLADORES

### PaymentController

```java
package com.rumi.bank.controller;

import com.rumi.bank.model.dto.PaymentRequest;
import com.rumi.bank.model.dto.PaymentResponse;
import com.rumi.bank.service.PaymentProcessingService;
import com.rumi.bank.service.RumiIntegrationService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(
        PaymentController.class
    );
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    @Autowired
    private RumiIntegrationService rumiIntegrationService;
    
    /**
     * GET /api/transactions/initiate/{paymentId}
     * Mostrar página de pago al estudiante
     */
    @GetMapping("/initiate/{paymentId}")
    public ResponseEntity<?> initiatePay(@PathVariable String paymentId) {
        
        logger.info("Iniciando pago: {}", paymentId);
        
        try {
            // Obtener detalles del pago desde RUMI
            String paymentDetailsJson = rumiIntegrationService.getPaymentDetails(
                paymentId
            );
            
            if (paymentDetailsJson == null) {
                return ResponseEntity.badRequest()
                    .body(new JSONObject()
                        .put("success", false)
                        .put("message", "Pago no encontrado")
                        .toString());
            }
            
            // Parsear JSON y retornar información
            JSONObject paymentDetails = new JSONObject(paymentDetailsJson);
            
            return ResponseEntity.ok()
                .body(new JSONObject()
                    .put("success", true)
                    .put("paymentId", paymentId)
                    .put("amount", paymentDetails.getDouble("amount"))
                    .put("currency", paymentDetails.getString("currency"))
                    .put("message", "Por favor ingresa tus datos de pago")
                    .toString());
            
        } catch (Exception e) {
            logger.error("Error iniciando pago", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new JSONObject()
                    .put("success", false)
                    .put("message", "Error procesando la solicitud")
                    .toString());
        }
    }
    
    /**
     * POST /api/transactions/process
     * Procesar el pago
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        
        logger.info("Procesando pago: paymentId={}", request.getPaymentId());
        
        try {
            // Procesar pago
            PaymentResponse paymentResponse = paymentProcessingService
                .processPayment(request);
            
            if (paymentResponse.isSuccess()) {
                return ResponseEntity.ok(paymentResponse);
            } else {
                return ResponseEntity.badRequest().body(paymentResponse);
            }
            
        } catch (Exception e) {
            logger.error("Error procesando pago", e);
            PaymentResponse response = new PaymentResponse();
            response.setSuccess(false);
            response.setMessage("Error procesando el pago");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
        }
    }
    
    /**
     * GET /api/transactions/{paymentId}/details
     * Obtener detalles de una transacción
     */
    @GetMapping("/{paymentId}/details")
    public ResponseEntity<?> getTransactionDetails(
        @PathVariable String paymentId) {
        
        logger.info("Obteniendo detalles: {}", paymentId);
        
        try {
            String details = rumiIntegrationService.getPaymentDetails(paymentId);
            
            if (details != null) {
                return ResponseEntity.ok(new JSONObject(details));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error obteniendo detalles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

---

## 🗄️ REPOSITORY

```java
package com.rumi.bank.repository;

import com.rumi.bank.model.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankTransactionRepository 
    extends JpaRepository<BankTransaction, String> {
    
    Optional<BankTransaction> findByPaymentId(String paymentId);
    Optional<BankTransaction> findByBankTransactionId(String bankTransactionId);
}
```

---

## ⚙️ CONFIGURACIÓN

### application.properties

```properties
# SERVER
server.port=8080
server.servlet.context-path=/

# DATABASE (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/rumi_bank?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# LOGGING
logging.level.root=INFO
logging.level.com.rumi.bank=DEBUG

# RUMI INTEGRATION
rumi.api.url=http://localhost:3000/api
rumi.api.key=sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0

# PAYMENT PROVIDER
payment.provider=mock
# payment.provider=stripe
# payment.provider.api.key=sk_test_abc123...
```

### pom.xml (Dependencias)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                            http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.0</version>
    </parent>
    
    <groupId>com.rumi</groupId>
    <artifactId>rumi-bank</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>org.json</groupId>
            <artifactId>json</artifactId>
            <version>20230227</version>
        </dependency>
        
        <!-- Logging -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 🧪 TESTING

### Test del Flujo Completo (Postman)

```
# 1. Iniciar pago
GET http://localhost:8080/api/transactions/initiate/507f1f77bcf86cd799439011

# Response esperada:
{
  "success": true,
  "paymentId": "507f1f77bcf86cd799439011",
  "amount": 49.99,
  "currency": "USD",
  "message": "Por favor ingresa tus datos de pago"
}

# 2. Procesar pago
POST http://localhost:8080/api/transactions/process
Content-Type: application/json

{
  "paymentId": "507f1f77bcf86cd799439011",
  "amount": 49.99,
  "currency": "USD",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "cvv": "123",
  "cardHolder": "Juan Pérez",
  "studentEmail": "juan@example.com",
  "studentName": "Juan Pérez"
}

# Response esperada:
{
  "success": true,
  "message": "Pago completado exitosamente",
  "bankTransactionId": "BANK-TXN-1704538200000-A1B2C3D4",
  "status": "completed",
  "amount": 49.99,
  "currency": "USD",
  "processedAt": "2026-01-14T10:30:00"
}

# 3. Obtener detalles
GET http://localhost:8080/api/transactions/507f1f77bcf86cd799439011/details
```

---

## 🚀 EJECUCIÓN

```bash
# 1. Compilar
mvn clean package

# 2. Ejecutar
mvn spring-boot:run

# O directamente:
java -jar target/rumi-bank-1.0.0.jar

# La aplicación estará en: http://localhost:8080
```

---

**Documento de Implementación v1.0**  
**Última actualización: 14 Enero 2026**
