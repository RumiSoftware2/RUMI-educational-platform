# 🚀 Guía Actualizada: Payouts Automáticos con API Wompi (Docs Oficiales)

**Documentación oficial:** https://docs.wompi.co/docs/colombia/introduccion-pagos-a-terceros/

## Cambios Realizados (Según Docs de Wompi)

### 1. Endpoint Correcto
- ❌ Antes: POST `/v1/transfers`
- ✅ Ahora: POST `/v1/payouts` (API de Pagos a Terceros)

### 2. Estructura de Payload
```javascript
// Nuevo payload según docs Wompi
POST /v1/payouts
{
  "accountId": "WOMPI_ACCOUNT_ID",  // Cuenta origen (obtener de /accounts)
  "transactions": [
    {
      "legalIdType": "CC",           // CC, NIT, CE
      "legalId": "1234567890",       // Cédula docente
      "bankId": "1507",              // ID Wompi (1507=Nequi, 1007=Bancolombia, etc)
      "accountType": "AHORROS",      // AHORROS o CORRIENTE
      "accountNumber": "3005123456",
      "name": "Nombre Docente",
      "email": "docente@example.com",
      "amount": 9000000,             // En centavos (90,000 COP)
      "reference": "payment_507f...",
      "paymentType": "OTHER"         // OTHER, PAYROLL, PROVIDERS
    }
  ]
}
```

### 3. Parámetros Requeridos (Ahora Validados)
- `legalIdType`: CC (cédula colombiana)
- `legalId`: número documento del docente ✓
- `bankId`: UUID del banco (mapeo en wompiService.js) ✓
- `accountType`: AHORROS o CORRIENTE ✓
- `accountNumber`: cuenta del docente ✓
- `name`: nombre completo del docente ✓ (nuevo)
- `email`: email del docente ✓ (nuevo)
- `amount`: en centavos (automático)
- `reference`: única por 24h
- `paymentType`: OTHER
- `accountId`: cuenta origen Wompi

### 4. Códigos de Banco (bankId)
Mapeado en `wompiService.js`:
```javascript
'nequi': '1507'
'bancolombia': '1007'
'bbva': '1013'
'davivienda': '1051'
'scotiabank': '1019'
'banco popular': '1002'
'citibank': '1009'
'banco de bogota': '1001'
'banco de occidente': '1023'
// ... más bancos
```

## Estados del Payout (Según Wompi)

### Estados de Transacción
| Estado | Descripción |
|--------|------------|
| PENDING | En proceso / pendiente de aplicar |
| APPROVED | ✓ Pagado exitosamente |
| CANCELLED | ✗ Cancelado (rechazado por aprobador) |
| FAILED | ✗ Rechazado (información incorrecta o restricciones) |

### Estados de Lote
| Estado | Descripción |
|--------|------------|
| PENDING | En proceso |
| PARTIAL_PAYMENT | Algunas transacciones finalizadas |
| TOTAL_PAYMENT | Todas las transacciones procesadas |
| REJECTED | Rechazado por incumplimiento |

## Configuración Wompi (Variables de Entorno)

```env
# backend/.env (Render)

# Autenticación
WOMPI_PRIVATE_KEY=pk_live_xxxxx     # o pk_test_ para sandbox
WOMPI_API_KEY=pk_live_xxxxx         # Puede ser igual a WOMPI_PRIVATE_KEY

# Cuenta Origen (obtener de POST /v1/accounts)
WOMPI_ACCOUNT_ID=acc_xxxxxxx        # Cuenta Wompi de la plataforma

# Comisiones (opcionales)
WOMPI_FEE_PERCENT=0.02              # 2%
PLATFORM_FEE_PERCENT=0.08           # 8%
WOMPI_FIXED_FEE=0                   # Sin comisión fija
```

## Pasos para Obtener WOMPI_ACCOUNT_ID

1. Login en dashboard Wompi
2. Ir a API → Llaves de Autenticación
3. Obtener `API Key` (usar como WOMPI_API_KEY)
4. Llamar endpoint GET `/v1/accounts` con el API Key
5. Copiar `id` de la cuenta principal
6. Guardar como `WOMPI_ACCOUNT_ID` en .env

```bash
# Obtener cuentas disponibles
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://sandbox.wompi.co/v1/accounts
# Respuesta:
# {
#   "data": [
#     {
#       "id": "acc_xxxx...",
#       "name": "Mi Cuenta Wompi",
#       ...
#     }
#   ]
# }
```

## Códigos de Rechazo Comunes

| Código | Causa | Solución |
|--------|-------|----------|
| D02 | Banco no existe | Verificar bankId válido |
| D07 | Número cuenta no existe | Validar cuenta destino |
| D11 | Cuenta NIT no corresponden | Verificar documento del beneficiario |
| D19 | Fondos insuficientes | Tu cuenta Wompi no tiene dinero |
| D21 | Falta nombre beneficiario | Asegurar que docente tiene name |
| D34 | Número de cuenta no numérico | Limpiar espacios/caracteres |
| D39 | Tipo identificación inválido | CC, NIT, CE solamente |

## Flujo Actualizado

```
1. Estudiante paga $100.000 COP
   ↓
2. Wompi procesa → webhook notifica backend
   ↓
3. Backend en handleWompiWebhook:
   a) Calcula: wompiFee=$2.000, platformFee=$8.000, teacherAmount=$90.000
   b) Guarda Payment en BD
   c) Valida docente tiene TODOS:
      - payoutInfo.bankName ✓
      - payoutInfo.accountNumber ✓
      - payoutInfo.documentId ✓
      - teacher.name ✓ (nuevo)
      - teacher.email ✓ (nuevo)
   d) Si válido → wompiService.createPayout()
      POST /v1/payouts con:
      {
        accountId: "acc_xxx",
        transactions: [{
          legalIdType: "CC",
          legalId: docente.documentId,
          bankId: getBankId(docente.banco),
          accountType: "AHORROS",
          accountNumber: docente.accountNumber,
          name: docente.name,        ← NUEVO
          email: docente.email,       ← NUEVO
          amount: 9000000,
          reference: "payment_...",
          paymentType: "OTHER"
        }]
      }
   e) Wompi responde con transactionId y status
   f) Guarda wompiTransferId y batchId en Payment
   ↓
4. Wompi procesa transferencia (ACH)
   ↓
5. 1-3 días: Dinero llega a cuenta destino
```

## Validaciones Wompi (Ahora Implementadas)

✓ Número de cuenta: 6-20 caracteres numéricos
✓ Tipo de identificación: CC, NIT, CE
✓ Banco válido: en lista de soportados
✓ Saldo disponible: en tu cuenta Wompi
✓ Límites: $1.500.000.000 diarios (ampliable)
✓ Idempotencia: reference única x 24h

## Montos y Centavos

```javascript
// Wompi maneja CENTAVOS
$100.000 COP = 10000000 (centavos)
$1.000 COP = 100000
$10 COP = 1000

// Automático en código:
amount_in_centavos = Math.round(amount * 100)
```

## Checklist Pre-Producción

- [ ] WOMPI_API_KEY configurada en Render
- [ ] WOMPI_ACCOUNT_ID obtenida y configurada
- [ ] Webhook URL registrada en Wompi: `https://tu-backend/api/payments/webhook`
- [ ] Docentes actualizados con `name` y `email` (si usaban versión anterior)
- [ ] Bancos soportados en dropdown TeacherPayoutSetup
- [ ] Prueba con sandbox primero
- [ ] Verificar límites de payout (3.800 lotes/día)
- [ ] Horarios procesamiento: consulta panel Wompi

## Horarios de Procesamiento

Ver en dashboard Wompi (varían por banco):
- Normalmente: 8 AM a 6 PM (hora Colombia)
- Fines de semana: según banco
- Feriados: puede haber retrasos

## Limite y Restricciones

- **Diario:** $1.500.000.000 COP máximo
- **Lotes:** 3.800 lotes por día (sin límite de transacciones por lote)
- **Idempotencia:** reference válida 24 horas
- **Beneficiarios:** Sin límite de cuentas destino

## Depuración

### Logs a revisar
```
✓ Payout created for teacher: tr_XXXXX / batchId: batch_XXXXX
✗ Payout failed: [error message]
✓ Payment completed but incomplete payoutInfo: [missing field]
```

### Verificar estado en Wompi
```bash
# Obtener detalles del lote
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://sandbox.wompi.co/v1/payouts/batch_XXXXX

# Obtener detalles de transacción
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://sandbox.wompi.co/v1/payouts/batch_XXXXX/transactions/tr_XXXXX
```

### En BD MongoDB
```javascript
db.payments.findOne({batchId: "batch_XXXXX"})
// Ver: wompiTransferId, payoutStatus, payoutError
```

## Próximos Pasos

1. **Obtener WOMPI_ACCOUNT_ID** (llamar /accounts endpoint)
2. **Configurar en Render** (agregar WOMPI_ACCOUNT_ID a .env)
3. **Hacer push a GitHub** (cambios en wompiService.js, paymentController.js, models)
4. **Redeploy en Render** (backend recompila)
5. **Prueba en sandbox:**
   - Docente configura banco + datos
   - Estudiante compra curso
   - Verificar payout en dashboard Wompi
   - Dinero debe mostrar en estado PENDING → APPROVED

6. **Producción:**
   - Cambiar a `pk_live_` key en Wompi
   - Actualizar .env en Render
   - Redeploy

---

**Integración completa con API oficial Wompi.** 🎯
