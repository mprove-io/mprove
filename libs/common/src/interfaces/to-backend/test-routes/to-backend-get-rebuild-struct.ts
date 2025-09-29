import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetRebuildStructRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString()
  overrideTimezone: string;

  @IsBoolean()
  isUseCache: boolean;

  @ValidateNested()
  @Type(() => Model)
  cachedModels: Model[];

  @ValidateNested()
  @Type(() => ModelMetric)
  cachedMetrics: ModelMetric[];
}

export class ToBackendGetRebuildStructRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetRebuildStructRequestPayload)
  payload: ToBackendGetRebuildStructRequestPayload;
}
