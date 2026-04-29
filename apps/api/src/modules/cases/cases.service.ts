import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  PatientCase,
  CaseType,
} from '../patient-case/patient-case.entity';
import {
  Diagnosis,
  DiagnosisStatus,
} from '../diagnosis/diagnosis.entity';
import { Patient } from '../patient/patient.entity';
import { SseService } from '../../sse/sse.service';
import { S3Service } from '../../config/s3.config';

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    @InjectRepository(PatientCase)
    private readonly caseRepo: Repository<PatientCase>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepo: Repository<Diagnosis>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly sseService: SseService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Replaces the raw S3 key in `xrayUrl` with a time-limited presigned URL.
   */
  private async attachPresignedUrl(
    patientCase: PatientCase,
  ): Promise<PatientCase> {
    patientCase.xrayUrl = await this.s3Service.getPresignedUrl(
      patientCase.xrayUrl,
    );
    return patientCase;
  }

  async createCase(
    patient: Patient,
    caseType: CaseType,
    clinicDescription: string | undefined,
    xrayKey: string,
  ) {
    const patientCase = this.caseRepo.create({
      patient,
      caseType,
      clinicDescription,
      xrayUrl: xrayKey, // store S3 key, not a full URL
    });
    const savedCase = await this.caseRepo.save(patientCase);

    const diagnosis = this.diagnosisRepo.create({
      patientCase: savedCase,
      status: DiagnosisStatus.PENDING,
      finding: null,
    });
    const savedDiagnosis = await this.diagnosisRepo.save(diagnosis);

    // Generate a presigned URL for the FastAPI service to download the image
    const presignedImageUrl = await this.s3Service.getPresignedUrl(xrayKey);

    void this.dispatchToFastAPI(
      savedDiagnosis.id,
      caseType,
      presignedImageUrl,
    ).catch((err: Error) => {
      this.logger.error(
        `FastAPI dispatch failed for diagnosis ${savedDiagnosis.id}: ${err.message}`,
      );
    });

    return {
      case_id: savedCase.id,
      diagnosis_id: savedDiagnosis.id,
      status: DiagnosisStatus.PENDING,
    };
  }

  async getMyCases(patientId: string): Promise<PatientCase[]> {
    const cases = await this.caseRepo.find({
      where: { patient: { id: patientId } },
      relations: ['diagnoses'],
      order: { createdAt: 'DESC' },
    });

    // Attach presigned URLs to every case before returning
    await Promise.all(cases.map((c) => this.attachPresignedUrl(c)));
    return cases;
  }

  async getCase(caseId: string, patientId: string): Promise<PatientCase> {
    const patientCase = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['patient', 'diagnoses'],
    });

    if (!patientCase) throw new NotFoundException('Case not found');
    if (patientCase.patient.id !== patientId)
      throw new ForbiddenException('Access denied');

    patientCase.diagnoses.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    await this.attachPresignedUrl(patientCase);
    return patientCase;
  }

  async rerunDiagnosis(
    caseId: string,
    patientId: string,
  ): Promise<{ diagnosis_id: string; status: DiagnosisStatus }> {
    const patientCase = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['patient'],
    });

    if (!patientCase) throw new NotFoundException('Case not found');
    if (patientCase.patient.id !== patientId)
      throw new ForbiddenException('Access denied');

    const diagnosis = this.diagnosisRepo.create({
      patientCase,
      status: DiagnosisStatus.PENDING,
      finding: null,
    });
    const savedDiagnosis = await this.diagnosisRepo.save(diagnosis);

    // Generate a fresh presigned URL for the AI service
    const presignedImageUrl = await this.s3Service.getPresignedUrl(
      patientCase.xrayUrl,
    );

    void this.dispatchToFastAPI(
      savedDiagnosis.id,
      patientCase.caseType,
      presignedImageUrl,
    ).catch((err: Error) => {
      this.logger.error(
        `FastAPI dispatch failed for diagnosis ${savedDiagnosis.id}: ${err.message}`,
      );
    });

    return {
      diagnosis_id: savedDiagnosis.id,
      status: DiagnosisStatus.PENDING,
    };
  }

  async exportCase(caseId: string, patientId: string): Promise<string> {
    const patientCase = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['patient', 'diagnoses'],
    });

    if (!patientCase) throw new NotFoundException('Case not found');
    if (patientCase.patient.id !== patientId)
      throw new ForbiddenException('Access denied');

    // Generate a presigned URL for the export report
    const presignedUrl = await this.s3Service.getPresignedUrl(
      patientCase.xrayUrl,
    );

    const sorted = [...patientCase.diagnoses].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const lines: string[] = [
      `Patient:             ${patientCase.patient.fullName ?? patientCase.patient.email}`,
      `Case Type:           ${patientCase.caseType}`,
      `Clinic Description:  ${patientCase.clinicDescription ?? 'N/A'}`,
      `X-Ray URL:           ${presignedUrl}`,
      '',
      'Diagnoses:',
    ];

    for (const d of sorted) {
      lines.push(
        `  [${d.createdAt.toISOString()}]  status=${d.status}  finding=${d.finding ?? 'N/A'}`,
      );
    }

    return lines.join('\n');
  }

  async completeDiagnosis(
    diagnosisId: string,
    finding?: string,
    error?: string,
  ): Promise<void> {
    const diagnosis = await this.diagnosisRepo.findOne({
      where: { id: diagnosisId },
    });
    if (!diagnosis) throw new NotFoundException('Diagnosis not found');

    if (finding !== undefined) {
      diagnosis.status = DiagnosisStatus.DONE;
      diagnosis.finding = finding;
    } else {
      diagnosis.status = DiagnosisStatus.FAILED;
      diagnosis.finding = error ?? null;
    }

    await this.diagnosisRepo.save(diagnosis);
    this.sseService.emit(diagnosisId, {
      status: diagnosis.status,
      finding: diagnosis.finding,
    });
  }

  private async dispatchToFastAPI(
    diagnosisId: string,
    caseType: CaseType,
    imageUrl: string,
  ): Promise<void> {
    const fastapiUrl =
      this.configService.get<string>('FASTAPI_URL') ?? 'http://fastapi:8000';
    const baseUrl =
      this.configService.get<string>('BASE_URL') ??
      this.configService.get<string>('APP_BASE_URL') ??
      'http://localhost:3000';
    const internalSecret =
      this.configService.get<string>('INTERNAL_SECRET') ?? '';

    const callbackUrl = `${baseUrl}/api/internal/diagnosis/${diagnosisId}/complete`;

    this.logger.log(
      `Dispatching to FastAPI — diagnosisId=${diagnosisId} caseType=${caseType} fastapiUrl=${fastapiUrl} callbackUrl=${callbackUrl}`,
    );

    try {
      await this.httpService.axiosRef.post(
        `${fastapiUrl}/analyze`,
        {
          diagnosis_id: diagnosisId,
          case_type: caseType,
          image_url: imageUrl,
          callback_url: callbackUrl,
        },
        { headers: { 'x-internal-key': internalSecret } },
      );
      this.logger.log(`Dispatch succeeded — diagnosisId=${diagnosisId}`);
    } catch (error) {
      this.logger.error(
        `Dispatch failed — diagnosisId=${diagnosisId} error=${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
