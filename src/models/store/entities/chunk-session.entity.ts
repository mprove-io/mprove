// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_chunk_session')
export class ChunkSessionEntity {
  @PrimaryColumn({ type: constants.CHUNK_ID_DATATYPE })
  chunk_id: string;

  @PrimaryColumn({ type: constants.SESSION_ID_DATATYPE })
  session_id: string;
}
