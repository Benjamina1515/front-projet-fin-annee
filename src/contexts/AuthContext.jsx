import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Vérifier si le token est toujours valide
          await authService.verifyToken();
        } catch (error) {
          // Token invalide, déconnecter
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      // Laravel renvoie { success, message, token, user }
      const newToken = response?.token || response?.data?.token;
      const userData = response?.user || response?.data?.user;

      if (!newToken || !userData) {
        throw new Error('Réponse de connexion invalide');
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur de connexion',
      };
    }
  };

  const register = async (payload) => {
    try {
      const response = await authService.register(payload);
      const newToken = response?.token || response?.data?.token;
      const userData = response?.user || response?.data?.user;

      if (!newToken || !userData) {
        throw new Error("Réponse d'inscription invalide");
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      let message = error.response?.data?.message || error.message || "Erreur lors de l'inscription";

      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()?.[0];
        if (firstError) {
          message = firstError;
        }
      }

      return {
        success: false,
        error: message,
      };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user && !!token,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

