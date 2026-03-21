import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateAgentExplorerSessionRequestPayload {
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

export class ToBackendCreateAgentExplorerSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentExplorerSessionRequestPayload)
  payload: ToBackendCreateAgentExplorerSessionRequestPayload;
}

export class ToBackendCreateAgentExplorerSessionResponsePayload {
  @IsString()
  sessionId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendCreateAgentExplorerSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentExplorerSessionResponsePayload)
  payload: ToBackendCreateAgentExplorerSessionResponsePayload;
}
