const TeacherProfile = require('../models/TeacherProfile');

exports.getOwnProfile = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Perfil no encontrado' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
};

exports.upsertOwnProfile = async (req, res) => {
  try {
    const { name, bio, skills, experience, social, slug, photo } = req.body;

    const cleanSlug = (slug || '').toLowerCase().replace(/[^a-z0-9-_]/g, '');

    const existingSlug = await TeacherProfile.findOne({ slug: cleanSlug, userId: { $ne: req.user.id } });
    if (existingSlug) {
      return res.status(400).json({ message: 'El enlace público (slug) ya está en uso' });
    }

    const profileData = {
      userId: req.user.id,
      name,
      bio,
      photo: photo || '',
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : []),
      experience: Array.isArray(experience) ? experience : [],
      social: social || {},
      slug: cleanSlug,
    };

    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Marca personal guardada exitosamente', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la marca personal', error: error.message });
  }
};

exports.getProfileBySlug = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ slug: req.params.slug });
    if (!profile) return res.status(404).json({ message: 'Portafolio no encontrado' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el portafolio público', error: error.message });
  }
};
