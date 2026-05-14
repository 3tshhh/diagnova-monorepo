import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const AVATAR_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAvatar {
  b64: string;
  contentType: string;
}

@Injectable()
export class TeamService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getAvatar(username: string): Promise<{ buffer: Buffer; contentType: string }> {
    const key = `team:avatar:${username}`;
    const cached = await this.cache.get<CachedAvatar>(key);
    if (cached) {
      return { buffer: Buffer.from(cached.b64, 'base64'), contentType: cached.contentType };
    }

    const res = await fetch(`https://unavatar.io/linkedin/user:${encodeURIComponent(username)}`);
    if (!res.ok) throw new NotFoundException('Avatar not found');

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';

    await this.cache.set(key, { b64: buffer.toString('base64'), contentType }, AVATAR_TTL_MS);
    return { buffer, contentType };
  }
}
