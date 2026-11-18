import crypto from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v1:';
const IV_BYTE_LENGTH = 12;
const AUTH_TAG_BYTE_LENGTH = 16;

function getDerivedAesKey(): Buffer {
  const rawSecret =
    process.env.SETTINGS_ENCRYPTION_KEY?.trim() || process.env.JWT_SECRET?.trim() || '';

  let baseMaterial = rawSecret;
  if (!baseMaterial || baseMaterial.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SETTINGS_ENCRYPTION_KEY or JWT_SECRET must be set to at least 32 characters in production.'
      );
    }
    baseMaterial = 'dev-only-jwt-secret-change-in-production-32chars';
  }

  const keyBytes = crypto.hkdfSync(
    'sha256',
    Buffer.from(baseMaterial, 'utf8'),
    Buffer.from('deethavorn-system-settings-salt', 'utf8'),
    Buffer.from('aes-256-gcm:system-settings:v1', 'utf8'),
    32
  );

  return Buffer.from(keyBytes);
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(ENCRYPTION_PREFIX);
}

/**
 * Encrypts sensitive configuration strings using AES-256-GCM before storing in `system_settings`.
 */
export function encryptSecret(plaintext: string): string {
  const key = getDerivedAesKey();
  const iv = crypto.randomBytes(IV_BYTE_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

/**
 * Decrypts an `enc:v1:...` payload, or returns legacy plaintext unchanged for backward compatibility.
 */
export function decryptSecret(storedValue: string | null | undefined): string | null {
  if (!storedValue || !storedValue.trim()) return null;
  const trimmed = storedValue.trim();

  if (!isEncryptedSecret(trimmed)) {
    return trimmed;
  }

  const payload = trimmed.slice(ENCRYPTION_PREFIX.length);
  const parts = payload.split(':');
  if (parts.length !== 3) return null;

  try {
    const iv = Buffer.from(parts[0], 'base64url');
    const authTag = Buffer.from(parts[1], 'base64url');
    const ciphertext = Buffer.from(parts[2], 'base64url');

    if (iv.length !== IV_BYTE_LENGTH || authTag.length !== AUTH_TAG_BYTE_LENGTH) {
      return null;
    }

    const key = getDerivedAesKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}
