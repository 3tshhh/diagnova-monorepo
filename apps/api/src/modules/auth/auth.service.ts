import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { PatientService } from '../patient/patient.service';
import { S3Service } from '../../config/s3.config';
import { TokenService } from '../../shared/services/token.service';
import {
  compareHash,
  decrypt,
  encrypt,
  generateHash,
  sendEmail,
} from '../../shared/utils';
import {
  DeleteAccountDto,
  ForgotPasswordLinkDto,
  LoginDto,
  RegisterDto,
  UpdatePasswordDto,
} from './auth.dto';
import { getRemainingTTL } from '../../shared/utils/common.utils';
import { CaseType } from '../patient-case/patient-case.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly patientService: PatientService,
    private readonly s3Service: S3Service,
    private readonly tokenService: TokenService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.patientService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Patient already exists');
    }

    const passwordHash = generateHash(dto.password);

    const patient = await this.patientService.createPatient({
      email,
      passwordHash,
      fullName: dto.fullName,
    });

    const tokens = this.tokenService.generateAccessRefreshToken({
      patientId: patient.id,
      email: patient.email,
    });

    return {
      message: 'registered successfully',
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const patient = await this.patientService.findByEmail(email);
    if (!patient) {
      throw new NotFoundException('Patient does not exist');
    }

    const isValid = compareHash(dto.password, patient.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.tokenService.generateAccessRefreshToken({
      patientId: patient.id,
      email: patient.email,
    });
  }

  async logout(token: { jti: string; exp: number }) {
    return this.tokenService.revokeToken(token.jti, token.exp);
  }

  async refreshToken(token: {
    jti: string;
    patientId: string;
    email: string;
    exp: number;
  }) {
    await this.tokenService.revokeToken(token.jti, token.exp);

    return this.tokenService.generateAccessRefreshToken({
      patientId: token.patientId,
      email: token.email,
    });
  }

  async forgotPasswordLink(dto: ForgotPasswordLinkDto) {
    const email = dto.email.toLowerCase().trim();
    const patient = await this.patientService.findByEmail(email);

    if (!patient) {
      return {
        message:
          'If this email exists, a reset link will be sent shortly',
      };
    }

    const tokenId = randomUUID();
    const resetToken = this.tokenService.generateResetToken({
      patientId: patient.id,
      email: patient.email,
    });

    const verifiedResetToken = this.tokenService.verifyToken(resetToken, {
      secret: process.env.JWT_RESET_SECRET as string,
    }) as { exp: number } | null;

    if (!verifiedResetToken) {
      throw new BadRequestException('Unable to generate reset token');
    }

    const encryptedJwt = encrypt(resetToken);
    const ttl = getRemainingTTL(verifiedResetToken.exp);

    await this.cacheManager.set(`pwd-reset:${tokenId}`, encryptedJwt, ttl);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${tokenId}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      template: `
        <p>Hello,</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    return {
      message: 'If this email exists, a reset link will be sent shortly',
    };
  }

  async resetPasswordByToken(tokenId: string, newPassword: string) {
    const redisKey = `pwd-reset:${tokenId}`;
    const encryptedJwt = await this.cacheManager.get<string>(redisKey);
    if (!encryptedJwt) {
      throw new UnauthorizedException('Invalid or expired reset token id');
    }

    let jwtToken: string;
    try {
      jwtToken = decrypt(encryptedJwt);
    } catch {
      throw new UnauthorizedException('Corrupted reset token');
    }

    const verified = this.tokenService.verifyToken(jwtToken, {
      secret: process.env.JWT_RESET_SECRET as string,
    }) as { patientId: string; email: string } | null;

    if (!verified) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const patient = await this.patientService.findById(verified.patientId);
    if (!patient || patient.email !== verified.email) {
      throw new UnauthorizedException('Invalid reset token subject');
    }

    const isSamePassword = compareHash(newPassword, patient.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    await this.patientService.updatePasswordHash(
      patient.id,
      generateHash(newPassword),
    );
    await this.cacheManager.del(redisKey);

    return { message: 'password reset successfully' };
  }

  async deleteAccount(patientId: string, dto: DeleteAccountDto) {
    const patient = await this.patientService.findByIdWithCases(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    if (patient.email !== dto.email.toLowerCase().trim()) {
      throw new BadRequestException('Email does not match');
    }

    // Delete all S3 objects by prefix so untracked files are also removed.
    // New key format: xrays/{case_type}/{patientId}{uuid}.ext  /  avatars/{patientId}{uuid}.ext
    const prefixDeletions = [
      ...Object.values(CaseType).map((ct) =>
        this.s3Service.deleteAllByPrefix(`xrays/${ct}/${patientId}`),
      ),
      this.s3Service.deleteAllByPrefix(`avatars/${patientId}`),
    ];
    await Promise.allSettled(prefixDeletions);

    await this.patientService.deletePatientAccount(patientId);

    return { message: 'Account deleted successfully' };
  }

  async updatePassword(patientId: string, dto: UpdatePasswordDto) {
    const patient = await this.patientService.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const oldMatch = compareHash(dto.oldPassword, patient.passwordHash);
    if (!oldMatch) {
      throw new UnauthorizedException('Invalid old password');
    }

    const newSameAsOld = compareHash(dto.newPassword, patient.passwordHash);
    if (newSameAsOld) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    await this.patientService.updatePasswordHash(
      patient.id,
      generateHash(dto.newPassword),
    );

    return { message: 'password updated successfully' };
  }
}
