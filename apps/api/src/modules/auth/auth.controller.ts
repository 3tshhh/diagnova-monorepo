import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordLinkDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from './auth.dto';
import { AuthGuard, RefreshTokenGuard } from '../../shared/guards/auth.guard';
import {
  CurrentPatient,
  logoutJti,
  refreshToken,
} from '../../shared/decorators/auth-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@logoutJti() token: { jti: string; exp: number }) {
    return this.authService.logout(token);
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  refreshTokenEndpoint(
    @refreshToken()
    token: { jti: string; patientId: string; email: string; exp: number },
  ) {
    return this.authService.refreshToken(token);
  }

  @Post('forgot-password-link')
  forgotPasswordLink(@Body() dto: ForgotPasswordLinkDto) {
    return this.authService.forgotPasswordLink(dto);
  }

  @Patch('reset-password/:tokenId')
  resetPassword(
    @Param('tokenId') tokenId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPasswordByToken(tokenId, dto.newPassword);
  }

  @Patch('update-password')
  @UseGuards(AuthGuard)
  updatePassword(
    @CurrentPatient() patient: { id: string },
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(patient.id, dto);
  }
}
