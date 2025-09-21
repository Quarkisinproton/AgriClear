"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BrowserProvider } from 'ethers';

type Role = 'Farmer' | 'Middleman' | 'Consumer' | null;
type UserId = string | null;

interface AuthContextType {
  user: any; 
  role: Role;
  userId: UserId;
  login: (role: Role) => void;
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
    const autoLogin = async () => {
      try {
        const storedRole = localStorage.getItem('userRole') as Role;
        if (storedRole) {
          if (storedRole === 'Consumer') {
             setUser({ email: 'consumer@example.com' });
             setRole(storedRole);
             setUserId('consumer_user');
          } else if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum);
            // Check if we're already connected
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              setUser({ email: address });
              setRole(storedRole);
              setUserId(address);
            }
          }
        }
      } catch (error) {
          console.error("Could not access localStorage or MetaMask");
      } finally {
          setIsLoading(false);
      }
    }
    autoLogin();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/') {
        router.push('/');
    }
  }, [isLoading, user, pathname, router]);


  const login = async (selectedRole: Role) => {
    if (!selectedRole) return;
    
    if (selectedRole === 'Consumer') {
        setUser({ email: 'consumer@example.com' });
        setRole(selectedRole);
        setUserId('consumer_user');
        localStorage.setItem('userRole', selectedRole);
        router.push('/consumer');
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
    }

    try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setUser({ email: address });
        setRole(selectedRole);
        setUserId(address);
        localStorage.setItem('userRole', selectedRole);
    
        if (selectedRole === 'Farmer') router.push('/farmer');
        if (selectedRole === 'Middleman') router.push('/middleman');

    } catch (error) {
        console.error("Failed to connect with MetaMask", error);
        alert("Failed to connect wallet. Make sure MetaMask is unlocked and you've approved the connection.");
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
