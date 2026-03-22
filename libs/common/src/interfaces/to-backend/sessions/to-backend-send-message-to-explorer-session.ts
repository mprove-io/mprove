import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSendMessageToExplorerSessionRequestPayload {
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

export class ToBackendSendMessageToExplorerSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendMessageToExplorerSessionRequestPayload)
  payload: ToBackendSendMessageToExplorerSessionRequestPayload;
}

export interface ToBackendSendMessageToExplorerSessionResponsePayload {
  session: SessionApi;
}

export class ToBackendSendMessageToExplorerSessionResponse extends MyResponse {
  payload: ToBackendSendMessageToExplorerSessionResponsePayload;
}
