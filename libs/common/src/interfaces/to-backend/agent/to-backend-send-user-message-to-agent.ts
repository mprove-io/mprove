import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSendUserMessageToAgentRequestPayload {
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

  @IsOptional()
  @IsString()
  agent?: string;

  @IsOptional()
  @IsString()
  permissionId?: string;

  @IsOptional()
  @IsString()
  reply?: string;

  @IsOptional()
  @IsString()
  questionId?: string;

  @IsOptional()
  @IsArray()
  answers?: string[][];
}

export class ToBackendSendUserMessageToAgentRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendUserMessageToAgentRequestPayload)
  payload: ToBackendSendUserMessageToAgentRequestPayload;
}

export interface ToBackendSendUserMessageToAgentResponsePayload {
  session: SessionApi;
}

export class ToBackendSendUserMessageToAgentResponse extends MyResponse {
  payload: ToBackendSendUserMessageToAgentResponsePayload;
}
