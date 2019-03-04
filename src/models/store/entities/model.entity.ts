// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_model')
export class ModelEntity implements ModelInterface {

  @PrimaryColumn({ type: constants.MODEL_ID_DATATYPE })
  model_id: string;


  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;


  @PrimaryColumn({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;


  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;


  @Column({ type: constants.MODEL_CONTENT_DATATYPE })
  content: string;


  @Column({ type: constants.MODEL_ACCESS_USERS_DATATYPE })
  access_users: string;


  @Column({ type: constants.MODEL_LABEL_DATATYPE })
  label: string;


  @Column({ type: constants.MODEL_GR_DATATYPE, nullable: true })
  gr: string;


  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  hidden: enums.bEnum;


  @Column({ type: constants.MODEL_FIELDS_DATATYPE })
  fields: string;


  @Column({ type: constants.MODEL_NODES_DATATYPE })
  nodes: string;


  @Column({ type: constants.MODEL_DESCRIPTION_DATATYPE, nullable: true })
  description: string;


  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface ModelInterface extends api.Model {
  access_users: any;
  fields: any;
  nodes: any;
  hidden: any;
  server_ts: any;
}
