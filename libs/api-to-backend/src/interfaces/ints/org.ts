import { IsInt, IsString } from 'class-validator';

export class Org {
  @IsString()
  orgId: string;

  @IsString()
  name: string;

  @IsInt()
  serverTs: number;
}
