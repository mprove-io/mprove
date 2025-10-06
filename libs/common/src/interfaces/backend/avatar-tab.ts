import { IsString } from 'class-validator';

export class AvatarTab {
  @IsString()
  avatarBig: string;

  @IsString()
  avatarSmall: string;
}
