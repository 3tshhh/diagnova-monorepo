import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CaseType } from '../../patient-case/patient-case.entity';

export class CreateCaseDto {
  @IsEnum(CaseType)
  case_type!: CaseType;

  @IsOptional()
  @IsString()
  clinic_description?: string;
}
