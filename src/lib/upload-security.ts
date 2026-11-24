import crypto from 'node:crypto';

export interface DetectedUploadType {
  mime: string;
  ext: string;
}

/**
 * Inspects file magic bytes so client-supplied MIME types cannot spoof executable/HTML uploads.
 */
export function detectAllowedFileType(
  buffer: Buffer,
  allowedMimes: ReadonlySet<string>
): DetectedUploadType | null {
  if (!buffer || buffer.length === 0) return null;

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return allowedMimes.has('image/jpeg') ? { mime: 'image/jpeg', ext: '.jpg' } : null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return allowedMimes.has('image/png') ? { mime: 'image/png', ext: '.png' } : null;
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return allowedMimes.has('image/webp') ? { mime: 'image/webp', ext: '.webp' } : null;
  }

  // PDF: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return allowedMimes.has('application/pdf') ? { mime: 'application/pdf', ext: '.pdf' } : null;
  }

  return null;
}

export function generateSafeFileName(prefix: string, ext: string): string {
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, '') || 'file';
  const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
  return `${safePrefix}_${Date.now()}_${crypto.randomUUID()}${safeExt}`;
}
