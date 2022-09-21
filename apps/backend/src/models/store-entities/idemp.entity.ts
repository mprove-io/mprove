import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('idemps')
export class IdempEntity {
  @PrimaryColumn({ type: constants.IDEMPOTENCY_KEY_VARCHAR })
  idempotency_key: string;

  @PrimaryColumn({ type: constants.USER_ID_VARCHAR, length: 32 })
  user_id: string;

  @Column({ type: constants.JSON })
  req: any;

  @Column({ type: constants.JSON, nullable: true })
  resp: any;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
