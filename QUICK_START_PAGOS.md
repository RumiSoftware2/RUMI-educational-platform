# 🚀 Quick Start - Módulo de Pagos RUMI

Guía rápida para poner en funcionamiento el módulo de pagos en 5 minutos.

---

## ⚡ 5 Pasos Rápidos

### 1. Configurar Variables de Entorno

**Archivo:** `backend/.env`

```env
# Agregar estas líneas (o actualizar si existen):
BANK_API_URL=http://localhost:8080/api
BANK_API_KEY=test-api-key-123456
MONGODB_URI=mongodb://localhost:27017/rumi
```

### 2. Reiniciar Backend

```bash
cd backend
npm install  # Si es la primera vez
npm start    # Debe mostrar ✓ Servidor corriendo en http://localhost:3000
```

### 3. Reiniciar Frontend (si es necesario)

```bash
cd frontend
npm run dev  # Debe estar en http://localhost:5173
```

### 4. Probar Rápidamente

**Opción A: En navegador (manual)**

```
1. Abre http://localhost:5173
2. Login como docente
3. Ir a "Crear Curso"
4. Marca: ✓ ¿Es un curso de pago?
5. Ingresa precio: 49.99
6. Crea el curso
7. Login como estudiante
8. Accede al curso
9. Click "Pagar y Desbloquear"
```

**Opción B: Con cURL (automático)**

```bash
# 1. Crear curso (reemplaza {TEACHER_TOKEN})
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer {TEACHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "Test",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "isPaid": true,
    "price": 10,
    "currency": "USD"
  }'

# Guarda el courseId de la respuesta

# 2. Crear pago (reemplaza {STUDENT_TOKEN} y {COURSE_ID})
curl -X POST http://localhost:3000/api/payments/courses/{COURSE_ID}/pay \
  -H "Authorization: Bearer {STUDENT_TOKEN}" \
  -H "Content-Type: application/json"

# Guarda el paymentId de la respuesta

# 3. Confirmar pago (reemplaza {PAYMENT_ID})
curl -X POST http://localhost:3000/api/payments/{PAYMENT_ID}/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "bankTransactionId": "BANK-TEST-001",
    "status": "completed"
  }'

# 4. Verificar acceso
curl -X GET http://localhost:3000/api/payments/courses/{COURSE_ID}/has-paid \
  -H "Authorization: Bearer {STUDENT_TOKEN}"

# Debe responder: { "hasPaid": true, "isPaidCourse": true }
```

### 5. Ver Que Funciona

- ✅ Curso se creó con `isPaid: true`
- ✅ Estudiante ve PaymentButton
- ✅ Pago se registró en BD
- ✅ Después de confirmar, `hasPaid: true`
- ✅ Estudiante ahora ve lecciones

---

## 🔧 Requisitos Mínimos

```
✓ Node.js 14+
✓ MongoDB (local o Atlas)
✓ npm
✓ RUMI backend corriendo
✓ RUMI frontend corriendo
```

---

## 📱 Estructura Visual

```
├── Backend
│   ├── models/
│   │   ├── Payment.js        ✓ NUEVO
│   │   ├── BankAccount.js    ✓ NUEVO
│   │   └── Course.js         ✓ MODIFICADO
│   │
│   ├── controllers/
│   │   ├── paymentController.js      ✓ NUEVO
│   │   └── bankAccountController.js  ✓ NUEVO
│   │
│   ├── routes/
│   │   ├── paymentRoutes.js      ✓ NUEVO
│   │   └── bankAccountRoutes.js  ✓ NUEVO
│   │
│   └── index.js ✓ MODIFICADO
│
└── Frontend
    ├── components/
    │   ├── BankAccountForm.jsx ✓ NUEVO
    │   └── PaymentButton.jsx   ✓ NUEVO
    │
    └── pages/
        ├── CourseForm.jsx              ✓ MODIFICADO
        ├── Profile.jsx                 ✓ MODIFICADO
        └── StudentCourseDetail.jsx     ✓ MODIFICADO
```

---

## 🎯 Principales Endpoints

### Crear Pago
```
POST /api/payments/courses/{courseId}/pay
Headers: Authorization: Bearer {token}
Response: { paymentId, bankPaymentUrl }
```

### Confirmar Pago (Webhook)
```
POST /api/payments/{paymentId}/confirm
Body: { bankTransactionId, status }
Response: { payment con status: "completed" }
```

### Registrar Banco
```
POST /api/bank-accounts
Headers: Authorization: Bearer {token}
Body: { accountHolder, accountNumber, ... }
Response: { bankAccount creado }
```

### Ver Ingresos
```
GET /api/payments/teacher/earnings
Headers: Authorization: Bearer {token}
Response: { totalEarnings, totalTransactions, payments }
```

---

## 🧪 Quick Test Checklist

- [ ] Backend inicia sin errores
- [ ] Frontend carga sin errores
- [ ] Puedes crear curso de pago
- [ ] El precio se ve en la lista de cursos
- [ ] Estudiante ve PaymentButton
- [ ] Pago se registra en BD
- [ ] Webhook confirma pago
- [ ] Estudiante ve lecciones después de pagar

---

## 🐛 Troubleshooting Rápido

**Problem:** "Bank API URL not found"
```
✓ Verifica que BANK_API_URL esté en .env
✓ Reinicia: npm start
```

**Problem:** "Cannot POST /api/payments"
```
✓ Verifica que paymentRoutes esté en index.js
✓ Verifica que app.use('/api/payments', ...) existe
✓ Reinicia backend
```

**Problem:** "Invalid Authorization"
```
✓ Usa un JWT token válido
✓ Verifica que el token no expiró
✓ Obtén nuevo token: Login
```

**Problem:** "Course not found in payment"
```
✓ Verifica que courseId existe
✓ Verifica que courseId esté en la URL
✓ Crea un nuevo curso de prueba
```

---

## 📚 Documentación Completa

Para detalles completos, lee:

1. **RESUMEN_EJECUTIVO_PAGOS.md** - Visión general
2. **MODULO_PAGOS_DOCUMENTACION.md** - Documentación técnica
3. **INTEGRACION_BANCO_JAVA.md** - Integración banco Java
4. **CHECKLIST_TESTING_PAGOS.md** - Tests completos
5. **RESUMEN_VISUAL_PAGOS.md** - Diagramas

---

## 🚀 Siguiente Paso

Una vez que veas funcionar:

1. **Integrar Banco Java**
   - Lee: `INTEGRACION_BANCO_JAVA.md`
   - Implementa webhook en Java
   - Testa confirmación de pagos

2. **Completar Checklist de Testing**
   - Lee: `CHECKLIST_TESTING_PAGOS.md`
   - Ejecuta todos los tests
   - Valida cada endpoint

3. **Preparar para Producción**
   - Configura HTTPS
   - Usa BD de producción
   - Sécuras las API keys

---

## ✅ ¡Listo!

Si todos los checks verdes = **Sistema de Pagos Funcional** 🎉

Para ayuda: Consulta los archivos `.md` en la raíz del proyecto.

---

**Quick Start completado en ~5 minutos** ⚡

Si no funciona en 5 minutos, revisa el troubleshooting arriba o consulta la documentación completa.
