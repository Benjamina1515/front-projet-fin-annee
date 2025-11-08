import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRole } from '../hooks/useRole';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isProfessor, isStudent } = useRole();
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);

  // Ouvrir automatiquement le sous-menu si on est sur une de ses pages
  useEffect(() => {
    if (location.pathname.startsWith('/admin/users/profs') || 
        location.pathname.startsWith('/admin/users/etudiants')) {
      setIsUsersMenuOpen(true);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/admin/users',
      label: 'Utilisateurs',
      icon: Users,
      hasSubmenu: true,
      submenu: [
        { path: '/admin/users/profs', label: 'Professeurs', icon: UserCog },
        { path: '/admin/users/etudiants', label: 'Étudiants', icon: GraduationCap },
      ],
    },
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
    <aside className="w-64 min-w-[16rem] max-w-[16rem] flex-shrink-0 bg-gray-50 min-h-screen border-r">
      <div className="p-4 h-full overflow-y-auto">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const hasActiveSubmenu = link.submenu?.some(sub => isActive(sub.path));

            if (link.hasSubmenu && link.submenu) {
              return (
                <div key={link.path}>
                  <button
                    onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                      hasActiveSubmenu || isUsersMenuOpen
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </div>
                    {isUsersMenuOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isUsersMenuOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.submenu.map((subLink) => {
                        const SubIcon = subLink.icon;
                        return (
                          <Link
                            key={subLink.path}
                            to={subLink.path}
                            className={cn(
                              'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm',
                              isActive(subLink.path)
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            <SubIcon className="h-4 w-4" />
                            <span>{subLink.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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

