// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '../../../barrels/constants';

@Entity('m_chunk')
export class ChunkEntity {

  @PrimaryColumn({ type: constants.CHUNK_ID_DATATYPE })
  chunk_id: string;

  @Column({ type: constants.CHUNK_CONTENT })
  content: string;

  @Column({ type: constants.SESSION_ID_DATATYPE, nullable: true })
  source_session_id: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}
