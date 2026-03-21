import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSendUserMessageToExplorerAgentRequestPayload {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  partId?: string;

  @IsEnum(InteractionTypeEnum)
  interactionType: InteractionTypeEnum;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  variant?: string;
}

export class ToBackendSendUserMessageToExplorerAgentRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendUserMessageToExplorerAgentRequestPayload)
  payload: ToBackendSendUserMessageToExplorerAgentRequestPayload;
}

export interface ToBackendSendUserMessageToExplorerAgentResponsePayload {
  session: SessionApi;
}

export class ToBackendSendUserMessageToExplorerAgentResponse extends MyResponse {
  payload: ToBackendSendUserMessageToExplorerAgentResponsePayload;
}
