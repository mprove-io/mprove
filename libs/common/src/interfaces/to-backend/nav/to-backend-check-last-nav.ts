import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCheckLastNavRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsString()
  chartId?: string;

  @IsOptional()
  @IsString()
  dashboardId?: string;

  @IsOptional()
  @IsString()
  reportId?: string;
}

export class ToBackendCheckLastNavRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCheckLastNavRequestPayload)
  payload: ToBackendCheckLastNavRequestPayload;
}

export class ToBackendCheckLastNavResponsePayload {
  @IsBoolean()
  modelExists: boolean;

  @IsBoolean()
  chartExists: boolean;

  @IsBoolean()
  dashboardExists: boolean;

  @IsBoolean()
  reportExists: boolean;
}

export class ToBackendCheckLastNavResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCheckLastNavResponsePayload)
  payload: ToBackendCheckLastNavResponsePayload;
}
