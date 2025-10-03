import { IsInt, IsOptional, IsString } from 'class-validator';

export class ConnectionOptionsBigquery {
  @IsOptional()
  serviceAccountCredentials: any;

  @IsOptional()
  @IsString()
  googleCloudProject: string;

  @IsOptional()
  @IsString()
  googleCloudClientEmail: string;

  @IsOptional()
  @IsInt()
  bigqueryQuerySizeLimitGb: number;
}
