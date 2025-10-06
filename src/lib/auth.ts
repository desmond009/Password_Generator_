import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "pm_session";
const JWT_ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionJwt(payload: Record<string, unknown>, expiresInSeconds: number): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
  return token;
}

export async function readSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId as string | undefined;
    if (!userId) return null;
    return { userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, maxAgeSeconds: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}


