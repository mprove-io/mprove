import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('reps')
export class RepEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.REP_ID_VARCHAR, length: 64 })
  rep_id: string; // name

  @Column({ type: constants.TEXT })
  file_path: string;

  @Column({ type: constants.VARCHAR })
  title: string;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  timezone: string;

  @Column({ type: constants.VARCHAR })
  time_spec: common.TimeSpecEnum;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  time_range: string;

  @Column({ type: constants.JSON })
  rows: common.Row[];

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
