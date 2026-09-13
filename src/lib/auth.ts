import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function getJwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionUser {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signAdminToken(user: AdminSessionUser): Promise<string> {
  return new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtKey());
}

export async function verifyAdminToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtKey());
    return typeof payload.userId === 'number' ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('dtv_admin_session')?.value;
  if (!token) return null;
  const userId = await verifyAdminToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user?.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: Array.isArray(user.role.permissions)
      ? (user.role.permissions as string[])
      : [],
  };
}

export function hasPermission(user: AdminSessionUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
}
