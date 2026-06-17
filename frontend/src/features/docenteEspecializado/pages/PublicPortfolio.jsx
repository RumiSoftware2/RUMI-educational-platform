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
      <div className="max-w-5xl mx-auto relative">
        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-xl">
          <RumiSeal className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] opacity-5 pointer-events-none" />
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-5xl font-extrabold text-emerald-900">{profile.name}</h1>
                <p className="mt-3 text-lg text-gray-700 max-w-2xl">{profile.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(profile.skills || []).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-900 transform transition-transform hover:scale-105">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                {profile.social?.linkedin && (
                  <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="text-emerald-700 underline">LinkedIn</a>
                )}
                {profile.social?.twitter && <a href={profile.social.twitter} target="_blank" rel="noreferrer" className="text-emerald-700 underline">X</a>}
                {profile.social?.github && <a href={profile.social.github} target="_blank" rel="noreferrer" className="text-emerald-700 underline">GitHub</a>}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <section>
                  <h3 className="text-2xl font-bold mb-4">Experiencia</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-emerald-200" />
                    <div className="space-y-8">
                      {(profile.experience || []).map((e, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-3 top-2 w-3 h-3 bg-emerald-500 rounded-full" />
                          <div className="ml-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{e.title}</h4>
                              <span className="text-sm text-gray-600">{e.startYear} - {e.endYear || 'Presente'}</span>
                            </div>
                            <div className="text-sm text-gray-700">{e.organization}</div>
                            <p className="mt-2 text-gray-700">{e.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="md:col-span-1">
                <div className="p-4 bg-white/60 border border-white/30 rounded-lg">
                  <h4 className="font-bold mb-2">Enlace público</h4>
                  <a href={`/p/${profile.slug}`} target="_blank" rel="noreferrer" className="text-emerald-700 underline">rumi.com/p/{profile.slug}</a>
                </div>
                <div className="mt-6 p-4 bg-white/60 border border-white/30 rounded-lg">
                  <h4 className="font-bold mb-2">Contacto</h4>
                  {profile.social?.linkedin && <div><a href={profile.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div>}
                  {profile.social?.twitter && <div><a href={profile.social.twitter} target="_blank" rel="noreferrer">X</a></div>}
                  {profile.social?.github && <div><a href={profile.social.github} target="_blank" rel="noreferrer">GitHub</a></div>}
                  {profile.social?.website && <div><a href={profile.social.website} target="_blank" rel="noreferrer">Sitio web</a></div>}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
