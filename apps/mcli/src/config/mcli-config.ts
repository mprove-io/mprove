import { IsOptional, IsString } from 'class-validator';

export class McliConfig {
  @IsString()
  mproveCliHost?: string;

  @IsString()
  mproveCliEmail?: string;

  @IsString()
  mproveCliPassword?: string;

  @IsString()
  @IsOptional()
  mproveCliProjectId?: string;

  @IsString()
  @IsOptional()
  mproveCliTestReposPath?: string;

  @IsString()
  @IsOptional()
  mproveCliTestLocalSourceGitUrl?: string;

  @IsString()
  @IsOptional()
  mproveCliTestDevSourceGitUrl?: string;

  @IsString()
  @IsOptional()
  mproveCliTestPublicKeyPath?: string;

  @IsString()
  @IsOptional()
  mproveCliTestPrivateKeyEncryptedPath?: string;

  @IsString()
  @IsOptional()
  mproveCliTestPassPhrase?: string;

  @IsString()
  @IsOptional()
  mproveCliTestDwhPostgresPassword?: string;
}
