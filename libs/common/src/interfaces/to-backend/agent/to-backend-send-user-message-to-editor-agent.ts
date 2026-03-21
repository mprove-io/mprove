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

export class ToBackendSendUserMessageToEditorAgentRequestPayload {
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

export class ToBackendSendUserMessageToEditorAgentRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendUserMessageToEditorAgentRequestPayload)
  payload: ToBackendSendUserMessageToEditorAgentRequestPayload;
}

export interface ToBackendSendUserMessageToEditorAgentResponsePayload {
  session: SessionApi;
}

export class ToBackendSendUserMessageToEditorAgentResponse extends MyResponse {
  payload: ToBackendSendUserMessageToEditorAgentResponsePayload;
}
