import React, { useState, useEffect } from 'react';

export default function CourseSearchBar({ courses, courseRefs, placeholder = 'Buscar curso...' }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (search.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = courses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered);
  }, [search, courses]);

  const handleSuggestionClick = (id) => {
    setSearch('');
    setSuggestions([]);
    if (courseRefs.current && courseRefs.current[id]) {
      courseRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-4">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 text-lg shadow-sm"
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border border-blue-200 rounded-xl mt-1 z-20 shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map(s => (
            <li
              key={s._id}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
              onClick={() => handleSuggestionClick(s._id)}
            >
              {s.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 