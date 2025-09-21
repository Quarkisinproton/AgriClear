"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mockUsers } from '@/lib/data';

type Role = 'Farmer' | 'Middleman' | 'Consumer' | null;
type UserId = string | null;

interface AuthContextType {
  user: any; 
  role: Role;
  userId: UserId;
  login: (role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<UserId>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect handles auto-login based on localStorage
    const autoLogin = () => {
      try {
        const storedRole = localStorage.getItem('userRole') as Role;
        if (storedRole) {
          const mockUser = Object.values(mockUsers).find(u => u.role === storedRole);
          if (mockUser) {
            setUser({ email: mockUser.email });
            setRole(mockUser.role as Role);
            setUserId(mockUser.id);
          }
        }
      } catch (error) {
          console.error("Could not access localStorage");
      } finally {
          setIsLoading(false);
      }
    }
    autoLogin();
  }, []);

  useEffect(() => {
    // This effect handles redirection if the user is not logged in
    if (!isLoading && !user && pathname !== '/') {
        router.push('/');
    }
  }, [isLoading, user, pathname, router]);

  const login = async (selectedRole: Role) => {
    if (!selectedRole) return;
    
    // Find the corresponding mock user
    const mockUser = Object.values(mockUsers).find(u => u.role === selectedRole);

    if (mockUser) {
      setUser({ email: mockUser.email });
      setRole(mockUser.role as Role);
      setUserId(mockUser.id);
      localStorage.setItem('userRole', selectedRole);

      // Redirect based on role
      if (selectedRole === 'Farmer') router.push('/farmer');
      if (selectedRole === 'Middleman') router.push('/middleman');
      if (selectedRole === 'Consumer') router.push('/consumer');
    } else {
      console.error(`No mock user found for role: ${selectedRole}`);
      // Handle login failure, e.g., show a toast message
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUserId(null);
    try {
        localStorage.removeItem('userRole');
    } catch (error) {
        console.error("Could not access localStorage");
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, role, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
