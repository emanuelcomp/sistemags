import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await auth.login(email, senha);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      
      setUser(response.usuario);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasPermission = (requiredLevel) => {
    return user && user.nivel_acesso >= requiredLevel;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

