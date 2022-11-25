import { IsInt, IsString } from 'class-validator';

export class Org {
  @IsString()
  orgId: string;

  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsString()
  ownerEmail: string;

  @IsInt()
  serverTs: number;
}
