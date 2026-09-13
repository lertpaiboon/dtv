import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 5 MB) - ขนาดปัจจุบัน ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: `ประเภทไฟล์ไม่ถูกต้อง (${mimeType}) อนุญาตเฉพาะไฟล์ JPG, PNG, WEBP หรือ PDF เท่านั้น` },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXT[mimeType] || '.jpg';
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `slip_${timestamp}_${randomPart}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/slips/${uniqueFileName}`;
    const originalName = 'name' in file ? (file as File).name : uniqueFileName;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: originalName,
        size: file.size,
        mimeType,
      },
      message: 'อัปโหลดหลักฐานการโอนเงินเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Error uploading slip file:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกไฟล์สลิป' }, { status: 500 });
  }
}
