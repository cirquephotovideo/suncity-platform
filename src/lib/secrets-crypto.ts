/**
 * AES-256-GCM encryption for AdminSecret.value.
 * The key is derived from NEXTAUTH_SECRET via SHA-256.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';

function getDerivedKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext string.
 * @returns  Base64-encoded string: iv(12):authTag(16):ciphertext
 */
export function encryptSecret(plain: string): string {
  const key = getDerivedKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

/**
 * Decrypt a value produced by encryptSecret().
 */
export function decryptSecret(encrypted: string): string {
  const key = getDerivedKey();
  const buf = Buffer.from(encrypted, 'base64');
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
