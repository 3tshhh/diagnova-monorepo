import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { CasesService } from '../modules/cases/cases.service';

class CompleteDiagnosisDto {
  @IsOptional()
  @IsString()
  finding?: string;

  @IsOptional()
  @IsString()
  error?: string;
}
// 
@Controller('internal')
export class InternalController {
  constructor(private readonly casesService: CasesService) {}
//  /internal/diagnosis/:diagnosisId/complete
  @Post('diagnosis/:diagnosisId/complete')
  @HttpCode(200)
  async completeDiagnosis(
    @Param('diagnosisId') diagnosisId: string,
    @Body() body: CompleteDiagnosisDto,
    @Headers('x-internal-key') internalKey: string,
  ) {
    const expectedKey = process.env.INTERNAL_SECRET;
    if (!internalKey || !expectedKey || internalKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal key');
    }

    await this.casesService.completeDiagnosis(
      diagnosisId,
      body.finding,
      body.error,
    );
    return { ok: true };
  }
}
//python will call /internal/diagnosis/:diagnosisId/complete with x-internal-key header and body containing either finding or error