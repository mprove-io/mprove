import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateSessionExplorerRequestPayload {
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

export class ToBackendCreateSessionExplorerRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionExplorerRequestPayload)
  payload: ToBackendCreateSessionExplorerRequestPayload;
}

export class ToBackendCreateSessionExplorerResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendCreateSessionExplorerResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionExplorerResponsePayload)
  payload: ToBackendCreateSessionExplorerResponsePayload;
}
