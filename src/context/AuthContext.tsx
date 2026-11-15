import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  RegisterSuccessData,
  ResendOtpSuccessData,
  AuthSuccessData,
} from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<AuthSuccessData>;
  register: (payload: RegisterRequest) => Promise<RegisterSuccessData>;
  verifyOtp: (payload: VerifyOtpRequest) => Promise<AuthSuccessData>;
  resendOtp: (payload: ResendOtpRequest) => Promise<ResendOtpSuccessData>;
  loginWithGoogle: (payload: { idToken?: string; credential?: string }) => Promise<AuthSuccessData>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync / verify token khi ứng dụng khởi động
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          // Token không còn hợp lệ
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const saveAuthSession = (authData: AuthSuccessData) => {
    const authToken = authData.accessToken || authData.token;
    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }
    if (authData.user) {
      localStorage.setItem('user', JSON.stringify(authData.user));
      setUser(authData.user);
    }
  };

  const login = async (payload: LoginRequest): Promise<AuthSuccessData> => {
    const res = await authService.login(payload);
    saveAuthSession(res.data);
    return res.data;
  };

  const register = async (payload: RegisterRequest): Promise<RegisterSuccessData> => {
    const res = await authService.register(payload);
    return res.data;
  };

  const verifyOtp = async (payload: VerifyOtpRequest): Promise<AuthSuccessData> => {
    const res = await authService.verifyOtp(payload);
    saveAuthSession(res.data);
    return res.data;
  };

  const resendOtp = async (payload: ResendOtpRequest): Promise<ResendOtpSuccessData> => {
    const res = await authService.resendOtp(payload);
    return res.data;
  };

  const loginWithGoogle = async (payload: { idToken?: string; credential?: string }): Promise<AuthSuccessData> => {
    const res = await authService.googleAuth(payload);
    saveAuthSession(res.data);
    return res.data;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
