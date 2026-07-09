const API = process.env.NEXT_PUBLIC_API_URL;

async function handle(r: Response) {
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    throw new Error(data?.message || `Error ${r.status}`);
  }
  return data;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ---------- Auth ----------
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const r = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(r);
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handle(r); // { access_token }
}

export async function getMe(token: string) {
  const r = await fetch(`${API}/auth/me`, { headers: authHeaders(token) });
  return handle(r);
}

// ---------- Spaces ----------
export async function getSpaces() {
  const r = await fetch(`${API}/spaces`, { cache: 'no-store' });
  return handle(r);
}

export async function getSpace(id: string) {
  const r = await fetch(`${API}/spaces/${id}`, { cache: 'no-store' });
  return handle(r);
}

// ---------- Reservations ----------
export async function createReservation(
  token: string,
  data: { spaceId: number; startTime: string; endTime: string; reason?: string },
) {
  const r = await fetch(`${API}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handle(r);
}

export async function getMyReservations(token: string) {
  const r = await fetch(`${API}/reservations/me`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(r);
}

export async function updateReservationStatus(
  token: string,
  id: number,
  status: string,
) {
  const r = await fetch(`${API}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
  return handle(r);
}

export async function cancelReservation(token: string, id: number) {
  return updateReservationStatus(token, id, 'CANCELLED');
}

// ---------- Reviews ----------
export async function getSpaceReviews(spaceId: string | number) {
  const r = await fetch(`${API}/reviews/space/${spaceId}`, { cache: 'no-store' });
  return handle(r);
}

export async function createReview(
  token: string,
  data: { spaceId: number; rating: number; comment?: string },
) {
  const r = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handle(r);
}

// ---------- Favorites ----------
export async function getMyFavorites(token: string) {
  const r = await fetch(`${API}/favorites/me`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(r);
}

export async function toggleFavorite(token: string, spaceId: number) {
  const r = await fetch(`${API}/favorites/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ spaceId }),
  });
  return handle(r);
}

// ---------- Notifications ----------
export async function getMyNotifications(token: string) {
  const r = await fetch(`${API}/notifications/me`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(r);
}

export async function markNotificationRead(token: string, id: number) {
  const r = await fetch(`${API}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handle(r);
}

export async function markAllNotificationsRead(token: string) {
  const r = await fetch(`${API}/notifications/read-all`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handle(r);
}
