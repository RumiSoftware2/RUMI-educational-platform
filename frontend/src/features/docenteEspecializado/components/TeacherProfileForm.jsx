import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import RumiSeal from './RumiSeal';

function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}

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
  const [expInput, setExpInput] = useState({ title: '', organization: '', startYear: '', endYear: '', description: '' });

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

  const addExperience = () => {
    if (!expInput.title || !expInput.organization || !expInput.startYear) return;
    setProfile((p) => ({ ...p, experience: [...(p.experience || []), { ...expInput }] }));
    setExpInput({ title: '', organization: '', startYear: '', endYear: '', description: '' });
  };

  const removeExperience = (idx) => setProfile((p) => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...profile };
      if (!payload.slug || payload.slug.trim() === '') {
        payload.slug = generateSlug(payload.name || 'perfil');
      }

      const res = await api.put('/profile/me', payload);
      alert(res.data.message || 'Guardado');
      const newProfile = res.data.profile || payload;
      setProfile(newProfile);

      // Open public portfolio in new tab
      if (newProfile.slug) {
        const url = `${window.location.origin}/p/${newProfile.slug}`;
        window.open(url, '_blank');
      }

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
              <label className="block text-sm font-medium">Enlace público (slug) opcional</label>
              <input className="w-full p-2 border rounded" value={profile.slug || ''} onChange={(e) => setProfile({ ...profile, slug: e.target.value })} placeholder="Si lo dejas vacío se generará automáticamente" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Biografía</label>
            <textarea className="w-full p-2 border rounded" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">Redes sociales</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <input className="p-2 border rounded" placeholder="LinkedIn" value={profile.social?.linkedin || ''} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, linkedin: e.target.value } })} />
              <input className="p-2 border rounded" placeholder="Twitter / X" value={profile.social?.twitter || ''} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, twitter: e.target.value } })} />
              <input className="p-2 border rounded" placeholder="GitHub" value={profile.social?.github || ''} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, github: e.target.value } })} />
              <input className="p-2 border rounded" placeholder="Sitio Web" value={profile.social?.website || ''} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, website: e.target.value } })} />
            </div>
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

          <div className="mt-4">
            <label className="block text-sm font-medium">Experiencia</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <input className="p-2 border rounded" placeholder="Cargo" value={expInput.title} onChange={(e) => setExpInput({ ...expInput, title: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Institución" value={expInput.organization} onChange={(e) => setExpInput({ ...expInput, organization: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Año inicio" value={expInput.startYear} onChange={(e) => setExpInput({ ...expInput, startYear: e.target.value })} />
              <input className="p-2 border rounded" placeholder="Año fin (opcional)" value={expInput.endYear} onChange={(e) => setExpInput({ ...expInput, endYear: e.target.value })} />
              <textarea className="p-2 border rounded md:col-span-2" placeholder="Descripción" value={expInput.description} onChange={(e) => setExpInput({ ...expInput, description: e.target.value })} />
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={addExperience} className="px-4 py-2 bg-emerald-600 text-white rounded">Agregar Experiencia</button>
            </div>
            <div className="mt-2 space-y-2">
              {(profile.experience || []).map((ex, i) => (
                <div key={i} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{ex.title} — <span className="text-sm text-gray-600">{ex.organization}</span></div>
                    <div className="text-sm text-gray-600">{ex.startYear} - {ex.endYear || 'Presente'}</div>
                    <p className="mt-1 text-sm">{ex.description}</p>
                  </div>
                  <div>
                    <button type="button" onClick={() => removeExperience(i)} className="text-red-500">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {profile.slug && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded">
              <strong>Tu portafolio público está activo en:</strong>
              <div>
                <a href={`/p/${profile.slug}`} target="_blank" rel="noreferrer" className="text-emerald-700 underline">Visitar Portafolio ↗</a>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded">{loading ? 'Guardando...' : 'Guardar y publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
