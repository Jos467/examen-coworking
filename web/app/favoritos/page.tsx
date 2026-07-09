'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyFavorites } from '@/lib/api';
import { getToken, isLoggedIn } from '@/lib/auth';
import SpaceCard from '@/components/SpaceCard';

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const token = getToken()!;
    getMyFavorites(token)
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Mis favoritos
        </h1>
        <p className="mt-1 text-stone-500">
          Espacios que guardaste para reservar rápido la próxima vez.
        </p>
      </div>

      {loading && <p className="text-stone-500">Cargando…</p>}
      {!loading && favorites.length === 0 && (
        <p className="text-stone-500">Aún no tienes espacios guardados.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((f) => (
          <SpaceCard key={f.id} space={f.space} />
        ))}
      </div>
    </div>
  );
}
