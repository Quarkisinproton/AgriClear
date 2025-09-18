"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'Farmer' | 'Middleman' | 'Consumer' | null;

interface AuthContextType {
  user: any; 
  role: Role;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole) {
          setUser({ email: 'user@example.com' });
          setRole(storedRole);
      }
    } catch (error) {
        console.error("Could not access localStorage");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/') {
        router.push('/');
    }
  }, [isLoading, user, pathname, router]);


  const login = (selectedRole: Role) => {
    setUser({ email: 'user@example.com' });
    setRole(selectedRole);
    try {
      if (selectedRole) {
        localStorage.setItem('userRole', selectedRole);
      }
    } catch (error) {
        console.error("Could not access localStorage");
    }
    
    if (selectedRole === 'Farmer') router.push('/farmer');
    if (selectedRole === 'Middleman') router.push('/middleman');
    if (selectedRole === 'Consumer') router.push('/consumer');
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    try {
        localStorage.removeItem('userRole');
    } catch (error) {
        console.error("Could not access localStorage");
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
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
