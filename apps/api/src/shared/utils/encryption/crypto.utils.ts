import crypto from 'node:crypto';

const getSecretBuffer = () => {
  const secret = process.env.ENCRYPTION_SECRET_KEY || '';
  const key = Buffer.from(secret);
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be exactly 32 bytes for AES-256-GCM');
  }
  return key;
};

export const encrypt = (
  text: string,
  ENCRYPTION_SECRET_KEY: Buffer = getSecretBuffer(),
  IV_LENGTH: number = parseInt(process.env.IV_LENGTH || '12', 10),
) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_SECRET_KEY, iv);

  let encryptedData = cipher.update(text, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${encryptedData}:${authTag}`;
};

export const decrypt = (
  encryptedData: string,
  ENCRYPTION_SECRET_KEY: Buffer = getSecretBuffer(),
) => {
  const [iv, encryptedText, authTag] = encryptedData.split(':');
  if (!iv || !encryptedText || !authTag) {
    throw new Error('Invalid encrypted payload format');
  }
  const binaryLikeIv = Buffer.from(iv, 'hex');
  const tag = Buffer.from(authTag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_SECRET_KEY, binaryLikeIv);
  decipher.setAuthTag(tag);

  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf-8');

  return decryptedData;
};
