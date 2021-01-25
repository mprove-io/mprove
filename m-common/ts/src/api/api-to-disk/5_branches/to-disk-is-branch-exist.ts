import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';

export class ToDiskIsBranchExistRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsBoolean()
  readonly isRemote: boolean;
}

export class ToDiskIsBranchExistRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskIsBranchExistRequestPayload)
  readonly payload: ToDiskIsBranchExistRequestPayload;
}

export class ToDiskIsBranchExistResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsBoolean()
  readonly isRemote: boolean;

  @IsBoolean()
  readonly isBranchExist: boolean;
}

export class ToDiskIsBranchExistResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskIsBranchExistResponsePayload)
  readonly payload: ToDiskIsBranchExistResponsePayload;
}
