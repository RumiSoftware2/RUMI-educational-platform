const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Todas las rutas están protegidas con JWT
// IMPORTANTE: /me debe ir ANTES que /:id para que Express no lo interprete como parámetro
router.get('/me', verifyToken, userController.getCurrentUser);
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.put('/:id/role', verifyToken, userController.updateUserRole);

module.exports = router;
