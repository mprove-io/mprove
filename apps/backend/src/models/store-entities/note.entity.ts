import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('notes')
export class NoteEntity {
  @PrimaryColumn({ type: constants.NOTE_ID_VARCHAR, length: 32 })
  note_id: string;

  @Column({ type: constants.TEXT })
  public_key: string;

  @Column({ type: constants.TEXT })
  private_key: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
