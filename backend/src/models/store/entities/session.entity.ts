// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_session')
export class SessionEntity {
  @PrimaryColumn({ type: constants.SESSION_ID_DATATYPE })
  session_id: string;

  @Column({ type: constants.USER_ID_DATATYPE })
  user_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_activated: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE, nullable: true })
  last_pong_ts: string;

  @Column({ type: constants.SESSION_LIVE_QUERIES_DATATYPE, nullable: true })
  live_queries: string;
}
