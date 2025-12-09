# 🚀 Guía: Payouts Automáticos con Wompi

**Estado:** Implementado los payouts automáticos que transfieren el 90% del dinero directamente a la cuenta bancaria del docente.

## ¿Qué cambió?

### 1. `backend/services/wompiService.js`
- **Nueva función:** `createPayout(amount, currency, payoutInfo, reference)`
  - Llama a `POST /v1/transfers` en Wompi
  - Parámetros: monto, cuenta bancaria del docente, tipo de cuenta, documento
  - Retorna: `wompiTransferId` y estado del payout
  - Modo sandbox: retorna transferencia simulada

- **Nueva función:** `verifyPayout(wompiTransferId)`
  - Verifica el estado de una transferencia con Wompi

### 2. `backend/controllers/paymentController.js`
- **Función `confirmPayment`:** ahora ejecuta payout automático después de confirmar el pago
- **Función `handleWompiWebhook`:** ahora ejecuta payout automático cuando Wompi notifica el pago aprobado

Ambas funciones:
1. Verifican que el docente tiene `payoutInfo` válida (bankName, accountNumber, documentId)
2. Llaman a `wompiService.createPayout()` con el `teacherAmount` (90%)
3. Guardan `wompiTransferId` y `payoutStatus` en el documento `Payment`
4. Registran éxito/error en logs

### 3. `backend/models/Payment.js`
- Nuevos campos:
  - `payoutStatus`: PENDING | COMPLETED | FAILED | NO_PAYOUT_INFO
  - `payoutError`: mensaje de error si el payout falla

### 4. `backend/models/User.js`
- Nuevos campos para docentes:
  - `totalEarnings`: suma total de ganancias
  - `monthlyEarnings`: ganancias del mes (opcional, requiere reset mensual)
  - `payoutInfo`: datos bancarios del docente
  - `teacherPayoutStatus`: estado de verificación (not_configured → pending → active)

## Flujo Completo de Pago + Payout

```
1. Estudiante hace clic en "Comprar Curso"
   ↓
2. Frontend llama: POST /api/payments/create-transaction
   ↓
3. Backend crea transacción en Wompi, retorna checkoutUrl
   ↓
4. Frontend redirige a Wompi checkout
   ↓
5. Estudiante completa el pago en Wompi
   ↓
6. Wompi procesa la transacción y envía webhook: POST /api/payments/webhook
   ↓
7. Backend en handleWompiWebhook:
   a) Verifica transacción en Wompi
   b) Calcula: wompiFee (2%), platformFee (8%), teacherAmount (90%)
   c) Marca Payment como 'completed'
   d) Añade estudiante al curso
   e) Aumenta teacher.totalEarnings
   f) SI docente tiene payoutInfo válida:
      - Llama createPayout(teacherAmount, payoutInfo)
      - Wompi crea transferencia a cuenta del docente
      - Guarda wompiTransferId en Payment
      - Marca payoutStatus = 'PENDING' (en tránsito)
   g) SI no hay payoutInfo:
      - Marca payoutStatus = 'NO_PAYOUT_INFO'
      - El dinero queda en totalEarnings (docente puede pedir payout manual después)
   ↓
8. Frontend recibe confirmación, muestra "Pago exitoso"
   ↓
9. Docente recibe dinero en su Nequi/cuenta en 1-3 días bancarios
```

## Configuración Necesaria en Wompi

### 1. Variables de Entorno (Backend - Render)
```
WOMPI_PRIVATE_KEY=pk_live_xxxxxxxxxxxxx   # o pk_test_ para sandbox
WOMPI_FEE_PERCENT=0.02                    # 2% (defecto)
PLATFORM_FEE_PERCENT=0.08                 # 8% (defecto)
WOMPI_FIXED_FEE=0                         # Sin comisión fija
```

### 2. Webhook en Wompi Dashboard
- **URL:** `https://<tu-backend>/api/payments/webhook`
- **Eventos:** transaction.APPROVED, transaction.COMPLETED, transaction.PAID
- **Sin autenticación requerida** (actualmente - considera añadir validación de firma para producción)

### 3. Permisos de Transferencias
- Tu cuenta Wompi debe tener permisos de "transfers" o "payouts" habilitados
- Algunos niveles de cuenta requieren KYC completo (que mencionas ya fue aprobado)
- Verifica en el panel de Wompi que el endpoint de transferencias está disponible

## Prueba Paso a Paso

### Precondiciones
1. Backend desplegado en Render con `WOMPI_PRIVATE_KEY`
2. Webhook configurado en Wompi dashboard
3. Docente ha registrado su cuenta bancaria (TeacherPayoutSetup):
   - Banco: Nequi (o el que uses)
   - Número de cuenta: tu número Nequi
   - Tipo: nequi
   - Cédula: tu documento

### Pasos de Prueba

**1. Verificar payoutInfo del docente**
```bash
# Obtén el token del docente (login)
curl -X POST https://tu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"docente@example.com","password":"pass"}'
# Guarda el token

# Consulta su info de payout
curl -H "Authorization: Bearer <TOKEN_DOCENTE>" \
  https://tu-backend.onrender.com/api/payments/teacher/balance
# Respuesta esperada:
# {
#   "totalEarnings": 0,
#   "monthlyEarnings": 0,
#   "payoutStatus": "active"
# }
```

**2. Crear un curso de pago**
- Ir a "Crear Curso" como docente
- Marcar "Curso de Pago" y establecer precio (ej: 100.000 COP)
- Guardar

**3. Comprar el curso como estudiante**
- Login como estudiante
- Buscar el curso
- Hacer clic en "Comprar"
- Completar el pago en Wompi (sandbox o real)

**4. Verificar Payment en BD**
```javascript
// En MongoDB Compass o mongo shell:
db.payments.findOne({status: 'completed'})
// Busca un documento con:
// {
//   "_id": ObjectId(...),
//   "student": ObjectId(...),
//   "course": ObjectId(...),
//   "amount": 100000,
//   "wompiFee": 2000,        // 2%
//   "platformFee": 8000,     // 8%
//   "teacherAmount": 90000,  // 90%
//   "status": "completed",
//   "payoutStatus": "PENDING",  // O "COMPLETED" si Wompi confirmó
//   "wompiTransferId": "tr_XXXX...",
//   "paymentDate": ISODate(...)
// }
```

**5. Verificar balance del docente**
```bash
curl -H "Authorization: Bearer <TOKEN_DOCENTE>" \
  https://tu-backend.onrender.com/api/payments/teacher/balance
# Respuesta esperada:
# {
#   "totalEarnings": 90000,    # +90% del monto
#   "monthlyEarnings": 90000,
#   "payoutStatus": "active"
# }
```

**6. Verificar estado del payout en Wompi**
- Ir a panel Wompi → Transferencias/Payouts
- Buscar el ID: `wompiTransferId` del Payment
- Ver estado: PENDING, COMPLETED, FAILED

**7. Verificar depósito en Nequi**
- Abrir app Nequi
- Ver historial de transacciones
- El dinero debería llegar en 1-3 días bancarios (depende de Wompi)

## Manejo de Errores

### Caso 1: Payout falla (sin payoutInfo)
```javascript
// Payment guarda:
{
  "status": "completed",           // El pago sí se confirmó
  "payoutStatus": "NO_PAYOUT_INFO", // Pero no se hizo el payout
  "teacherAmount": 90000            // El dinero queda en totalEarnings
}
```
**Acción:** El docente debe configurar su payoutInfo y luego un admin puede ejecutar un payout manual desde Wompi dashboard.

### Caso 2: Wompi rechaza el payout
```javascript
{
  "status": "completed",
  "payoutStatus": "FAILED",
  "payoutError": "Account not verified",
  "teacherAmount": 90000
}
```
**Acción:** Revisar en Wompi por qué rechazó. Posibles razones:
- Cuenta no verificada
- Documento no válido
- Banco no soportado
- Límites de transferencia excedidos

### Caso 3: Webhook no llega
Si Wompi no notifica en 5 minutos:
```bash
# Forzar confirmación manualmente:
curl -X POST https://tu-backend.onrender.com/api/payments/confirm \
  -H "Authorization: Bearer <TOKEN_ESTUDIANTE>" \
  -H "Content-Type: application/json" \
  -d '{"wompiTransactionId":"<WOMPI_TX_ID>"}'
```
El endpoint `confirmPayment` hará lo mismo: crear payout automático.

## Logs Útiles

En el backend (Render console), busca logs como:
```
✓ Payout created for teacher 5f1a...: tr_XXXX
✗ Payout failed for teacher 5f1a...: Account verification required
✓ Payment completed but teacher 5f1a... has no payoutInfo configured
✓ Webhook payout created for teacher 5f1a...: tr_YYYY
```

## Consideraciones Finales

### Seguridad
1. **WOMPI_PRIVATE_KEY nunca en GitHub** - solo en Render .env ✓
2. **Webhook sin validación de firma** - para producción, añadir HMAC validation
3. **Transferencias automáticas** - el docente no tiene que hacer nada, es automático
4. **Auditoría** - cada Payment guarda qué docente recibió dinero, cuándo, y si el payout se hizo

### Límites y Consideraciones de Wompi
- Limit diarios de transferencias (varía por cuenta)
- KYC completo requerido (✓ ya aprobado)
- Tiempo de acreditación: 1-3 días hábiles
- Comisiones: 2% (configurable en env vars)

### Próximos Pasos Opcionales
1. **Batch payouts**: Ejecutar transferencias en batch una vez al día en vez de inmediato
2. **Confirmación manual**: Panel para admin aprobar payouts antes de ejecutar
3. **Retiros**: Permitir que docentes soliciten retiros anticipados (PENDING estado)
4. **Reporte**: Dashboard con historial de payouts y ganancias mensuales

## FAQ

**P: ¿Qué pasa si el docente no configura su payoutInfo?**
R: El pago se confirma (el estudiante accede al curso), pero el dinero queda en `totalEarnings` como saldo pendiente. El docente debe configurar su banco para que se haga el payout.

**P: ¿Cuánto tarda en llegar el dinero al Nequi?**
R: Wompi normalmente tarda 1-3 días bancarios. En sandbox es inmediato o simulado.

**P: ¿Se puede hacer payout a otros bancos, no solo Nequi?**
R: Sí. El campo `bankName` acepta cualquier banco. Solo asegúrate que Wompi lo soporta.

**P: ¿Qué pasa si hay error en el payout?**
R: Se registra en `payoutError` y en los logs. El dinero sigue en `totalEarnings`. Se puede intentar de nuevo.

**P: ¿Hay límite de dinero por transacción?**
R: Depende de Wompi y de tu cuenta. Revisa los límites en el panel.

## Endpoint de Validación (Opcional)

Si quieres crear un endpoint para que admins revisen/reintenten payouts fallidos:

```javascript
// POST /api/payments/retry-payout/:paymentId
async function retryPayout(req, res) {
  const { paymentId } = req.params;
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.payoutStatus !== 'FAILED') {
    return res.status(400).json({message: 'Payment not eligible for retry'});
  }
  const teacher = await User.findById(payment.course.teacher); // populate first
  try {
    const result = await wompiService.createPayout({
      amount: payment.teacherAmount,
      currency: payment.currency,
      payoutInfo: teacher.payoutInfo,
      reference: `retry_${payment._id}`
    });
    payment.wompiTransferId = result.wompiTransferId;
    payment.payoutStatus = 'PENDING';
    await payment.save();
    return res.json({success: true, wompiTransferId: result.wompiTransferId});
  } catch(err) {
    return res.status(500).json({message: 'Retry failed', error: err.message});
  }
}
```

---

**Código desplegado en Render.** Listos para la prueba real. 🚀
