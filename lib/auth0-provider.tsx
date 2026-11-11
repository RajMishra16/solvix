'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface User {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const checkSession = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();

            setIsAuthenticated(data.authenticated);
            setUser(data.authenticated ? data.user : null);
        } catch (error) {
            console.error('Session check error:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const text = await response.text();
            let data: any = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { error: 'Authentication service is unavailable. Please try again later.' };
                }
            }

            if (!response.ok) {
                return { success: false, error: data.error || 'Authentication service is unavailable. Please try again later.' };
            }

            setIsAuthenticated(true);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Authentication service is unavailable. Please try again later.' };
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, name?: string) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const text = await response.text();
            let data: any = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { error: 'Authentication service is unavailable. Please try again later.' };
                }
            }

            if (!response.ok) {
                return { success: false, error: data.error || 'Authentication service is unavailable. Please try again later.' };
            }

            if (data.requiresLogin) {
                return { success: true };
            }

            setIsAuthenticated(true);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Authentication service is unavailable. Please try again later.' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login,
                signup,
                logout,
                checkSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
