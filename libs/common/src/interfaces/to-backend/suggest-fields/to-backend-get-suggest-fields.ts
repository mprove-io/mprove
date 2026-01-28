import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { Member } from '#common/interfaces/backend/member';
import { StructX } from '#common/interfaces/backend/struct-x';
import { SuggestField } from '#common/interfaces/backend/suggest-field';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetSuggestFieldsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  parentId: string;

  @IsEnum(MconfigParentTypeEnum)
  parentType: MconfigParentTypeEnum;
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
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => SuggestField)
  suggestFields: SuggestField[];
}

export class ToBackendGetSuggestFieldsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSuggestFieldsResponsePayload)
  payload: ToBackendGetSuggestFieldsResponsePayload;
}
