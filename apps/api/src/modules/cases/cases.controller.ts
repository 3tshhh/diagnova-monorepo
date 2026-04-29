import {
  BadRequestException,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Query,
  Res,
  Sse,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { AuthGuard } from '../../shared/guards';
import { CurrentPatient } from '../../shared/decorators';
import { TokenService } from '../../shared/services/token.service';
import { Patient } from '../patient/patient.entity';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { SseService } from '../../sse/sse.service';
import { createS3Storage } from '../../config/s3.config';

@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly tokenService: TokenService,
    private readonly sseService: SseService,
    // private readonly configService: ConfigService, // not currently needed in controller, only in S3Service
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('xray', {
      storage: createS3Storage(
        new ConfigService(),
        (req) => `xrays/${req.body?.case_type ?? 'unknown'}`,
      ),
    }),
  )
  async createCase(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() dto: CreateCaseDto,
    @CurrentPatient() patient: Patient,
  ) {
    if (!file) throw new BadRequestException('xray file is required');

    // Store only the S3 object key – presigned URLs are generated on read
    return this.casesService.createCase(
      patient,
      dto.case_type,
      dto.clinic_description,
      file.key,
    );
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyCases(@CurrentPatient() patient: Patient) {
    return this.casesService.getMyCases(patient.id);
  }

  @Get(':caseId/export')
  @UseGuards(AuthGuard)
  async exportCase(
    @Param('caseId') caseId: string,
    @CurrentPatient() patient: Patient,
    @Res() res: Response,
  ) {
    const report = await this.casesService.exportCase(caseId, patient.id);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(report);
  }

  @Sse(':caseId/stream/:diagnosisId')
  streamDiagnosis(
    @Param('caseId') _caseId: string,
    @Param('diagnosisId') diagnosisId: string,
    @Query('token') token: string,
  ): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException('Token query param required');

    const verified = this.tokenService.verifyToken(token, {
      secret: process.env.JWT_ACCESS_SECRET as string,
    });
    if (!verified) throw new UnauthorizedException('Invalid or expired token');

    return this.sseService.getStream(diagnosisId);
  }

  @Get(':caseId')
  @UseGuards(AuthGuard)
  getCase(
    @Param('caseId') caseId: string,
    @CurrentPatient() patient: Patient,
  ) {
    return this.casesService.getCase(caseId, patient.id);
  }

  @Post(':caseId/rerun')
  @UseGuards(AuthGuard)
  rerunDiagnosis(
    @Param('caseId') caseId: string,
    @CurrentPatient() patient: Patient,
  ) {
    return this.casesService.rerunDiagnosis(caseId, patient.id);
  }
}
