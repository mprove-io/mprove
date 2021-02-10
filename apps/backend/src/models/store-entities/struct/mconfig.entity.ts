import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('mconfigs')
export class MconfigEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.QUERY_ID_VARCHAR })
  query_id: string;

  @PrimaryColumn({ type: constants.MCONFIG_ID_VARCHAR })
  mconfig_id: string;

  // @Column({ type: constants.REPO_ID_DATATYPE })
  // repo_id: string;

  // @Column({ type: constants.MODEL_ID_DATATYPE })
  // model_id: string;

  // @Column({ type: constants.MCONFIG_SELECT_DATATYPE })
  // select: string;

  // @Column({ type: constants.MCONFIG_SORTINGS_DATATYPE })
  // sortings: string;

  // @Column({ type: constants.MCONFIG_SORTS_DATATYPE, nullable: true })
  // sorts: string;

  // @Column({ type: constants.MCONFIG_TIMEZONE_DATATYPE })
  // timezone: string;

  // @Column({ type: constants.MCONFIG_LIMIT_DATATYPE })
  // limit: number;

  // @Column({ type: constants.MCONFIG_FILTERS_DATATYPE })
  // filters: string;

  // @Column({ type: constants.MCONFIG_CHARTS_DATATYPE })
  // charts: string;

  // @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  // temp: enums.bEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
