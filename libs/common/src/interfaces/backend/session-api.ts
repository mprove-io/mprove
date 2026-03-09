import { IsInt, IsOptional, IsString } from 'class-validator';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';

export class SessionApi {
  @IsString()
  sessionId: string;

  @IsString()
  provider: string;

  @IsString()
  agent: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  lastMessageProviderModel?: string;

  @IsOptional()
  @IsString()
  lastMessageVariant?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  archiveReason?: ArchiveReasonEnum;

  @IsOptional()
  @IsString()
  pauseReason?: PauseReasonEnum;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  initialBranch: string;

  @IsOptional()
  @IsString()
  initialCommit?: string;

  @IsInt()
  createdTs: number;

  @IsInt()
  lastActivityTs: number;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
