import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateTempMconfigAndQueryRequestPayload {
  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;

  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;
}

export class ToBackendCreateTempMconfigAndQueryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigAndQueryRequestPayload)
  payload: ToBackendCreateTempMconfigAndQueryRequestPayload;
}

export class ToBackendCreateTempMconfigAndQueryResponsePayload {
  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;

  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;
}

export class ToBackendCreateTempMconfigAndQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigAndQueryResponsePayload)
  payload: ToBackendCreateTempMconfigAndQueryResponsePayload;
}
