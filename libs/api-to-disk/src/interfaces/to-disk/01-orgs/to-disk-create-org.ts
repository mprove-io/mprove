import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateOrgRequestPayload {
  @IsString()
  readonly orgId: string;
}

export class ToDiskCreateOrgRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateOrgRequestPayload)
  readonly payload: ToDiskCreateOrgRequestPayload;
}

export class ToDiskCreateOrgResponsePayload {
  @IsString()
  readonly orgId: string;
}

export class ToDiskCreateOrgResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateOrgResponsePayload)
  readonly payload: ToDiskCreateOrgResponsePayload;
}
