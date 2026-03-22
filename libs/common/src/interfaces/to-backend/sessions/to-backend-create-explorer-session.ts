import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateExplorerSessionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  provider: string;

  @IsString()
  model: string;

  @IsString()
  variant: string;

  @IsString()
  initialBranch: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsString()
  messageId: string;

  @IsString()
  partId: string;
}

export class ToBackendCreateExplorerSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateExplorerSessionRequestPayload)
  payload: ToBackendCreateExplorerSessionRequestPayload;
}

export class ToBackendCreateExplorerSessionResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendCreateExplorerSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateExplorerSessionResponsePayload)
  payload: ToBackendCreateExplorerSessionResponsePayload;
}
