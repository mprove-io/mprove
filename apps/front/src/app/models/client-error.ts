import { IsOptional } from 'class-validator';
import { apiToBackend } from '~front/barrels/api-to-backend';

export class ClientError extends Error {
  message: any;

  @IsOptional()
  originalError?: any;

  @IsOptional()
  reqInfoName?: apiToBackend.ToBackendRequestInfoNameEnum;

  @IsOptional()
  reqTraceId?: string;

  @IsOptional()
  reqIdempotencyKey?: string;

  @IsOptional()
  response?: any;

  constructor(item: {
    message: any;
    originalError?: any;
    reqInfoName?: apiToBackend.ToBackendRequestInfoNameEnum;
    reqTraceId?: string;
    reqIdempotencyKey?: string;
    response?: any;
  }) {
    super();

    this.name = item.message;
    this.message = item.message;
    this.originalError = item.originalError;
    this.reqInfoName = item.reqInfoName;
    this.reqTraceId = item.reqTraceId;
    this.reqIdempotencyKey = item.reqIdempotencyKey;
    this.response = item.response;

    console.log(item.response);
  }
}
