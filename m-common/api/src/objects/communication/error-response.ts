import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ResponseInfo } from './response-info';

export class ErrorResponse {
  @ValidateNested()
  @Type(() => ResponseInfo)
  readonly info: ResponseInfo;

  readonly payload: {
    [K in any]: never;
  };
}
