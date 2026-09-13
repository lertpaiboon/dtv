import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signAdminToken } from '@/lib/auth';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

function clientKey(req: Request, email: string) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return `${forwarded || 'local'}:${email}`;
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

    const now = Date.now();
    const key = clientKey(req, email);
    const current = attempts.get(key);
    const attempt = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + WINDOW_MS }
      : current;

    if (attempt.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: 'เข้าสู่ระบบไม่สำเร็จหลายครั้ง โปรดลองใหม่ในอีก 15 นาที' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((attempt.resetAt - now) / 1000)) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    const isMatch = await comparePassword(password, user?.passwordHash || DUMMY_HASH);

    if (!user || !user.isActive || !isMatch) {
      attempt.count += 1;
      attempts.set(key, attempt);
      return NextResponse.json(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    attempts.delete(key);
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
