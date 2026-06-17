import React from 'react';

const avatars = [
  { id: 'wolf', label: 'Lobo', tone: '#dbe7ef' },
  { id: 'duck', label: 'Pato', tone: '#fff0a8' },
];

export default function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div className="rumi-avatar-selector" role="tablist" aria-label="Seleccion de avatar">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          role="tab"
          aria-selected={selectedAvatar === avatar.id}
          className={selectedAvatar === avatar.id ? 'is-selected' : ''}
          onClick={() => onSelect(avatar.id)}
        >
          <span style={{ backgroundColor: avatar.tone }} />
          {avatar.label}
        </button>
      ))}
    </div>
  );
}
