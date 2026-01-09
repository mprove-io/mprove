import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyRequest } from './to/my-request';

export class RpcRequestData {
  @ValidateNested()
  @Type(() => MyRequest)
  message: MyRequest;

  @IsString()
  replyTo: string;
}
