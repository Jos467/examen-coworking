'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getUser, isLoggedIn } from '@/lib/auth';

export default function Navbar() {
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  function refresh() {
    setLogged(isLoggedIn());
    setUser(getUser());
  }

  useEffect(() => {
    refresh();
    window.addEventListener('auth-changed', refresh);
    return () => window.removeEventListener('auth-changed', refresh);
  }, []);

  function handleLogout() {
    clearSession();
    router.push('/');
  }

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href
          ? 'text-emerald-700'
          : 'text-stone-500 hover:text-stone-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-stone-900">
            Nido
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {link('/', 'Explorar')}
          {logged && link('/mis-reservas', 'Mis reservas')}
          {logged && link('/favoritos', 'Favoritos')}
          {logged && link('/notificaciones', 'Notificaciones')}
        </nav>

        <div className="flex items-center gap-3">
          {logged ? (
            <>
              <span className="hidden text-sm text-stone-500 sm:inline">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {/* nav móvil simple */}
      <nav className="flex items-center gap-5 overflow-x-auto border-t border-stone-200 px-5 py-2 sm:hidden">
        {link('/', 'Explorar')}
        {logged && link('/mis-reservas', 'Mis reservas')}
        {logged && link('/favoritos', 'Favoritos')}
        {logged && link('/notificaciones', 'Notificaciones')}
      </nav>
    </header>
  );
}
