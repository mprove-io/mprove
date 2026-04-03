import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDownloadSkillsRequestPayload {}

export class ToBackendDownloadSkillsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDownloadSkillsRequestPayload)
  payload: ToBackendDownloadSkillsRequestPayload;
}

export class SkillItem {
  @IsString()
  name: string;

  @IsString()
  content: string;
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
