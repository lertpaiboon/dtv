import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;

    if (!segments || segments.length === 0) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // ป้องกัน Directory Traversal Attack
    const uploadsBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.resolve(uploadsBaseDir, ...segments);

    // ตรวจสอบว่าไฟล์อยู่ภายในไดเรกทอรี public/uploads เท่านั้น
    if (!targetFilePath.startsWith(uploadsBaseDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      const fileStat = await stat(targetFilePath);
      if (!fileStat.isFile()) {
        return new NextResponse('Not Found', { status: 404 });
      }
    } catch {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(targetFilePath);
    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
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

    const uploadsBaseDir = path.resolve(process.cwd(), 'public', 'uploads');
    const targetFilePath = path.resolve(uploadsBaseDir, ...segments);

    if (!targetFilePath.startsWith(uploadsBaseDir)) {
      return new NextResponse(null, { status: 403 });
    }

    try {
      const fileStat = await stat(targetFilePath);
      if (!fileStat.isFile()) {
        return new NextResponse(null, { status: 404 });
      }

      const ext = path.extname(targetFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileStat.size.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
