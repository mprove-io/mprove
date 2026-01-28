import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateOrgRequestPayload {
  @IsString()
  orgId: string;
}

export class ToDiskCreateOrgRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateOrgRequestPayload)
  payload: ToDiskCreateOrgRequestPayload;
}

export class ToDiskCreateOrgResponsePayload {
  @IsString()
  orgId: string;
}

export class ToDiskCreateOrgResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateOrgResponsePayload)
  payload: ToDiskCreateOrgResponsePayload;
}
