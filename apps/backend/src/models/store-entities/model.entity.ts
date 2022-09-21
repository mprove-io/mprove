import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('models')
export class ModelEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR, length: 32 })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.MODEL_ID_VARCHAR, length: 32 })
  model_id: string; // name

  @Column({ type: constants.VARCHAR, nullable: true })
  connection_id: string;

  @Column({ type: constants.TEXT })
  file_path: string;

  @Column({ type: constants.JSON })
  content: any;

  @Column({ type: constants.JSON })
  access_users: string[];

  @Column({ type: constants.JSON })
  access_roles: string[];

  @Column({ type: constants.VARCHAR })
  label: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  gr: string;

  @Column({ type: constants.VARCHAR })
  hidden: common.BoolEnum;

  @Column({ type: constants.JSON })
  fields: common.ModelField[];

  @Column({ type: constants.JSON })
  nodes: common.ModelNode[];

  @Column({ type: constants.TEXT, nullable: true })
  description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
