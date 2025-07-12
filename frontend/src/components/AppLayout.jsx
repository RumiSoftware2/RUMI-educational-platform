// frontend/src/components/AppLayout.jsx
import { useLocation } from 'react-router-dom';
import Header from './Header';

export default function AppLayout({ children }) {
  const location = useLocation();
  
  // Rutas que NO deben mostrar el Header general
  const enterpriseRoutes = [
    '/enterprise-rumi',
    '/enterprise/login',
    '/enterprise/demo',
    '/enterprise/features',
    '/enterprise/pricing',
    '/enterprise/case-studies',
    '/enterprise/contact',
    '/enterprise/universities',
    '/enterprise/schools',
    '/enterprise/corporate',
    '/enterprise/government'
  ];

  // Rutas que SÍ deben mostrar el Header general
  const personalRoutes = [
    '/person-rumi',
    '/register',
    '/login',
    '/profile',
    '/courses',
    '/my-courses',
    '/games',
    '/courses/new',
    '/admin',
    '/student/courses',
    '/teacher/courses',
    '/admin/courses'
  ];

  const isEnterpriseRoute = enterpriseRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  const isPersonalRoute = personalRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Verificar si es una ruta de curso específico (patrón /courses/123)
  const isCourseDetailRoute = /^\/courses\/\d+/.test(location.pathname);

  // Solo mostrar header en rutas personales, no en home ni enterprise
  const shouldShowHeader = isPersonalRoute || isCourseDetailRoute;

  return (
    <>
      {shouldShowHeader && <Header />}
      <div className={shouldShowHeader ? "pt-20" : ""}>
        {children}
      </div>
    </>
  );
} 