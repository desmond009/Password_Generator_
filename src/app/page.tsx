"use client";

import { useEffect, useMemo, useState } from "react";
import { postJson, getJson, copyWithAutoClear } from "@/lib/client";
import { deriveAesKey, aesGcmEncrypt, aesGcmDecrypt } from "@/lib/crypto";
import { generatePassword } from "@/lib/passwordGen";

type UserInfo = { user: { id: string; email: string; kdfSaltB64: string } | null };

type EncField = { ivB64: string; ctB64: string };
type VaultItem = {
  _id: string;
  title?: EncField;
  username?: EncField;
  password?: EncField;
  url?: EncField;
  notes?: EncField;
  tags?: string[];
};

export default function Home() {
  const [mode, setMode] = useState<"login" | "register" | "vault">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo["user"]>(null);
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getJson<UserInfo>("/api/auth/me").then(async (u) => {
      if (u.user) {
        setUser(u.user);
        setMode("vault");
      }
    });
  }, []);

  async function handleRegister() {
    setError(null);
    try {
      await postJson("/api/auth/register", { email, password });
      const me = await getJson<UserInfo>("/api/auth/me");
      setUser(me.user);
      setMode("vault");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleLogin() {
    setError(null);
    try {
      await postJson("/api/auth/login", { email, password });
      const me = await getJson<UserInfo>("/api/auth/me");
      setUser(me.user);
      setMode("vault");
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    async function setupKey() {
      if (user && password) {
        const key = await deriveAesKey(password, user.kdfSaltB64);
        setAesKey(key);
      }
    }
    setupKey();
  }, [user, password]);

  async function loadItems(tag?: string) {
    const qs = tag ? `?tag=${encodeURIComponent(tag)}` : "";
    const res = await getJson<{ items: VaultItem[] }>(`/api/vault${qs}`);
    setItems(res.items as any);
  }

  useEffect(() => {
    if (mode === "vault" && user) loadItems(filter.trim() || undefined);
  }, [mode, user]);

  useEffect(() => {
    if (mode !== "vault" || !user) return;
    const h = setTimeout(() => {
      loadItems(filter.trim() || undefined);
    }, 300);
    return () => clearTimeout(h);
  }, [filter, mode, user]);

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string>("");

  async function addItem() {
    if (!aesKey) return;
    const payload: any = {
      title: title ? await aesGcmEncrypt(aesKey, title) : undefined,
      username: username ? await aesGcmEncrypt(aesKey, username) : undefined,
      password: pw ? await aesGcmEncrypt(aesKey, pw) : undefined,
      url: url ? await aesGcmEncrypt(aesKey, url) : undefined,
      notes: notes ? await aesGcmEncrypt(aesKey, notes) : undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    };
    await postJson("/api/vault", payload);
    setTitle(""); setUsername(""); setPw(""); setUrl(""); setNotes(""); setTags("");
    await loadItems();
  }

  async function decryptField(field?: EncField): Promise<string> {
    if (!field || !aesKey) return "";
    return aesGcmDecrypt(aesKey, field.ivB64, field.ctB64);
  }

  const filtered = useMemo(() => {
    return items;
  }, [items, filter]);

  function genStrong() {
    const g = generatePassword({ length: 16, lowercase: true, uppercase: true, numbers: true, symbols: true, excludeLookalike: true });
    setPw(g);
  }

  if (mode !== "vault") {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm bg-white dark:bg-neutral-900">
          <div className="flex gap-2 justify-center text-sm mb-4">
            <button className={`px-3 py-1 rounded ${mode==='login'?'bg-black text-white':'border'}`} onClick={() => setMode('login')}>Login</button>
            <button className={`px-3 py-1 rounded ${mode==='register'?'bg-black text-white':'border'}`} onClick={() => setMode('register')}>Register</button>
          </div>
          <div className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full border rounded px-3 py-2" type="password" placeholder="Master password" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button className="w-full bg-black text-white py-2 rounded hover:opacity-90" onClick={mode==='login'?handleLogin:handleRegister}>{mode==='login'?'Login':'Create account'}</button>
            <p className="text-xs text-neutral-500 text-center">Vault encryption happens in your browser. Server never sees plaintext.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Vault</h1>
        </div>
        <div className="flex items-center gap-2">
          <input className="border rounded px-2 py-1 w-56" placeholder="Filter tag" value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className="border rounded px-2 py-1" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-2 py-1" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} />
          <button className="border rounded px-2" onClick={genStrong}>Gen</button>
        </div>
        <input className="border rounded px-2 py-1" placeholder="URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <textarea className="border rounded px-2 py-1 sm:col-span-2 min-h-[72px]" placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
        <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} />
        <button className="bg-black text-white py-2 rounded sm:col-span-2 hover:opacity-90 transition" onClick={addItem}>Add</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((it) => (
          <VaultRow key={it._id} item={it} onChanged={() => loadItems(filter.trim() || undefined)} onCopyPassword={async (text: string) => { await copyWithAutoClear(text); setToast("Password copied"); setTimeout(()=>setToast(null), 1500); }} decrypt={decryptField} />
        ))}
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 px-3 py-2 rounded bg-black text-white text-sm shadow">
          {toast}
        </div>
      )}
    </div>
  );
}

function VaultRow({ item, onChanged, decrypt, onCopyPassword }: { item: any; onChanged: () => Promise<void>; decrypt: (f?: EncField) => Promise<string>; onCopyPassword: (t: string) => Promise<void>; }) {
  const [title, setTitle] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      setTitle(await decrypt(item.title));
      setUsername(await decrypt(item.username));
      setPassword(await decrypt(item.password));
      setUrl(await decrypt(item.url));
      setNotes(await decrypt(item.notes));
    })();
  }, [item]);

  async function remove() {
    await fetch(`/api/vault?id=${item._id}`, { method: 'DELETE' });
    await onChanged();
  }

  return (
    <div className="p-4 border rounded-lg bg-white/5 dark:bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium truncate max-w-[60%]">{title || "(no title)"}</div>
        <div className="flex gap-2">
          <button className="text-sm underline" onClick={() => setExpanded(v=>!v)}>{expanded?"Hide":"Show"}</button>
          <button className="text-sm text-red-600" onClick={remove}>Delete</button>
        </div>
      </div>
      {expanded && (
        <div className="grid gap-2 text-sm">
          <div>User: {username}</div>
          <div className="flex items-center gap-2">Pass: <input className="border rounded px-2 py-0.5" value={password} onChange={e=>setPassword(e.target.value)} /> <button className="border rounded px-2 py-0.5" onClick={()=>onCopyPassword(password)}>Copy</button></div>
          <div>URL: {url}</div>
          <div>Notes: {notes}</div>
        </div>
      )}
    </div>
  );
}

