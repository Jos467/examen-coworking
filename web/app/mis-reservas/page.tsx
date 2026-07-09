'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyReservations, cancelReservation } from '@/lib/api';
import { getToken, isLoggedIn } from '@/lib/auth';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  FINISHED: 'bg-stone-100 text-stone-600',
  CANCELLED: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  FINISHED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

function fmt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('es-HN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MisReservasPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  function load() {
    const token = getToken()!;
    setLoading(true);
    getMyReservations(token)
      .then(setReservations)
      .catch((e) => setError(e.message))
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

  async function handleCancel(id: number) {
    const token = getToken()!;
    try {
      await cancelReservation(token, id);
      load();
    } catch (e) {
      // silencioso
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Mis reservas
        </h1>
        <p className="mt-1 text-stone-500">
          Historial y próximas reservas.
        </p>
      </div>

      {loading && <p className="text-stone-500">Cargando…</p>}
      {error && <p className="text-red-700">{error}</p>}
      {!loading && reservations.length === 0 && (
        <p className="text-stone-500">Todavía no tienes reservas.</p>
      )}

      <div className="flex flex-col gap-3">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-stone-900">
                {r.space?.name || `Espacio #${r.spaceId}`}
              </p>
              <p className="text-sm text-stone-500">
                {r.space?.location}
              </p>
              <p className="text-sm text-stone-500">
                {fmt(r.startTime)} – {fmt(r.endTime)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_STYLES[r.status] || 'bg-stone-100 text-stone-600'
                }`}
              >
                {STATUS_LABELS[r.status] || r.status}
              </span>
              {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                <button
                  onClick={() => handleCancel(r.id)}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
