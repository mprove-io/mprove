import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSpecialRebuildStructsRequestPayload {
  @IsString()
  specialKey: string;
}

export class ToBackendSpecialRebuildStructsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructsRequestPayload)
  payload: ToBackendSpecialRebuildStructsRequestPayload;
}

export class ToBackendSpecialRebuildStructsResponsePayload {
  @IsString({ each: true })
  notFoundProjectIds: string[];

  @IsString({ each: true })
  successProjectIds: string[];

  @IsString({ each: true })
  getCatalogErrorProjectIds: string[];
}

export class ToBackendSpecialRebuildStructsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructsResponsePayload)
  payload: ToBackendSpecialRebuildStructsResponsePayload;
}
