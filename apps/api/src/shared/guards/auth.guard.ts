import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { PatientService } from '../../modules/patient/patient.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly patientService: PatientService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];
    if (!accessToken) throw new UnauthorizedException('please login');

    const [bearer, token] = String(accessToken).split(' ');
    if (!token) throw new UnauthorizedException('please login');

    if (bearer !== (process.env.JWT_PREFIX || 'Bearer')) {
      throw new BadRequestException('invalid token');
    }

    const verifiedToken = this.tokenService.verifyToken(token, {
      secret: process.env.JWT_ACCESS_SECRET as string,
    });
    if (!verifiedToken) throw new UnauthorizedException('please login');

    const isBlacklisted = await this.tokenService.checkBlackListed(
      (verifiedToken as { jti: string }).jti,
    );
    if (isBlacklisted) throw new UnauthorizedException('please login');

    const patientId = (verifiedToken as { patientId: string }).patientId;
    const patient = await this.patientService.findById(patientId);
    if (!patient) throw new UnauthorizedException('Patient no longer exists');

    request.loggedInPatient = {
      verifiedToken,
      patient,
    };

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly patientService: PatientService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['authorization-refresh'];

    if (!refreshToken) throw new UnauthorizedException('please login');

    const [bearer, token] = String(refreshToken).split(' ');
    if (!token || bearer !== (process.env.JWT_PREFIX || 'Bearer')) {
      throw new UnauthorizedException('Invalid token');
    }

    const verifiedRefreshToken = this.tokenService.verifyToken(token, {
      secret: process.env.JWT_REFRESH_SECRET as string,
    });
    if (!verifiedRefreshToken) {
      throw new UnauthorizedException('Invalid session, please login again');
    }

    const data = verifiedRefreshToken as { jti: string; patientId: string };

    const [isBlacklisted, patient] = await Promise.all([
      this.tokenService.checkBlackListed(data.jti),
      this.patientService.findById(data.patientId),
    ]);

    if (isBlacklisted || !patient) {
      throw new UnauthorizedException('Invalid session, please login again');
    }

    request.loggedInPatient = { verifiedToken: verifiedRefreshToken, patient };
    return true;
  }
}
