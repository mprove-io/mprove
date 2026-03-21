import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSendMessageToSessionExplorerRequestPayload {
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

export class ToBackendSendMessageToSessionExplorerRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendMessageToSessionExplorerRequestPayload)
  payload: ToBackendSendMessageToSessionExplorerRequestPayload;
}

export interface ToBackendSendMessageToSessionExplorerResponsePayload {
  session: SessionApi;
}

export class ToBackendSendMessageToSessionExplorerResponse extends MyResponse {
  payload: ToBackendSendMessageToSessionExplorerResponsePayload;
}
