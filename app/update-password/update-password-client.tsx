'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UpdatePasswordClient() {
    const router = useRouter();
    const { updatePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError(null);
        const result = await updatePassword(password);
        if (result.success) {
            router.push('/home');
        } else {
            setError(result.error || 'Could not update your password. Request a new reset link.');
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            quote="Plan renewable energy installations for your land with confidence."
            author="Solvix"
        >
            <div className="grid gap-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
                    <p className="text-sm text-muted-foreground">
                        Use at least 6 characters.
                    </p>
                </div>

                {error && (
                    <div role="alert" className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Updating password...' : 'Update password'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
