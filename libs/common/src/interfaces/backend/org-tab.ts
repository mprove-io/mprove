import { IsString } from 'class-validator';

export class OrgTab {
  @IsString()
  name: string;

  @IsString()
  ownerEmail: string;
}
