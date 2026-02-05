import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRespondToAgentQuestionRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  questionId: string;

  @IsArray()
  answers: string[][];
}

export class ToBackendRespondToAgentQuestionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRespondToAgentQuestionRequestPayload)
  payload: ToBackendRespondToAgentQuestionRequestPayload;
}

export class ToBackendRespondToAgentQuestionResponse extends MyResponse {
  payload: { [k in any]: never };
}
