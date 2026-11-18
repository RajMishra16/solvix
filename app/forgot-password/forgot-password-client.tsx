'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordClient() {
    const { sendPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setNotice(null);

        const result = await sendPasswordReset(email);
        if (result.success) {
            setNotice('If an account exists for that email, a password reset link will be sent.');
        } else {
            setError(result.error || 'Could not send the reset email. Please try again.');
        }
        setIsLoading(false);
    }

    return (
        <AuthLayout
            quote="Plan renewable energy installations for your land with confidence."
            author="Solvix"
        >
            <div className="grid gap-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your account email and we&apos;ll send a reset link.
                    </p>
                </div>

                {error && (
                    <div role="alert" className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                        {error}
                    </div>
                )}
                {notice && (
                    <div role="status" className="rounded-md bg-emerald-500/10 p-3 text-center text-sm text-emerald-700">
                        {notice}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Sending link...' : 'Send reset link'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
