import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SkillItem } from '#common/interfaces/backend/skill-item';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDownloadSkillsRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendDownloadSkillsResponsePayload {
  @ValidateNested()
  @Type(() => SkillItem)
  skillItems: SkillItem[];
}

export class ToBackendDownloadSkillsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDownloadSkillsResponsePayload)
  payload: ToBackendDownloadSkillsResponsePayload;
}
