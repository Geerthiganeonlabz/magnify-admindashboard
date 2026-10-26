'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import {
  authenticateDemoUser,
  DEMO_SESSION_KEY,
} from '@/lib/demoAuth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const session = authenticateDemoUser(username.trim(), password);
      if (!session) {
        setError('Username or password is incorrect, or this account is inactive.');
        return;
      }

      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      document.cookie = 'demoAuth=1; path=/; samesite=lax';
      router.replace('/dashboard');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Unable to sign in. Please try again.',
      );
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[linear-gradient(135deg,#0B2F8F_0%,#071C40_60%,#05142F_100%)] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <LockKeyhole size={25} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">
            Magnify Workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#071C40]">
            Sign in to your dashboard
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Use the credentials provided by your administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-semibold text-[#334155]">
            Username
            <span className="mt-1.5 flex h-12 items-center gap-3 rounded-xl border border-[#CBD5E1] px-3 focus-within:border-[#2563EB]">
              <UserRound size={18} className="text-[#94A3B8]" />
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="w-full bg-transparent text-sm font-normal outline-none"
              />
            </span>
          </label>

          <label className="block text-sm font-semibold text-[#334155]">
            Password
            <span className="mt-1.5 flex h-12 items-center gap-3 rounded-xl border border-[#CBD5E1] px-3 focus-within:border-[#2563EB]">
              <LockKeyhole size={18} className="text-[#94A3B8]" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent text-sm font-normal outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-[#64748B]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#2563EB] text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
          >
            Sign in
          </button>
        </form>

      </section>
    </main>
  );
}
