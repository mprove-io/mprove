import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { ErrorsPackError } from './errors-pack-error';

export class ErrorsPack {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @ValidateNested()
  @Type(() => ErrorsPackError)
  errors: ErrorsPackError[];

  @IsInt()
  serverTs: number;
}
