import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCloneTestRepoRequestPayload {
  @IsString()
  testId: string;
}

export class ToDiskCloneTestRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCloneTestRepoRequestPayload)
  payload: ToDiskCloneTestRepoRequestPayload;
}

export class ToDiskCloneTestRepoResponse extends MyResponse {
  payload: { [k in any]: never };
}
