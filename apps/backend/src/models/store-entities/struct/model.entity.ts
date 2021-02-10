import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('models')
export class ModelEntity {
  @PrimaryColumn({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string; // composite

  @PrimaryColumn({ type: constants.MODEL_ID_VARCHAR })
  model_id: string; // name

  // @Column({ type: constants.MODEL_CONTENT_DATATYPE })
  // content: string;

  // @Column({ type: constants.MODEL_ACCESS_USERS_DATATYPE })
  // access_users: string;

  // @Column({ type: constants.MODEL_LABEL_DATATYPE })
  // label: string;

  // @Column({ type: constants.MODEL_GR_DATATYPE, nullable: true })
  // gr: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // hidden: enums.bEnum;

  // @Column({ type: constants.MODEL_FIELDS_DATATYPE })
  // fields: string;

  // @Column({ type: constants.MODEL_NODES_DATATYPE })
  // nodes: string;

  // @Column({ type: constants.MODEL_DESCRIPTION_DATATYPE, nullable: true })
  // description: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
