// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Al montar, busca token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = jwtDecode(token);
        if (data.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Si el token tiene 'id', úsalo; si no, intenta obtenerlo de '_id' en localStorage
          let storedUser = null;
          try {
            storedUser = JSON.parse(localStorage.getItem('user'));
          } catch {}
          setUser({ ...data, token, id: data.id || storedUser?.id || storedUser?._id });
        }
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  //const login = async (email, password) => {
  const login = (token, userObj) => {  
    localStorage.setItem('token', token);
    // Aseguro que userObj tenga 'id'
    const userWithId = { ...userObj, id: userObj.id || userObj._id };
    localStorage.setItem('user', JSON.stringify(userWithId));
    setUser({ ...userWithId, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const hasRole = role => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
