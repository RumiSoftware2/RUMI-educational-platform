const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const user = req.user; // Este objeto viene del middleware de autenticación

    if (!user || !rolesPermitidos.includes(user.role)) {
      return res.status(403).json({ message: 'Acceso denegado: permiso insuficiente' });
    }

    next(); // El usuario tiene el rol permitido, continúa con la ruta
  };
};

module.exports = checkRole;
