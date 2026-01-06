# 🔧 FIX - Error de módulo axios

## Problema
```
Error: Cannot find module 'axios'
```

## Solución

### En tu máquina local:
```bash
cd backend
npm install
```

### Para Render (o tu servicio de deploy):

**El problema estaba:**
- `axios` no estaba en `package.json`

**Lo que arreglé:**
- ✅ Agregué `"axios": "^1.6.2"` a las dependencias
- ✅ Removí la importación innecesaria de `axios` en paymentController.js

### Ahora:

1. **Haz push a tu repo:**
   ```bash
   git add .
   git commit -m "Fix: Add axios dependency"
   git push
   ```

2. **Render redeployará automáticamente** y debería funcionar

### Si aún no funciona:

En Render, ve a:
- Settings → Clear Build Cache
- Luego haz redeploy

---

## Cambios realizados:

✅ `backend/package.json` - Agregado `axios`
✅ `backend/controllers/paymentController.js` - Removida importación innecesaria

---

**¡El deploy debería funcionar ahora!** 🚀
