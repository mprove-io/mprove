import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class BranchItem {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class ToBackendSpecialRebuildStructsRequestPayload {
  @IsString()
  specialKey: string;

  @IsString({ each: true })
  userIds: string[];
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
  @Type(() => BranchItem)
  successBranchItems: BranchItem[];

  @IsNumber()
  successTotal: number;

  @ValidateNested()
  @Type(() => BranchItem)
  errorGetCatalogBranchItems: BranchItem[];

  @IsNumber()
  errorTotal: number;
}

export class ToBackendSpecialRebuildStructsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructsResponsePayload)
  payload: ToBackendSpecialRebuildStructsResponsePayload;
}
