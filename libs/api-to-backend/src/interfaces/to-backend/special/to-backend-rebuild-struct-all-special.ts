import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRebuildStructAllSpecialRequestPayload {
  @IsString()
  specialKey: string;
}

export class ToBackendRebuildStructAllSpecialRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRebuildStructAllSpecialRequestPayload)
  payload: ToBackendRebuildStructAllSpecialRequestPayload;
}

export class ToBackendRebuildStructAllSpecialResponsePayload {
  @IsString({ each: true })
  notFoundProjectIds: string[];

  @IsString({ each: true })
  successProjectIds: string[];

  @IsString({ each: true })
  getCatalogErrorProjectIds: string[];
}

export class ToBackendRebuildStructAllSpecialResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRebuildStructAllSpecialResponsePayload)
  payload: ToBackendRebuildStructAllSpecialResponsePayload;
}
