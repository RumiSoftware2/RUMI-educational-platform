import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import RumiSeal from '../components/RumiSeal';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/profile/public/${slug}`);
        if (mounted) setProfile(res.data);
      } catch (err) {
        setProfile(null);
      }
    })();
    return () => (mounted = false);
  }, [slug]);

  if (!profile) return <div className="p-8">Portafolio no encontrado.</div>;

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl p-8 relative overflow-hidden">
        <RumiSeal className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-8 pointer-events-none" />
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">{profile.name}</h1>
            <p className="mt-2 text-lg text-gray-700 max-w-2xl">{profile.bio}</p>
          </div>
          <div className="flex gap-3">
            {profile.social?.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {profile.social?.twitter && <a href={profile.social.twitter} target="_blank" rel="noreferrer">X</a>}
            {profile.social?.github && <a href={profile.social.github} target="_blank" rel="noreferrer">GitHub</a>}
          </div>
        </header>

        <section className="mt-6">
          <h3 className="text-xl font-bold mb-2">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.skills || []).map((s, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-900">{s}</span>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-xl font-bold mb-2">Experiencia</h3>
          <div className="space-y-4">
            {(profile.experience || []).map((e, i) => (
              <div key={i} className="p-4 border rounded">
                <div className="flex justify-between">
                  <strong>{e.title}</strong>
                  <span className="text-sm text-gray-600">{e.startYear} - {e.endYear || 'Presente'}</span>
                </div>
                <div className="text-sm text-gray-700">{e.organization}</div>
                <p className="mt-2 text-gray-700">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
