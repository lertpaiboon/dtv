import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getAdminSession, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// รองรับนามสกุลไฟล์สื่อหลักทั้งหมด
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

/**
 * ป้องกัน Directory Traversal Attack โดยตรวจสอบว่า target อยู่ภายใต้ baseDir จริงๆ
 */
function resolveSafePath(baseDir: string, segments: string[]): string | null {
  const resolvedBase = path.resolve(baseDir);
  const targetPath = path.resolve(resolvedBase, ...segments);
  const normalizedBase = resolvedBase.endsWith(path.sep) ? resolvedBase : resolvedBase + path.sep;

  if (targetPath !== resolvedBase && !targetPath.startsWith(normalizedBase)) {
    return null;
  }
  return targetPath;
}

/**
 * ค้นหาไฟล์ตามลำดับ: ตรวจสอบใน storage/uploads ก่อน (สำหรับ private slips)
 * หากไม่พบจึงตรวจสอบใน public/uploads (สำหรับ public assets หรือ slips เดิม)
 */
async function findUploadedFile(segments: string[]): Promise<{ filePath: string; isSlip: boolean } | null> {
  const isSlip = segments[0] === 'slips';

  // ถ้าเป็น slip ให้ค้นหาใน storage/uploads/slips ก่อน
  if (isSlip) {
    const storageDir = path.resolve(process.cwd(), 'storage', 'uploads');
    const storagePath = resolveSafePath(storageDir, segments);
    if (storagePath) {
      try {
        const fileStat = await stat(storagePath);
        if (fileStat.isFile()) {
          return { filePath: storagePath, isSlip: true };
        }
      } catch {
        // Fallback to public/uploads
      }
    }
  }

  // ค้นหาใน public/uploads
  const publicDir = path.resolve(process.cwd(), 'public', 'uploads');
  const publicPath = resolveSafePath(publicDir, segments);
  if (!publicPath) {
    return null;
  }

  try {
    const fileStat = await stat(publicPath);
    if (fileStat.isFile()) {
      return { filePath: publicPath, isSlip };
    }
  } catch {
    return null;
  }

  return null;
}

async function verifySlipAccess(): Promise<{ authorized: boolean; status: number; error: string }> {
  const session = await getAdminSession();
  if (!session) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: กรุณาเข้าสู่ระบบก่อนเข้าถึงเอกสารสลิปหลักฐานการโอนเงิน',
    };
  }

  const canView =
    hasPermission(session, '*') ||
    hasPermission(session, 'pnd51:view') ||
    hasPermission(session, 'wht:view') ||
    hasPermission(session, 'vat:view');

  if (!canView) {
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: คุณไม่มีสิทธิ์เข้าถึงเอกสารสลิปหลักฐานการโอนเงิน',
    };
  }

  return { authorized: true, status: 200, error: '' };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;

    if (!segments || segments.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const isSlip = segments[0] === 'slips';

    // ถ้าเป็นสลิปโอนเงินภาษี ต้องยืนยันตัวตนและตรวจสิทธิ์ RBAC เสมอ
    if (isSlip) {
      const authResult = await verifySlipAccess();
      if (!authResult.authorized) {
        return new NextResponse(authResult.error, {
          status: authResult.status,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          },
        });
      }
    }

    const fileResult = await findUploadedFile(segments);
    if (!fileResult) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(fileResult.filePath);
    const ext = path.extname(fileResult.filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.byteLength.toString(),
      'X-Content-Type-Options': 'nosniff',
    };

    if (fileResult.isSlip) {
      // ป้องกันการ Cache สลิปของลูกค้าบน Browser หรือ Shared CDN Cache อย่างเด็ดขาด
      headers['Cache-Control'] = 'private, no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const isSlip = segments[0] === 'slips';

    if (isSlip) {
      const authResult = await verifySlipAccess();
      if (!authResult.authorized) {
        return new NextResponse(null, {
          status: authResult.status,
          headers: {
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          },
        });
      }
    }

    const fileResult = await findUploadedFile(segments);
    if (!fileResult) {
      return new NextResponse(null, { status: 404 });
    }

    const fileStat = await stat(fileResult.filePath);
    const ext = path.extname(fileResult.filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileStat.size.toString(),
      'X-Content-Type-Options': 'nosniff',
    };

    if (fileResult.isSlip) {
      headers['Cache-Control'] = 'private, no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
