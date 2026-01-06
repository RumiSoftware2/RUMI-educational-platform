const User = require('../models/User');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluye el campo password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Obtener un solo usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

// Obtener usuario actual (por token JWT)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario actual' });
  }
};

// Actualizar rol del usuario
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar rol
    if (!['estudiante', 'docente'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Rol actualizado exitosamente',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getCurrentUser
};
