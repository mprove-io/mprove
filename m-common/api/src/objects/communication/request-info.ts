import { IsString } from 'class-validator';

export class RequestInfo {
  name: any;

  @IsString()
  traceId: string;
}
