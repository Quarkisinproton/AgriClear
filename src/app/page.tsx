"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Tractor, Users, User } from 'lucide-react';

type Role = 'Farmer' | 'Middleman' | 'Consumer';

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>('Farmer');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">AgriTrack</CardTitle>
          <CardDescription>Track produce from farm to table</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" defaultValue="user@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value: Role) => setRole(value)} defaultValue={role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Farmer">
                    <div className="flex items-center gap-2">
                      <Tractor className="w-4 h-4" /> Farmer
                    </div>
                  </SelectItem>
                  <SelectItem value="Middleman">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Middleman
                    </div>
                  </SelectItem>
                  <SelectItem value="Consumer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Consumer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Login</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
