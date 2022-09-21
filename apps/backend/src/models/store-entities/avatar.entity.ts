import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('avatars')
export class AvatarEntity {
  @PrimaryColumn({ type: constants.USER_ID_VARCHAR, length: 32 })
  user_id: string;

  @Column({ type: constants.AVATAR_SMALL_MEDIUMTEXT, nullable: true })
  avatar_small: string;

  @Column({ type: constants.AVATAR_BIG_MEDIUMTEXT, nullable: true })
  avatar_big: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
