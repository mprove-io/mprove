import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class BridgeItem {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  structId: string;

  @IsBoolean()
  needValidate: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class ToBackendSpecialRebuildStructsRequestPayload {
  @IsString()
  specialKey: string;

  @IsString({ each: true })
  userIds: string[];

  @IsBoolean()
  skipRebuild: boolean;
}

export class ToBackendSpecialRebuildStructsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructsRequestPayload)
  payload: ToBackendSpecialRebuildStructsRequestPayload;
}

export class ToBackendSpecialRebuildStructsResponsePayload {
  @IsString({ each: true })
  notFoundProjectIds: string[];

  @ValidateNested()
  @Type(() => BridgeItem)
  successBridgeItems: BridgeItem[];

  @IsNumber()
  successTotal: number;

  @ValidateNested()
  @Type(() => BridgeItem)
  errorGetCatalogBridgeItems: BridgeItem[];

  @IsNumber()
  errorTotal: number;
}

export class ToBackendSpecialRebuildStructsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructsResponsePayload)
  payload: ToBackendSpecialRebuildStructsResponsePayload;
}
