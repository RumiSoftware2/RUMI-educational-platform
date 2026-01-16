# ⚡ CHEAT SHEET - INFORMACIÓN RÁPIDA DEL BANCO JAVA

**Una página para llevar contigo - Info esencial al alcance**

---

## 🎯 MISIÓN EN UNA LÍNEA

Crear API REST que procese pagos del estudiante y confirme en RUMI mediante webhook.

---

## 📥 QUÉ RECIBE TU BANCO

**Por URL:** `{paymentId}` cuando estudiante hace clic en "Pagar"

**Datos disponibles:**
- Monto: `49.99`
- Moneda: `USD | COP | MXN | ARS`
- Email estudiante: `juan@example.com`
- Email docente: `garcia@example.com`
- Nombre curso: `Python Avanzado`

**Obtener detalles:**
```
GET /api/payments/{paymentId}/status
Authorization: Bearer sk_rumi_bank_20260114_...
```

---

## 📤 QUÉ ENVÍA TU BANCO

**Después de procesar:**

```
POST /api/payments/{paymentId}/confirm
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
```

**Si falla:**
```
{
  "status": "failed",
  "errorMessage": "Tarjeta rechazada"
}
```

---

## 🔧 LOS 3 ENDPOINTS QUE DEBES CREAR

```
1. GET /api/transactions/initiate/{paymentId}
   Response: {paymentId, amount, currency, courseName, ...}

2. POST /api/transactions/process
   Body: {paymentId, cardNumber, expiryMonth, expiryYear, cvv, ...}
   Response: {success, bankTransactionId, status}

3. GET /api/transactions/{paymentId}/details
   Response: {paymentId, bankTransactionId, status, amount, ...}
```

---

## 🔄 FLUJO EN 10 SEGUNDOS

```
Estudiante
    ↓ click "Pagar"
Tu Banco (initiate)
    ↓ muestra pantalla
Estudiante
    ↓ ingresa tarjeta
Tu Banco (process)
    ↓ procesa
    ↓ POST webhook a RUMI
RUMI
    ↓ actualiza pago
✅ Estudiante tiene acceso
```

---

## 🔐 AUTENTICACIÓN

```
Header: Authorization: Bearer {API_KEY}

API_KEY: sk_rumi_bank_20260114_a1b2c3d4e5f6g7h8i9j0
         (Compartido por RUMI)
```

---

## 💱 MONEDAS SOPORTADAS

- **USD** - Dólares estadounidenses
- **COP** - Pesos colombianos
- **MXN** - Pesos mexicanos
- **ARS** - Pesos argentinos

---

## 🛠️ STACK RECOMENDADO

```
Framework: Spring Boot 3.0+
Language: Java 11+
HTTP: java.net.http.HttpClient
JSON: org.json
Database: MySQL 8.0+ (opcional pero recomendado)
Provider: Stripe | MercadoPago | Mock (para dev)
```

---

## 📊 VALIDACIONES CRÍTICAS

```
✅ paymentId existe en RUMI
✅ Monto coincide con lo esperado
✅ No es un pago duplicado (status != completed)
✅ Token Bearer es válido
✅ Nunca guardar tarjeta completa
```

---

## ⚡ TIEMPOS

```
Conectar a RUMI: 10 segundos (timeout)
Leer respuesta: 30 segundos (timeout)
Procesar pago: 1-3 segundos (típico)
Total pago: 5-10 segundos
```

---

## 🔄 RETRY LOGIC

```
Si POST a RUMI falla:
  → Reintentar después de 5 segundos
  → Máximo 3 intentos
  → Si aún falla: loguear para revisión manual
```

---

## 📝 GENERADOR DE bankTransactionId

```
Formato: BANK-TXN-{timestamp}-{random}

Ejemplo:
String id = "BANK-TXN-" + System.currentTimeMillis() + 
            "-" + UUID.randomUUID().toString().substring(0,8);
```

---

## 🧪 TARJETAS DE TEST

```
Exitosa:    4111111111111111
Rechazada:  4000000000000002
Error:      4000000000000069
Mastercard: 5555555555554444
```

---

## 🐛 PROBLEMAS COMUNES

| Problema | Causa | Solución |
|----------|-------|----------|
| "Payment not found" | paymentId no existe | Verificar con RUMI |
| "Auth inválido" | API Key incorrecta | Validar token |
| "Amount mismatch" | Monto manipulado | Validar contra RUMI |
| RUMI no se entera | Webhook falla | Implementar retry |
| Duplicado | Procesar 2 veces | Validar status |

---

## 📚 DOCUMENTACIÓN (Orden de Lectura)

1. **INDICE_DOCUMENTACION_BANCO_JAVA.md** (5 min)
2. **RESUMEN_EJECUTIVO_BANCO_JAVA.md** (10 min)
3. **DIAGRAMAS_VISUALES_BANCO_JAVA.md** (15 min)
4. **ESPECIFICACION_BANCO_JAVA_PARA_DESARROLLADOR.md** (1 hora)
5. **GUIA_TECNICA_IMPLEMENTACION_BANCO_JAVA.md** (código, 3-5 días)
6. **FAQ_BANCO_JAVA.md** (cuando tengas dudas)

---

## ✅ CHECKLIST PRE-CÓDIGO

- [ ] Entiendo el flujo de pagos
- [ ] Sé qué 3 endpoints crear
- [ ] Sé exactamente qué POST a RUMI
- [ ] Tengo las credenciales (API Key)
- [ ] Tengo stack decidido (Spring Boot, etc)
- [ ] Tengo provider de pagos (Stripe, etc)
- [ ] Estoy listo para empezar

---

## 🚀 PRIMEROS PASOS CÓDIGO

```java
// 1. Crear controlador
@RestController
@RequestMapping("/api/transactions")
public class PaymentController { }

// 2. Crear servicio de integración
@Service
public class RumiIntegrationService {
    public boolean confirmPaymentCompleted(
        String paymentId, 
        String bankTransactionId,
        BigDecimal amount,
        String currency) { }
}

// 3. Crear endpoint GET para mostrar
@GetMapping("/initiate/{paymentId}")
public ResponseEntity<?> initiatePay(...) { }

// 4. Crear endpoint POST para procesar
@PostMapping("/process")
public ResponseEntity<?> processPayment(...) { }

// 5. Hacer POST a RUMI después de procesar
rumiIntegrationService.confirmPaymentCompleted(...)
```

---

## 📞 CONTACTOS

**Tech Lead RUMI:** [nombre]  
**Email:** dev@rumi.com  
**Slack:** #banco-java  
**Reunión técnica:** Viernes 3pm

---

## 🎯 META FINAL

**Tu banco + RUMI = Plataforma monetizada con pagos**

✅ Estudiante paga  
✅ Docente recibe dinero  
✅ RUMI gana comisión  
✅ Todos ganan 🎉

---

**Cheat Sheet v1.0 - 14 de Enero 2026**
