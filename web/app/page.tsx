'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSpaces } from '@/lib/api';
import SpaceCard from '@/components/SpaceCard';

export default function ExplorarPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    getSpaces()
      .then(setSpaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => {
    const unique = Array.from(new Set(spaces.map((s) => s.type))).filter(
      Boolean,
    );
    return ['Todos', ...unique];
  }, [spaces]);

  const filtered = useMemo(() => {
    if (filter === 'Todos') return spaces;
    return spaces.filter((s) => s.type === filter);
  }, [spaces, filter]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Nido · Coworking
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Encuentra tu espacio ideal
        </h1>
        <p className="mt-2 text-stone-600">
          {loading
            ? 'Cargando espacios disponibles…'
            : `${filtered.length} espacio${filtered.length === 1 ? '' : 's'} disponible${filtered.length === 1 ? '' : 's'}.`}
        </p>
      </section>

      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === t
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-stone-300 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los espacios: {error}
          <br />
          Verifica que la API esté corriendo en{' '}
          <code>{process.env.NEXT_PUBLIC_API_URL}</code>.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-stone-500">No hay espacios para este filtro.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
}
