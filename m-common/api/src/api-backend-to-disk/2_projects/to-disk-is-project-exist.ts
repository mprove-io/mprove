import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';

export class ToDiskIsProjectExistRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskIsProjectExistRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskIsProjectExistRequestPayload)
  readonly payload: ToDiskIsProjectExistRequestPayload;
}

export class ToDiskIsProjectExistResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsBoolean()
  readonly isProjectExist: boolean;
}

export class ToDiskIsProjectExistResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskIsProjectExistResponsePayload)
  readonly payload: ToDiskIsProjectExistResponsePayload;
}
