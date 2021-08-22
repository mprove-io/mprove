import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('structs')
export class StructEntity {
  @Column({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string;

  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.VARCHAR })
  week_start: common.ProjectWeekStartEnum;

  @Column({ type: constants.VARCHAR })
  allow_timezones: common.BoolEnum;

  @Column({ type: constants.TIMEZONE_VARCHAR })
  default_timezone: string;

  @Column({ type: constants.JSON })
  errors: common.BmlError[];

  @Column({ type: constants.JSON })
  views: common.View[];

  @Column({ type: constants.JSON })
  udfs_dict: common.UdfsDict;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
