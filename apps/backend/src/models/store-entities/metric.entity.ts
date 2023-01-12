import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('metrics')
export class MetricEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.METRIC_ID_VARCHAR, length: 32 })
  metric_id: string; // name

  @Column({ type: constants.VARCHAR })
  type: common.MetricTypeEnum;

  @Column({ type: constants.JSON })
  fixed_parameters: any;

  @Column({ type: constants.VARCHAR, nullable: true })
  model_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  field_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  timefield_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  api_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  timespec: common.TimeSpecEnum;

  @Column({ type: constants.JSON, nullable: true })
  entries: common.TimeData[];

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  formula: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  sql: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  connection_id: string;

  // @Column({ type: constants.JSON })
  // access_users: string[];

  // @Column({ type: constants.JSON })
  // access_roles: string[];

  @Column({ type: constants.VARCHAR })
  label: string;

  // @Column({ type: constants.VARCHAR, nullable: true })
  // gr: string;

  @Column({ type: constants.VARCHAR })
  hidden: common.BoolEnum;

  @Column({ type: constants.TEXT, nullable: true })
  description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
