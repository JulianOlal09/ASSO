import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando autenticación...');
      const usuarioGuardado = await authService.getUsuarioActual();
      console.log('👤 Usuario guardado:', usuarioGuardado);
      if (usuarioGuardado) {
        setUsuario(usuarioGuardado);
        console.log('✅ Usuario cargado:', usuarioGuardado.nombre, '-', usuarioGuardado.rol);
      } else {
        console.log('❌ No hay usuario guardado');
      }
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
      console.log('✅ Verificación de autenticación completada');
    }
  };

  const login = async (email, password) => {
    try {
      const { usuario: usuarioData } = await authService.login(email, password);
      setUsuario(usuarioData);
      console.log('✅ Login exitoso:', usuarioData.nombre);
      return usuarioData;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const registro = async (nombre, email, password, rol) => {
    try {
      const result = await authService.registro(nombre, email, password, rol);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Cerrando sesión...');
    await authService.logout();
    setUsuario(null);
  };

  const isAuthenticated = () => {
    return !!usuario;
  };

  const hasRole = (roles) => {
    if (!usuario) return false;
    return roles.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        registro,
        logout,
        isAuthenticated,
        hasRole,
        verificarAutenticacion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
