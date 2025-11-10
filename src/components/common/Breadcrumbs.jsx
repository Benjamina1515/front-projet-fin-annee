import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABELS = {
  admin: 'Admin',
  professor: 'Professeur',
  student: 'Étudiant',
  users: 'Utilisateurs',
  profs: 'Professeurs',
  etudiants: 'Étudiants',
  projects: 'Projets',
  tasks: 'Tâches',
  evaluations: 'Évaluations',
  reports: 'Rapports',
  profile: 'Profil',
};

const capitalize = (s) => s?.charAt(0).toUpperCase() + s?.slice(1);

const Breadcrumbs = ({ className = '' }) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const items = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = LABELS[seg] || capitalize(seg.replace(/-/g, ' '));
    return { href, label, isLast: idx === segments.length - 1 };
  });

  // Root item (Dashboard) based on first segment
  const root = items[0];
  let dashboardHref = '/';
  if (root?.label === 'Admin') dashboardHref = '/admin';
  if (root?.label === 'Professeur') dashboardHref = '/professor';
  if (root?.label === 'Étudiant') dashboardHref = '/student';

  const trail = [
    ...(root ? [{ href: dashboardHref, label: 'Dashboard', isLast: items.length === 0 }] : []),
    ...items,
  ];

  return (
    <nav className={`flex items-center text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {trail.map((item, idx) => (
        <div key={item.href} className="flex items-center">
          {idx > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          {item.isLast ? (
            <span className="font-medium text-gray-900">{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;


