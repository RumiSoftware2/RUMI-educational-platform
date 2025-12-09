# 📊 Resumen Visual: Payouts Automáticos Implementados

## ANTES vs DESPUÉS

### ❌ ANTES (Sin Payouts Automáticos)
```
Estudiante paga $100.000
         ↓
Wompi procesa pago
         ↓
Backend confirma Payment:
  - wompiFee: $2.000 (2%)
  - platformFee: $8.000 (8%)
  - teacherAmount: $90.000 (90%)
         ↓
Docente ve totalEarnings: +$90.000
         ↓
❌ Dinero queda en saldo interno de la plataforma
❌ Tú tienes que transferir manualmente al Nequi del docente
❌ Requiere revisar datos bancarios + hacer payout manual desde Wompi
```

### ✅ DESPUÉS (Con Payouts Automáticos)
```
Estudiante paga $100.000
         ↓
Wompi procesa pago
         ↓
Backend confirma Payment:
  - wompiFee: $2.000 (2%)
  - platformFee: $8.000 (8%)
  - teacherAmount: $90.000 (90%)
         ↓
Backend ejecuta automáticamente:
  wompiService.createPayout({
    amount: $90.000,
    payoutInfo: docente.payoutInfo,
    reference: payment_id
  })
         ↓
Wompi crea transferencia
         ↓
Payment guarda:
  - wompiTransferId: "tr_XXXXX"
  - payoutStatus: "PENDING"
         ↓
✅ Dinero sale automáticamente de tu cuenta Wompi
✅ Va directo al Nequi/Banco del docente
✅ En 1-3 días bancarios se acredita
✅ Cero intervención manual (solo si hay error)
```

## Cambios en el Código

### 1️⃣ wompiService.js
**Función nueva:** `createPayout()`
```javascript
await wompiService.createPayout({
  amount: 90000,              // 90% del pago
  currency: 'COP',
  payoutInfo: {               // Datos que el docente registró
    bankName: 'Nequi',
    accountNumber: '3005XXXXX',
    accountType: 'nequi',
    documentId: '1234567890'
  },
  reference: 'payment_507f1f77bcf86cd799439011'
})
// Retorna: {
//   wompiTransferId: 'tr_XXXX...',
//   status: 'PENDING'
// }
```

### 2️⃣ paymentController.js
**En `confirmPayment()` y `handleWompiWebhook()`:**
```javascript
// Después de marcar Payment como completed:

if (teacher.payoutInfo && teacher.payoutInfo.accountNumber) {
  try {
    const payoutResult = await wompiService.createPayout({
      amount: teacherAmount,     // $90.000
      currency: payment.currency,
      payoutInfo: teacher.payoutInfo,
      reference: `payment_${payment._id}`
    });
    
    // Guardar resultado
    payment.wompiTransferId = payoutResult.wompiTransferId;
    payment.payoutStatus = payoutResult.status;
    
    console.log(`✓ Payout created: ${payoutResult.wompiTransferId}`);
  } catch (err) {
    payment.payoutStatus = 'FAILED';
    payment.payoutError = err.message;
    console.error(`✗ Payout failed: ${err.message}`);
  }
  await teacher.save();
}
```

### 3️⃣ Payment.js Schema
**Nuevos campos:**
```javascript
payoutStatus: {
  type: String,
  enum: ['PENDING','COMPLETED','FAILED','NO_PAYOUT_INFO'],
  default: null
},
payoutError: {
  type: String,
  default: null
}
```

### 4️⃣ User.js Schema
**Nuevos campos para docentes:**
```javascript
totalEarnings: { type: Number, default: 0 },
monthlyEarnings: { type: Number, default: 0 },
payoutInfo: {
  bankName: { type: String },
  accountNumber: { type: String },
  accountType: { type: String },
  documentId: { type: String },
  status: { type: String, enum: ['not_configured','pending','active'] }
},
teacherPayoutStatus: { 
  type: String, 
  enum: ['not_configured','pending','active'],
  default: 'not_configured'
}
```

## Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│          FLOW COMPLETO: PAGO + PAYOUT AUTOMÁTICO            │
└─────────────────────────────────────────────────────────────┘

                     PLATAFORMA RUMI
                    ┌───────────────┐
                    │   Frontend    │
                    └────────┬──────┘
                             │
                    Estudiante hace clic
                    "Comprar Curso"
                             │
                    ┌────────┴──────────────┐
                    ↓                       ↓
            Backend API              Wompi Checkout
            POST /payments/           Usuario ingresa
            create-transaction        datos tarjeta
            
            ↓ (retorna checkoutUrl)
            
            Frontend redirige ←────────────┐
            a Wompi                        │
                                    Usuario completa
                                    el pago
                                    
                                    Wompi procesa
                                    transacción
                                         │
                                    APROBADA
                                         │
                    ┌────────────────────┘
                    ↓
            Backend recibe webhook:
            POST /api/payments/webhook
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    Calcula    Guarda en   Actualiza
    comisiones  Payment     curso
    
    2% Wompi           status: completed
    8% Plat            wompiFee: $2.000
    90% Doc            platformFee: $8.000
                       teacherAmount: $90.000
                    │
        ┌───────────┴─────────────────┐
        ↓                             ↓
    Docente tiene          Docente SIN
    payoutInfo?            payoutInfo?
        │                       │
        ↓ SÍ                    ↓ NO
    
    createPayout()          Marca como
    (automático)            NO_PAYOUT_INFO
    
    POST /v1/transfers      Dinero en
    a Wompi                 totalEarnings
    
    Wompi crea
    transferencia
    
    wompiTransferId: tr_XXXX
    payoutStatus: PENDING
    
        │
    1-3 días
    bancarios
        │
        ↓
    💳 Dinero llega
       al Nequi/Banco
       del docente
```

## Tabla Comparativa

| Característica | Antes | Después |
|---|---|---|
| **Transferencia al docente** | Manual desde Wompi dashboard | Automática en confirmación |
| **Tiempo** | Inmediato (pero manual) | Inmediato (automático) |
| **Intervención requerida** | Sí (revisar datos + transferir) | No (excepto errores) |
| **Documentación en BD** | Solo totalEarnings | totalEarnings + wompiTransferId + payoutStatus |
| **Manejo de errores** | N/A | Registra en payoutError y logs |
| **Sin datos bancarios docente** | N/A | Dinero queda en saldo interno |
| **Auditoría** | Limitada | Completa (qué payout, cuándo, estado) |

## Estados del Payout

```
Payment.payoutStatus puede ser:

PENDING
├─ Transferencia en proceso en Wompi
├─ Dinero en tránsito al banco docente
└─ Tardar 1-3 días bancarios

COMPLETED
├─ Transferencia confirmada por Wompi
├─ Dinero acreditado en cuenta docente
└─ Verifica en Wompi dashboard o Nequi

FAILED
├─ Wompi rechazó la transferencia
├─ Posibles causas:
│  ├─ Cuenta no verificada
│  ├─ Documento inválido
│  ├─ Banco no soportado
│  └─ Límites excedidos
├─ Solución: Revisar datos docente + reintentar
└─ Dinero en totalEarnings (manual después)

NO_PAYOUT_INFO
├─ Docente no configuró su cuenta bancaria
├─ TeacherPayoutSetup vacío
├─ Dinero queda acreditado en totalEarnings
└─ Docente debe configurar banco para payout
```

## Checklist de Validación

- [x] wompiService.js tiene createPayout() y verifyPayout()
- [x] paymentController.js ejecuta payout en confirmPayment()
- [x] paymentController.js ejecuta payout en handleWompiWebhook()
- [x] Payment schema tiene payoutStatus y payoutError
- [x] User schema tiene payoutInfo y teacherPayoutStatus
- [x] Validación: no transfer si falta datos bancarios
- [x] Logs: éxito y errores registrados
- [x] Fallback: si Wompi falla, dinero no se pierde (en totalEarnings)

## Pasos para Probar

1. **Setup:**
   - Asegúrate que WOMPI_PRIVATE_KEY está en Render
   - Webhook registrada en Wompi dashboard

2. **Crear curso de pago:**
   - isPaidCourse = true
   - price = 100.000 COP (ej)

3. **Docente configura banco:**
   - Abre TeacherPayoutSetup
   - Bank: Nequi (o tu banco)
   - Account: tu número Nequi
   - Document: tu cédula
   - Guardar (status: pending o active)

4. **Estudiante compra:**
   - Click "Comprar Curso"
   - Completa pago en Wompi

5. **Verificar resultados:**
   - DB: Payment tiene wompiTransferId y payoutStatus
   - Logs: ✓ Payout created o ✗ Payout failed
   - Wompi: buscar transfer ID en panel
   - Nequi: dinero debería llegar en 1-3 días

## Configuración Wompi Necesaria

```env
# En Render .env backend:
WOMPI_PRIVATE_KEY=pk_live_xxxxxxxxxxxxx    # o pk_test_
WOMPI_FEE_PERCENT=0.02                     # 2%
PLATFORM_FEE_PERCENT=0.08                  # 8%
WOMPI_FIXED_FEE=0

# En Wompi Dashboard:
- Webhook URL: https://tu-backend/api/payments/webhook
- Eventos: transaction.APPROVED, PAID, COMPLETED
- Permisos: transfers/payouts habilitados
- KYC: completado ✓
```

---

**Resultado:** El dinero ahora fluye automáticamente de tus estudiantes → tu cuenta Wompi → directamente a los Nequi de tus docentes. 🎯
