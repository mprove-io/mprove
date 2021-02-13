import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteOrgRequestPayload {
  @IsString()
  orgId: string;
}

export class ToDiskDeleteOrgRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrgRequestPayload)
  payload: ToDiskDeleteOrgRequestPayload;
}

export class ToDiskDeleteOrgResponsePayload {
  @IsString()
  deletedOrgId: string;
}

export class ToDiskDeleteOrgResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrgResponsePayload)
  payload: ToDiskDeleteOrgResponsePayload;
}
