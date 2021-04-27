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

  @IsString()
  companySize: string;

  @IsString()
  contactPhone: string;

  @IsInt()
  serverTs: number;
}
