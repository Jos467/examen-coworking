'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api';
import { getToken, isLoggedIn } from '@/lib/auth';

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('es-HN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificacionesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function load() {
    const token = getToken()!;
    getMyNotifications(token)
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkRead(id: number) {
    const token = getToken()!;
    await markNotificationRead(token, id);
    load();
  }

  async function handleMarkAllRead() {
    const token = getToken()!;
    await markAllNotificationsRead(token);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Notificaciones
          </h1>
          <p className="mt-1 text-stone-500">
            Confirmaciones, recordatorios y cancelaciones.
          </p>
        </div>
        {items.some((i) => !i.read) && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
          >
            Marcar leídas
          </button>
        )}
      </div>

      {loading && <p className="text-stone-500">Cargando…</p>}
      {!loading && items.length === 0 && (
        <p className="text-stone-500">No tienes notificaciones.</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && handleMarkRead(n.id)}
            className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left ${
              n.read
                ? 'border-stone-200 bg-white'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <p className="text-sm text-stone-800">{n.message}</p>
            <p className="text-xs text-stone-400">{fmt(n.createdAt)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
