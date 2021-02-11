import { Column, Entity, PrimaryColumn } from 'typeorm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('models')
export class ModelEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.MODEL_ID_VARCHAR })
  model_id: string; // name

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
  fields: apiToBlockml.ModelField[];

  @Column({ type: constants.JSON })
  nodes: apiToBlockml.ModelNode[];

  @Column({ type: constants.TEXT, nullable: true })
  description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
