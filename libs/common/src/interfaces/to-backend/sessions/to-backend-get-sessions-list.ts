import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetSessionsListRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  currentSessionId?: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @IsNumber()
  archivedLimit?: number;

  @IsOptional()
  @IsNumber()
  archivedLastCreatedTs?: number;
}

export class ToBackendGetSessionsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetSessionsListRequestPayload)
  payload: ToBackendGetSessionsListRequestPayload;
}

export class ToBackendGetSessionsListResponsePayload {
  sessions: SessionApi[];
  hasMoreArchived?: boolean;
}

export class ToBackendGetSessionsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSessionsListResponsePayload)
  payload: ToBackendGetSessionsListResponsePayload;
}
