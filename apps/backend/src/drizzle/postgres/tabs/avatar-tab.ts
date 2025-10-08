import { AvatarEnt } from '../schema/avatars';

export interface AvatarTab
  extends Omit<AvatarEnt, 'st' | 'lt'>,
    AvatarSt,
    AvatarLt {}

export class AvatarSt {
  avatarSmall: string;
}

export class AvatarLt {
  avatarBig: string;
}
