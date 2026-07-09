'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getSpace,
  getSpaceReviews,
  createReservation,
  createReview,
  toggleFavorite,
  getMyFavorites,
} from '@/lib/api';
import { getToken, isLoggedIn } from '@/lib/auth';

const HOURS = ['09:00', '10:00', '11:00', '13:00', '14:00', '16:00'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [space, setSpace] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [date, setDate] = useState(todayISO());
  const [hour, setHour] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');

  const [isFav, setIsFav] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  function loadAll() {
    setLoading(true);
    Promise.all([getSpace(id), getSpaceReviews(id)])
      .then(([s, r]) => {
        setSpace(s);
        setReviews(Array.isArray(r) ? r : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    const token = getToken()!;
    getMyFavorites(token)
      .then((favs: any[]) => {
        setIsFav(favs.some((f) => f.spaceId === Number(id)));
      })
      .catch(() => {});
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function handleReserve() {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    if (!hour) {
      setBookingMsg('Elige un horario primero.');
      return;
    }
    setBooking(true);
    setBookingMsg('');
    try {
      const token = getToken()!;
      const startTime = new Date(`${date}T${hour}:00`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      await createReservation(token, {
        spaceId: Number(id),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      setBookingMsg('¡Solicitud enviada! Revisa "Mis reservas".');
      setHour('');
    } catch (e: any) {
      setBookingMsg(e.message || 'No se pudo reservar.');
    } finally {
      setBooking(false);
    }
  }

  async function handleToggleFavorite() {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const token = getToken()!;
    try {
      const res = await toggleFavorite(token, Number(id));
      setIsFav(res.favorited);
    } catch (e) {
      // silencioso, no es crítico
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    setSendingReview(true);
    setReviewMsg('');
    try {
      const token = getToken()!;
      await createReview(token, { spaceId: Number(id), rating, comment });
      setComment('');
      setReviewMsg('¡Gracias por tu reseña!');
      loadAll();
    } catch (e: any) {
      setReviewMsg(e.message || 'No se pudo publicar la reseña.');
    } finally {
      setSendingReview(false);
    }
  }

  if (loading) return <p className="text-stone-500">Cargando espacio…</p>;

  if (error || !space) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-red-700">No se pudo cargar el espacio.</p>
        <Link href="/" className="text-emerald-700 underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
        ← Volver a explorar
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-stone-100">
            {space.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={space.imageUrl}
                alt={space.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                Sin imagen
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">
                {space.name}
              </h1>
              <p className="mt-1 text-stone-500">
                {space.location} · {space.capacity} personas
              </p>
            </div>
            <button
              onClick={handleToggleFavorite}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium ${
                isFav
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-stone-300 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {isFav ? '♥ Guardado' : '♡ Guardar'}
            </button>
          </div>

          {space.description && (
            <p className="leading-relaxed text-stone-700">
              {space.description}
            </p>
          )}

          {/* Reseñas */}
          <section className="flex flex-col gap-4 border-t border-stone-200 pt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-900">
                Reseñas
              </h2>
              {avgRating && (
                <span className="text-sm text-stone-500">
                  ★ {avgRating} · {reviews.length} reseña
                  {reviews.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {reviews.length === 0 && (
                <p className="text-sm text-stone-500">
                  Aún no hay reseñas para este espacio.
                </p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-800">
                    {r.user?.name?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-900">
                        {r.user?.name || 'Usuario'}
                      </span>
                      <span className="text-xs text-stone-400">
                        ★ {r.rating}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-0.5 text-sm text-stone-600">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmitReview}
              className="mt-2 flex flex-col gap-2 rounded-xl border border-stone-200 p-4"
            >
              <p className="text-sm font-medium text-stone-700">
                Deja tu reseña
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-xl ${n <= rating ? 'text-emerald-600' : 'text-stone-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció este espacio?"
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                rows={2}
              />
              <button
                type="submit"
                disabled={sendingReview}
                className="self-start rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {sendingReview ? 'Enviando…' : 'Publicar reseña'}
              </button>
              {reviewMsg && (
                <p className="text-sm text-stone-600">{reviewMsg}</p>
              )}
            </form>
          </section>
        </div>

        {/* Tarjeta de reserva */}
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Fecha</p>
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />

          <p className="mt-4 text-sm font-medium text-stone-500">
            Horario disponible
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {HOURS.map((h) => (
              <button
                key={h}
                onClick={() => setHour(h)}
                className={`rounded-lg border px-2 py-1.5 text-sm ${
                  hour === h
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          <button
            onClick={handleReserve}
            disabled={booking}
            className="mt-5 w-full rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {booking ? 'Reservando…' : 'Reservar este horario'}
          </button>

          {bookingMsg && (
            <p className="mt-3 text-sm text-stone-600">{bookingMsg}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
