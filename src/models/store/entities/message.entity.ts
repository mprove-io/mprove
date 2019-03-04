// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_message')
export class MessageEntity {

  @PrimaryColumn({ type: constants.MESSAGE_ID_DATATYPE })
  message_id: string;

  @Column({ type: constants.MESSAGE_CONTENT })
  content: string;

  @Column({ type: constants.SESSION_ID_DATATYPE })
  session_id: string;

  @Column({ type: constants.CHUNK_ID_DATATYPE })
  chunk_id: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_confirmed: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}
