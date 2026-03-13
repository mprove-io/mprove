import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetConnectionSampleRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsString()
  schemaName: string;

  @IsString()
  tableName: string;

  @IsOptional()
  @IsString()
  columnName?: string;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class ToBackendGetConnectionSampleRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionSampleRequestPayload)
  payload: ToBackendGetConnectionSampleRequestPayload;
}

export class ToBackendGetConnectionSampleResponsePayload {
  columnNames: string[];

  rows: string[][];
}

export class ToBackendGetConnectionSampleResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionSampleResponsePayload)
  payload: ToBackendGetConnectionSampleResponsePayload;
}
