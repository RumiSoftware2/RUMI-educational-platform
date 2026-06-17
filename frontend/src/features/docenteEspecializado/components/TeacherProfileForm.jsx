import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import RumiSeal from './RumiSeal';

export default function TeacherProfileForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    slug: '',
    skills: [],
    experience: [],
    social: { linkedin: '', twitter: '', github: '', website: '' },
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/profile/me');
        if (mounted && res.data) setProfile(res.data);
      } catch (err) {
        // no profile yet
      }
    })();
    return () => (mounted = false);
  }, []);

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setProfile((p) => ({ ...p, skills: [...(p.skills || []), skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (idx) => setProfile((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...profile };
      const res = await api.put('/profile/me', payload);
      alert(res.data.message || 'Guardado');
      setProfile(res.data.profile || profile);
      if (onClose) onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-xl max-w-3xl mx-auto">
      <div className="relative">
        <RumiSeal className="absolute right-4 bottom-4 w-48 h-48 opacity-10 pointer-events-none" />
        <h3 className="text-2xl font-bold mb-2">Crear / Editar Marca Personal</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input className="w-full p-2 border rounded" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Enlace público (slug)</label>
              <input className="w-full p-2 border rounded" value={profile.slug || ''} onChange={(e) => setProfile({ ...profile, slug: e.target.value })} required />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Biografía</label>
            <textarea className="w-full p-2 border rounded" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Habilidades</label>
            <div className="flex gap-2 mt-2">
              <input className="p-2 border rounded flex-1" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Escribe y presiona Enter" />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-emerald-600 text-white rounded">Agregar</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.skills || []).map((s, i) => (
                <span key={i} className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full flex items-center gap-2">
                  {s} <button type="button" onClick={() => removeSkill(i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
