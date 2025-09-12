import { IsOptional, IsString } from 'class-validator';
import { Connection } from '../backend/connection';

export class ProjectConnection extends Connection {
  @IsOptional()
  serviceAccountCredentials?: any;

  @IsOptional()
  @IsString()
  motherduckToken?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
