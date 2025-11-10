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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getAvatarUrl } from '../utils/avatar';
import Logo from '../assets/logo-academic.png';
import Icone from '../assets/icon.png';

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

  // Déterminer l'URL de l'avatar (préfère avatar_url si fourni, sinon construit via getAvatarUrl)
  const rawAvatar =
    user?.avatar ||
    user?.avatar_url ||
    user?.etudiant?.avatar ||
    user?.etudiant?.avatar_url ||
    user?.prof?.avatar ||
    user?.prof?.avatar_url ||
    '';
  const avatarUrl =
    typeof rawAvatar === 'string' && rawAvatar.includes('http')
      ? rawAvatar
      : getAvatarUrl(rawAvatar);

  return (
    <aside className={cn(
      'shrink-0 bg-white border-r h-screen overflow-hidden transition-all duration-200 sticky top-0 z-30',
      collapsed ? 'w-20 min-w-20 max-w-20' : 'w-64 min-w-[16rem] max-w-[16rem]'
    )}>
      <div className="h-full flex flex-col">
        {/* Brand + Collapse toggle */}
        <div className="px-3 py-3 flex items-center justify-between border-b bg-white">
          <Link
            to={isAdmin ? '/admin' : isProfessor ? '/professor' : '/student'}
            className={cn('inline-flex items-center', collapsed ? 'justify-center w-full' : 'gap-2')}
          >
            <img
              src={collapsed ? Icone : Logo}
              alt={collapsed ? 'Icone' : 'Logo'}
              className={cn(
                'block w-auto transition-all duration-300',
                collapsed ? 'h-8 w-8' : 'h-40 w-40'
              )}
            />
          </Link>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
            aria-label={collapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 bg-blue-900">
          {!collapsed && (
            <div className="px-2 pb-2">
              <p className="text-xs uppercase tracking-wide text-gray-100">Navigation</p>
            </div>
          )}
          <div className={cn('space-y-1.5', collapsed && 'space-y-1')}>
            {links.map((link) => {
              const Icon = link.icon;
              const hasActiveSubmenu = link.submenu?.some(sub => isActive(sub.path));
              const underlineClass = collapsed
                ? 'after:left-1/2 after:-translate-x-1/2 after:w-8'
                : 'after:left-3 after:right-3';

              if (link.hasSubmenu && link.submenu) {
                return (
                  <div key={link.path}>
                    <button
                      onClick={() => !collapsed && setIsUsersMenuOpen(!isUsersMenuOpen)}
                      className={cn(
                        'relative w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors overflow-hidden group',
                        'after:absolute after:bottom-1 after:h-0.5 after:bg-amber-500 after:rounded-full after:origin-center after:scale-x-0 after:transition-transform after:duration-200',
                        underlineClass,
                        hasActiveSubmenu || isUsersMenuOpen
                          ? 'text-amber-500 after:scale-x-100'
                          : 'text-white hover:text-amber-500 hover:after:scale-x-100'
                      )}
                    >
                      <div className={cn('flex items-center', collapsed ? 'justify-center w-full' : 'gap-3')}>
                        <Icon className={cn(
                          'h-5 w-5 transition-colors',
                          (hasActiveSubmenu || isUsersMenuOpen) 
                            ? 'text-amber-500' 
                            : 'text-white group-hover:text-amber-500'
                        )} />
                        {!collapsed && <span className={cn(
                          'font-medium transition-colors',
                          (hasActiveSubmenu || isUsersMenuOpen)
                            ? 'text-amber-500'
                            : 'text-white group-hover:text-amber-500'
                        )}>{link.label}</span>}
                      </div>
                      {!collapsed && (
                        isUsersMenuOpen ? (
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 text-white" />
                        ) : (
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 text-white" />
                        )
                      )}
                    </button>
                    {isUsersMenuOpen && !collapsed && (
                      <div className="ml-2 mt-1 space-y-1.5">
                        {link.submenu.map((subLink) => {
                          const SubIcon = subLink.icon;
                          return (
                            <Link
                              key={subLink.path}
                              to={subLink.path}
                              className={cn(
                                'relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm overflow-hidden group',
                                'after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-amber-500 after:rounded-full after:origin-center after:scale-x-0 after:transition-transform after:duration-200',
                                isActive(subLink.path)
                                  ? 'text-amber-500 after:scale-x-100'
                                  : 'text-white hover:text-amber-500 hover:after:scale-x-100'
                              )}
                            >
                              <SubIcon className={cn(
                                'h-4 w-4 transition-colors',
                                isActive(subLink.path) 
                                  ? 'text-amber-500' 
                                  : 'text-white group-hover:text-amber-500'
                              )} />
                              <span className={cn(
                                'transition-colors',
                                isActive(subLink.path)
                                  ? 'text-amber-500'
                                  : 'text-white group-hover:text-amber-500'
                              )}>{subLink.label}</span>
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
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors overflow-hidden group',
                    'after:absolute after:bottom-1 after:h-0.5 after:bg-amber-500 after:rounded-full after:origin-center after:scale-x-0 after:transition-transform after:duration-200',
                    underlineClass,
                    isActive(link.path)
                      ? 'text-amber-500 after:scale-x-100'
                      : 'text-white hover:text-amber-500 hover:after:scale-x-100'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 mx-auto sm:mx-0 transition-colors',
                    isActive(link.path) 
                      ? 'text-amber-500' 
                      : 'text-white group-hover:text-amber-500'
                  )} />
                  {!collapsed && <span className={cn(
                    'font-medium truncate transition-colors',
                    isActive(link.path) 
                      ? 'text-amber-500' 
                      : 'text-white group-hover:text-amber-500'
                  )}>{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section (fixed at bottom) */}
        <div className="pt-3 border-t px-3 pb-3 bg-white">
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md transition-colors',
              isActive('/profile') ? 'bg-blue-50' : 'hover:bg-gray-100',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Profil' : undefined}
          >
            <Avatar className="h-9 w-9 ring-1 ring-gray-200">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              )}
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
              'mt-2 w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors',
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

