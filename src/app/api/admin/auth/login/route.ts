import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signAdminToken } from '@/lib/auth';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_IP_EMAIL_ATTEMPTS = 5;
const MAX_EMAIL_ATTEMPTS = 10;
const MAX_TRACKED_KEYS = 2000;
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

type Attempt = { count: number; resetAt: number };
const ipEmailAttempts = new Map<string, Attempt>();
const emailAttempts = new Map<string, Attempt>();

function extractClientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 64);
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim();
  return (forwarded || 'local').slice(0, 64);
}

function pruneMapIfFull(map: Map<string, Attempt>, now: number) {
  if (map.size < MAX_TRACKED_KEYS) return;
  for (const [k, v] of map.entries()) {
    if (v.resetAt <= now) map.delete(k);
  }
  while (map.size >= MAX_TRACKED_KEYS) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
}

function getActiveAttempt(map: Map<string, Attempt>, key: string, now: number): Attempt | null {
  const current = map.get(key);
  if (!current || current.resetAt <= now) {
    if (current) map.delete(key);
    return null;
  }
  return current;
}

function recordFailedAttempt(map: Map<string, Attempt>, key: string, now: number) {
  pruneMapIfFull(map, now);
  const current = map.get(key);
  if (!current || current.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    current.count += 1;
    map.set(key, current);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const now = Date.now();
    const ip = extractClientIp(req);
    const ipEmailKey = `${ip}:${email}`;

    if (isDev) {
      ipEmailAttempts.delete(ipEmailKey);
      emailAttempts.delete(email);
    } else {
      const ipAttempt = getActiveAttempt(ipEmailAttempts, ipEmailKey, now);
      const acctAttempt = getActiveAttempt(emailAttempts, email, now);

      if (
        (ipAttempt && ipAttempt.count >= MAX_IP_EMAIL_ATTEMPTS) ||
        (acctAttempt && acctAttempt.count >= MAX_EMAIL_ATTEMPTS)
      ) {
        const retryResetAt = Math.max(ipAttempt?.resetAt || 0, acctAttempt?.resetAt || 0);
        return NextResponse.json(
          { success: false, error: 'เข้าสู่ระบบไม่สำเร็จหลายครั้ง โปรดลองใหม่ในอีก 15 นาที' },
          { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((retryResetAt - now) / 1000))) } }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    const isMatch = await comparePassword(password, user?.passwordHash || DUMMY_HASH);

    if (!user || !user.isActive || !isMatch) {
      if (!isDev) {
        recordFailedAttempt(ipEmailAttempts, ipEmailKey, now);
        recordFailedAttempt(emailAttempts, email, now);
      }
      return NextResponse.json(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    ipEmailAttempts.delete(ipEmailKey);
    emailAttempts.delete(email);
    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: Array.isArray(user.role.permissions)
        ? (user.role.permissions as string[])
        : [],
    };
    const token = await signAdminToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });

    response.cookies.set({
      name: 'dtv_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ โปรดลองอีกครั้ง' },
      { status: 500 }
    );
  }
}
