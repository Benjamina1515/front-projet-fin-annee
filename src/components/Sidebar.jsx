import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  UserCog,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin, isProfessor, isStudent } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    // { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const professorLinks = [
    { path: '/professor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professor/projects', label: 'Mes Projets', icon: FolderKanban },
    { path: '/professor/evaluations', label: 'Évaluations', icon: CheckSquare },
    // { path: '/professor/students', label: 'Étudiants', icon: Users },
  ];

  const studentLinks = [
    { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/projects', label: 'Mes Projets', icon: FolderKanban },
    { path: '/student/tasks', label: 'Mes Tâches', icon: CheckSquare },
    // { path: '/student/reports', label: 'Rapports', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : isProfessor ? professorLinks : studentLinks;

  const userInitials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className={cn(
      'flex-shrink-0 bg-white border-r h-screen overflow-hidden transition-all duration-200',
      collapsed ? 'w-20 min-w-[5rem] max-w-[5rem]' : 'w-64 min-w-[16rem] max-w-[16rem]'
    )}>
      <div className="h-full flex flex-col">
        {/* Brand + Collapse toggle */}
        <div className="px-3 py-3 flex items-center justify-between border-b">
          <Link
            to={isAdmin ? '/admin' : isProfessor ? '/professor' : '/student'}
            className="inline-flex items-center gap-2"
          >
            <span className={cn('text-lg font-bold text-blue-600 truncate', collapsed && 'sr-only')}>
              Suivi Académique
            </span>
            {!collapsed && <span className="text-xs text-gray-400">v1</span>}
          </Link>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
            aria-label={collapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto p-3">
          {links.map((link) => {
            const Icon = link.icon;
            const hasActiveSubmenu = link.submenu?.some(sub => isActive(sub.path));

            if (link.hasSubmenu && link.submenu) {
              return (
                <div key={link.path}>
                  <button
                    onClick={() => !collapsed && setIsUsersMenuOpen(!isUsersMenuOpen)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
                      hasActiveSubmenu || isUsersMenuOpen
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className={cn('flex items-center', collapsed ? 'justify-center w-full' : 'space-x-3')}>
                      <Icon className="h-5 w-5" />
                      {!collapsed && <span className="font-medium">{link.label}</span>}
                    </div>
                    {!collapsed && (
                      isUsersMenuOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </button>
                  {isUsersMenuOpen && !collapsed && (
                    <div className="ml-2 mt-1 space-y-1">
                      {link.submenu.map((subLink) => {
                        const SubIcon = subLink.icon;
                        return (
                          <Link
                            key={subLink.path}
                            to={subLink.path}
                            className={cn(
                              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm',
                              isActive(subLink.path)
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
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
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5 mx-auto" />
                {!collapsed && <span className="font-medium truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section (fixed at bottom) */}
        <div className="pt-3 border-t px-3 pb-3">
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
              isActive('/profile') ? 'bg-blue-50' : 'hover:bg-gray-100',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Profil' : undefined}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {user?.role}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'mt-2 w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

