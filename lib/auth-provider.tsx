'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface User {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

interface AuthResult {
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResult>;
    signup: (email: string, password: string, name?: string) => Promise<AuthResult>;
    signInWithGoogle: () => Promise<AuthResult>;
    sendPasswordReset: (email: string) => Promise<AuthResult>;
    updatePassword: (password: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getUser(user: SupabaseUser | null): User | null {
    if (!user) return null;

    const metadata = user.user_metadata;
    return {
        sub: user.id,
        email: user.email ?? '',
        name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User',
        picture: metadata.avatar_url || metadata.picture || undefined,
    };
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Authentication request failed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const supabase = useMemo(() => {
        try {
            return createClient();
        } catch (error) {
            console.error('Supabase auth configuration error:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = getUser(session?.user ?? null);
            setUser(currentUser);
            setIsAuthenticated(Boolean(currentUser));
            setIsLoading(false);
        });

        void supabase.auth.getSession()
            .then(async ({ data, error }) => {
                if (error) {
                    console.error('Session check error:', error);
                    setUser(null);
                    setIsAuthenticated(false);
                    return;
                }

                if (!data.session) {
                    setUser(null);
                    setIsAuthenticated(false);
                    return;
                }

                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('Session check error:', userError);
                    setUser(null);
                    setIsAuthenticated(false);
                } else {
                    const currentUser = getUser(userData.user);
                    setUser(currentUser);
                    setIsAuthenticated(Boolean(currentUser));
                }
            })
            .catch((error: unknown) => {
                console.error('Session check error:', error);
                setUser(null);
                setIsAuthenticated(false);
            })
            .finally(() => setIsLoading(false));

        return () => subscription.unsubscribe();
    }, [supabase]);

    const checkSession = async () => {
        if (!supabase) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (!data.session) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const currentUser = getUser(userData.user);
            setUser(currentUser);
            setIsAuthenticated(Boolean(currentUser));
        } catch (error) {
            console.error('Session check error:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<AuthResult> => {
        if (!supabase) {
            return { success: false, error: 'Supabase auth is not configured. Check the Supabase environment variables.' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { success: false, error: error.message };

            const currentUser = getUser(data.user);
            setUser(currentUser);
            setIsAuthenticated(Boolean(currentUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: getErrorMessage(error) };
        }
    };

    const signup = async (email: string, password: string, name?: string): Promise<AuthResult> => {
        if (!supabase) {
            return { success: false, error: 'Supabase auth is not configured. Check the Supabase environment variables.' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/home`,
                },
            });
            if (error) return { success: false, error: error.message };

            if (!data.session) {
                return { success: true, requiresEmailConfirmation: true };
            }

            const currentUser = getUser(data.user);
            setUser(currentUser);
            setIsAuthenticated(Boolean(currentUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: getErrorMessage(error) };
        }
    };

    const signInWithGoogle = async (): Promise<AuthResult> => {
        if (!supabase) {
            return { success: false, error: 'Supabase auth is not configured. Check the Supabase environment variables.' };
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?next=/home`,
                    queryParams: { prompt: 'select_account' },
                },
            });
            return error ? { success: false, error: error.message } : { success: true };
        } catch (error) {
            return { success: false, error: getErrorMessage(error) };
        }
    };

    const sendPasswordReset = async (email: string): Promise<AuthResult> => {
        if (!supabase) {
            return { success: false, error: 'Supabase auth is not configured. Check the Supabase environment variables.' };
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
            });
            return error ? { success: false, error: error.message } : { success: true };
        } catch (error) {
            return { success: false, error: getErrorMessage(error) };
        }
    };

    const updatePassword = async (password: string): Promise<AuthResult> => {
        if (!supabase) {
            return { success: false, error: 'Supabase auth is not configured. Check the Supabase environment variables.' };
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            return error ? { success: false, error: error.message } : { success: true };
        } catch (error) {
            return { success: false, error: getErrorMessage(error) };
        }
    };

    const logout = async () => {
        if (!supabase) return;

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            return;
        }

        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) {
            console.error('Could not clear the legacy auth cookie:', response.statusText);
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login,
                signup,
                signInWithGoogle,
                sendPasswordReset,
                updatePassword,
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
