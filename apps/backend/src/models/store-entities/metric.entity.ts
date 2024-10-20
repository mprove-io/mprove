import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('metrics')
export class MetricEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.METRIC_ID_VARCHAR, length: 128 })
  metric_id: string; // name

  @Column({ type: constants.VARCHAR })
  top_node: string;

  @Column({ type: constants.VARCHAR })
  part_id: string;

  @Column({ type: constants.TEXT })
  file_path: string;

  @Column({ type: constants.VARCHAR })
  type: common.MetricTypeEnum;

  @Column({ type: constants.VARCHAR })
  label: string;

  @Column({ type: constants.VARCHAR })
  top_label: string;

  @Column({ type: constants.VARCHAR })
  part_node_label: string;

  @Column({ type: constants.VARCHAR })
  part_field_label: string;

  @Column({ type: constants.VARCHAR })
  part_label: string;

  @Column({ type: constants.VARCHAR })
  time_node_label: string;

  @Column({ type: constants.VARCHAR })
  time_field_label: string;

  @Column({ type: constants.VARCHAR })
  time_label: string;

  @Column({ type: constants.JSON })
  params: any[];

  @Column({ type: constants.VARCHAR, nullable: true })
  model_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  timefield_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  field_id: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  field_class: common.FieldClassEnum;

  @Column({ type: constants.VARCHAR, nullable: true })
  api_id: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  formula: string;

  @Column({ type: constants.MEDIUMTEXT, nullable: true })
  sql: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  connection_id: string;

  @Column({ type: constants.TEXT, nullable: true })
  description: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  format_number: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  currency_prefix: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  currency_suffix: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
