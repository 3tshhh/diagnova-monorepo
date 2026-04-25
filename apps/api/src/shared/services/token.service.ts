import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { getRemainingTTL } from '../utils/common.utils';

@Injectable()
export class TokenService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
  ) {}

  generateToken = (payload: Record<string, unknown>, options: JwtSignOptions) => {
    if (!payload.jti) {
      payload.jti = randomUUID();
    }
    return this.jwtService.sign(payload, options);
  };

  verifyToken = (token: string, options: JwtVerifyOptions) => {
    try {
      return this.jwtService.verify(token, options);
    } catch {
      return null;
    }
  };

  generateAccessRefreshToken = (payload: { patientId: string; email: string }) => {
    const jti = randomUUID();

    const accessToken = this.generateToken(
      { ...payload, jti },
      {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as never,
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );

    const refreshToken = this.generateToken(
      { ...payload, jti },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as never,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    return { accessToken, refreshToken };
  };

  generateResetToken = (payload: { patientId: string; email: string }) => {
    const jti = randomUUID();
    return this.generateToken(
      { ...payload, jti },
      {
        expiresIn: (process.env.JWT_RESET_EXPIRES_IN || '15m') as never,
        secret: process.env.JWT_RESET_SECRET,
      },
    );
  };

  revokeToken = async (jti: string, exp: number): Promise<number> => {
    const remainingTTL = getRemainingTTL(exp);
    await this.cacheManager.set(`blacklisted:${jti}`, 1, remainingTTL);
    return 1;
  };

  checkBlackListed = async (jti: string): Promise<boolean> => {
    const isBlacklisted = await this.cacheManager.get(`blacklisted:${jti}`);
    return !!isBlacklisted;
  };
}
