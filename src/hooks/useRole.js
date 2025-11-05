import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

/**
 * Hook personnalisé pour vérifier les rôles de l'utilisateur
 */
export const useRole = () => {
  const { user, hasRole, hasAnyRole } = useAuth();

  const isAdmin = hasRole(ROLES.ADMIN); // 'admin'
  const isProfessor = hasRole(ROLES.PROFESSOR); // 'prof'
  const isStudent = hasRole(ROLES.STUDENT); // 'etudiant'

  return {
    userRole: user?.role,
    isAdmin,
    isProfessor,
    isStudent,
    hasRole,
    hasAnyRole,
  };
};

