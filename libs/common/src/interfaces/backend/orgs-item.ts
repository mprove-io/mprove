import { IsString } from 'class-validator';

export class OrgsItem {
  @IsString()
  orgId: string;

  @IsString()
  name: string;
}
