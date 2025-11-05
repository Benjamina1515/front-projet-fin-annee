import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isAdmin, isProfessor, isStudent } = useRole();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isProfessor) return '/professor';
    if (isStudent) return '/student';
    return '/';
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Titre */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="text-xl font-bold text-blue-600">
              Suivi Académique
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to={getDashboardLink()}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Utilisateurs
                </Link>
                <Link
                  to="/admin/projects"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projets
                </Link>
              </>
            )}
            {isProfessor && (
              <Link
                to="/professor/evaluations"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Évaluations
              </Link>
            )}
            {isStudent && (
              <Link
                to="/student/projects"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mes Projets
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
              <span className="text-xs text-gray-500">({user?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Menu Mobile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              to={getDashboardLink()}
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Utilisateurs
                </Link>
                <Link
                  to="/admin/projects"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Projets
                </Link>
              </>
            )}
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-gray-700 px-3 py-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

