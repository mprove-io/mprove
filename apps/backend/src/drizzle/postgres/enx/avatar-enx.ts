import { IsString } from 'class-validator';
import { AvatarEnt } from '../schema/avatars';

export interface AvatarEnx extends Omit<AvatarEnt, 'st' | 'lt'> {
  st: AvatarSt;
  lt: AvatarLt;
}

export class AvatarSt {
  @IsString()
  avatarSmall: string;
}

export class AvatarLt {
  @IsString()
  avatarBig: string;
}
