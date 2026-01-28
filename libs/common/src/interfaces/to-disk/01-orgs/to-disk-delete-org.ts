import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

export class ToDiskDeleteOrgResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteOrgResponsePayload)
  payload: ToDiskDeleteOrgResponsePayload;
}
