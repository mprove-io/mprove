import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MproveValidationErrorLine } from './mprove-validation-error-line';

export class MproveValidationError {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => MproveValidationErrorLine)
  lines: MproveValidationErrorLine[];
}
