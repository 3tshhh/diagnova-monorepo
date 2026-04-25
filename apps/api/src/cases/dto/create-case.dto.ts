import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { CaseType } from '../../modules/patient-case/patient-case.entity';

export class CreateCaseDto {
  @IsEnum(CaseType)
  case_type!: CaseType;

  @IsString()
  @IsNotEmpty()
  clinic_description!: string;
}
