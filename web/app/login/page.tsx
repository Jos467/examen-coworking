'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, registerUser, getMe } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser({ name, email, password });
      }
      const { accessToken } = await login(email, password);
      const user = await getMe(accessToken);
      saveSession(accessToken, user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {mode === 'login'
            ? 'Accede para reservar espacios y ver tu actividad.'
            : 'Regístrate para empezar a reservar espacios.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
              Nombre
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              placeholder="Tu nombre completo"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            placeholder="tu@correo.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">
            Contraseña
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading
            ? 'Un momento…'
            : mode === 'login'
              ? 'Iniciar sesión'
              : 'Registrarme'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="text-sm text-stone-500 hover:text-stone-800"
      >
        {mode === 'login'
          ? '¿No tienes cuenta? Regístrate'
          : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
}