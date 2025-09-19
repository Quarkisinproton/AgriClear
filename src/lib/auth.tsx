"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'Farmer' | 'Middleman' | 'Consumer' | null;
type UserId = '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8' | '0x33C22589a30a70852131e124e0AcA0f7b1A35824' | 'consumer_user' | null;

interface AuthContextType {
  user: any; 
  role: Role;
  userId: UserId;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleToUserIdMap: Record<NonNullable<Role>, UserId> = {
    Farmer: '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8',
    Middleman: '0x33C22589a30a70852131e124e0AcA0f7b1A35824',
    Consumer: 'consumer_user',
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<UserId>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole) {
          setUser({ email: 'user@example.com' });
          setRole(storedRole);
          setUserId(roleToUserIdMap[storedRole]);
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
    if (!selectedRole) return;
    setUser({ email: 'user@example.com' });
    setRole(selectedRole);
    const newUserId = roleToUserIdMap[selectedRole];
    setUserId(newUserId);

    try {
        localStorage.setItem('userRole', selectedRole);
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
