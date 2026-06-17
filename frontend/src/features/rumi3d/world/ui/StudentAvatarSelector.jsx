import React from 'react';

const options = [
  { id: 'wolf', label: 'Lobo estudiante', color: '#cad7de' },
  { id: 'duck', label: 'Pato estudiante', color: '#ffe58a' },
];

export default function StudentAvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div className="rumi3d-selector" role="tablist" aria-label="Avatar RUMI 3D">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={selectedAvatar === option.id}
          className={selectedAvatar === option.id ? 'is-active' : ''}
          onClick={() => onSelect(option.id)}
        >
          <span style={{ backgroundColor: option.color }} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
