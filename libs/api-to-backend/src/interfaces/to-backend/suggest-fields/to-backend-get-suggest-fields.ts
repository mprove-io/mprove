import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetSuggestFieldsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetSuggestFieldsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetSuggestFieldsRequestPayload)
  payload: ToBackendGetSuggestFieldsRequestPayload;
}

export class ToBackendGetSuggestFieldsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.SuggestField)
  suggestFields: common.SuggestField[];
}

export class ToBackendGetSuggestFieldsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSuggestFieldsResponsePayload)
  payload: ToBackendGetSuggestFieldsResponsePayload;
}
