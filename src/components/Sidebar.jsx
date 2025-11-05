import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isProfessor, isStudent } = useRole();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Utilisateurs', icon: Users },
    { path: '/admin/projects', label: 'Projets', icon: FolderKanban },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const professorLinks = [
    { path: '/professor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professor/projects', label: 'Mes Projets', icon: FolderKanban },
    { path: '/professor/evaluations', label: 'Évaluations', icon: CheckSquare },
    { path: '/professor/students', label: 'Étudiants', icon: Users },
  ];

  const studentLinks = [
    { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/projects', label: 'Mes Projets', icon: FolderKanban },
    { path: '/student/tasks', label: 'Mes Tâches', icon: CheckSquare },
    { path: '/student/reports', label: 'Rapports', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : isProfessor ? professorLinks : studentLinks;

  return (
    <aside className="w-64 bg-gray-50 min-h-screen border-r">
      <div className="p-4">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

