import { IsInt, IsString } from 'class-validator';

export class Organization {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsInt()
  serverTs: number;
}
