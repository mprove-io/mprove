import { IsString } from 'class-validator';

export class Config {
  @IsString()
  mproveCliHost?: string;

  @IsString()
  mproveCliEmail?: string;

  @IsString()
  mproveCliPassword?: string;

  @IsString()
  mproveCliTestReposPath?: string;

  @IsString()
  mproveCliTestGitUrl?: string;

  @IsString()
  mproveCliTestPrivateKeyPath?: string;

  @IsString()
  mproveCliTestPublicKeyPath?: string;

  @IsString()
  mproveCliTestDwhPostgresPassword?: string;
}
