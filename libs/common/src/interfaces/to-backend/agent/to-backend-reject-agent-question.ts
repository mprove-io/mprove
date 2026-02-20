import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRejectAgentQuestionRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  questionId: string;
}

export class ToBackendRejectAgentQuestionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRejectAgentQuestionRequestPayload)
  payload: ToBackendRejectAgentQuestionRequestPayload;
}

export class ToBackendRejectAgentQuestionResponse extends MyResponse {
  payload: { [k in any]: never };
}
