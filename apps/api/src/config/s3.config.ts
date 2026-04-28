import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import multerS3 from 'multer-s3';
import { extname } from 'path';

function getRequiredEnv(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key)?.trim();
  if (!value) {
    throw new InternalServerErrorException(
      `Missing required S3 configuration: ${key}. Set it in apps/api/.env before using file upload or export features.`,
    );
  }
  return value;
}

/**
 * Build an S3Client from env config.
 */
function buildS3Client(configService: ConfigService): S3Client {
  return new S3Client({
    region: configService.get<string>('AWS_REGION', 'eu-north-1'),
    credentials: {
      accessKeyId: getRequiredEnv(configService, 'AWS_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv(configService, 'AWS_SECRET_ACCESS_KEY'),
    },
  });
}

/**
 * Creates a multer-s3 storage engine that streams uploads directly to S3.
 * No files are saved to disk.
 *
 * @param configService – NestJS ConfigService
 * @param folder        – S3 key prefix, e.g. `xrays` or `avatars`
 */
export function createS3Storage(configService: ConfigService, folder: string) {
  const s3 = buildS3Client(configService);
  const bucket = getRequiredEnv(configService, 'AWS_S3_BUCKET');

  return multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => {
      cb(null, { originalName: file.originalname });
    },
    key: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const key = `${folder}/${unique}${extname(file.originalname)}`;
      cb(null, key);
    },
  });
}

/**
 * Injectable service that generates time-limited presigned URLs for S3 objects.
 */
@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = buildS3Client(configService);
    this.bucket = getRequiredEnv(this.configService, 'AWS_S3_BUCKET');
  }

  /**
   * Generate a presigned GET URL for the given S3 key.
   * @param key    – the object key stored in the database
   * @param expiry – TTL in seconds (default 1 hour)
   */
  async getPresignedUrl(key: string, expiry = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiry });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
  }
}
