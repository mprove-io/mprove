import { entities } from '~backend/barrels/entities';

export function makeAvatar(item: {
  userId: string;
  avatarSmall: string;
  avatarBig: string;
}) {
  let avatarEntity: entities.AvatarEntity = {
    user_id: item.userId,
    avatar_small: item.avatarSmall,
    avatar_big: item.avatarBig,
    server_ts: undefined
  };
  return avatarEntity;
}
