"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Leaf, LogOut, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export default function AppLayout({ children, expectedRole }: { children: React.ReactNode, expectedRole: 'Farmer' | 'Middleman' | 'Consumer' }) {
    const { user, role, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/');
            } else if (role !== expectedRole) {
                if (role === 'Farmer') router.replace('/farmer');
                if (role === 'Middleman') router.replace('/middleman');
                if (role === 'Consumer') router.replace('/consumer');
            }
        }
    }, [user, role, isLoading, router, expectedRole]);

    if (isLoading || !user || role !== expectedRole) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card border-b sticky top-0 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-8 h-8 text-primary"/>
                            <h1 className="text-xl font-bold font-headline">AgriTrack</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {role}!</span>
                            <Button variant="ghost" size="icon" onClick={logout}>
                                <LogOut className="w-5 h-5"/>
                                <span className="sr-only">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
