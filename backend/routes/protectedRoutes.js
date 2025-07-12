const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Bienvenido al panel, usuario ID: ${req.user.id}` });
});

module.exports = router;
