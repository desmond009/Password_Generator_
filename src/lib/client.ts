export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    type ErrorBody = { error?: string } | Record<string, unknown> | null;
    const msg: ErrorBody = await res.json().catch(() => null);
    const message = (msg && typeof msg === 'object' && 'error' in msg && typeof (msg as { error?: string }).error === 'string')
      ? (msg as { error?: string }).error
      : `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function getJson<T>(path: string): Promise<T> {
  return api<T>(path);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function del(path: string): Promise<void> {
  await api(path, { method: 'DELETE' });
}

export async function copyWithAutoClear(text: string, clearAfterMs = 15000): Promise<void> {
  await navigator.clipboard.writeText(text);
  setTimeout(async () => {
    try {
      await navigator.clipboard.writeText('');
    } catch {
      // ignore
    }
  }, clearAfterMs);
}


