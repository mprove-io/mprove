import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('idemps')
export class IdempEntity {
  @PrimaryColumn({ type: constants.IDEMPOTENCY_KEY_VARCHAR })
  idempotency_key: string;

  @PrimaryColumn({ type: constants.USER_ID_VARCHAR })
  user_id: string;

  @Column({ type: constants.MEDIUMTEXT })
  request: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  response: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
