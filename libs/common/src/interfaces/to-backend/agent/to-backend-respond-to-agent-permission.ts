import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import type { PermissionReply } from 'sandbox-agent';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRespondToAgentPermissionRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  permissionId: string;

  @IsString()
  reply: PermissionReply;
}

export class ToBackendRespondToAgentPermissionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRespondToAgentPermissionRequestPayload)
  payload: ToBackendRespondToAgentPermissionRequestPayload;
}

export class ToBackendRespondToAgentPermissionResponse extends MyResponse {
  payload: { [k in any]: never };
}
