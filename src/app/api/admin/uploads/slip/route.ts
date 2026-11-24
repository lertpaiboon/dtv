import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { detectAllowedFileType, generateSafeFileName } from '@/lib/upload-security';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const canUploadSlip =
    hasPermission(session, '*') ||
    hasPermission(session, 'pnd51:edit') ||
    hasPermission(session, 'pnd51:create') ||
    hasPermission(session, 'wht:edit') ||
    hasPermission(session, 'wht:create') ||
    hasPermission(session, 'vat:edit') ||
    hasPermission(session, 'vat:create');

  if (!canUploadSlip) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: คุณไม่มีสิทธิ์ในการอัปโหลดหลักฐานการโอนเงินภาษี' },
      { status: 403 }
    );
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detected = detectAllowedFileType(buffer, ALLOWED_MIME_TYPES);
    if (!detected) {
      return NextResponse.json(
        { success: false, error: 'เนื้อหาไฟล์ไม่ตรงกับรูปแบบ JPG, PNG, WEBP หรือ PDF ที่ปลอดภัย' },
        { status: 400 }
      );
    }

    const uniqueFileName = generateSafeFileName('slip', detected.ext);

    // บันทึกไฟล์ใน storage/uploads/slips นอก public/ เพื่อป้องกันการเปิดอ่านโดยตรงผ่าน Web Server
    const uploadDir = path.join(process.cwd(), 'storage', 'uploads', 'slips');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/slips/${uniqueFileName}`;
    const originalName = 'name' in file ? (file as File).name : uniqueFileName;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: originalName,
        size: file.size,
        mimeType: detected.mime,
      },
      message: 'อัปโหลดหลักฐานการโอนเงินเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Error uploading slip file:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกไฟล์สลิป' }, { status: 500 });
  }
}
