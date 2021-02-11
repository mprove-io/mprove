import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('mconfigs')
export class MconfigEntity {
  @Column({ type: constants.STRUCT_ID_VARCHAR })
  struct_id: string;

  @Column({ type: constants.QUERY_ID_VARCHAR })
  query_id: string;

  @PrimaryColumn({ type: constants.MCONFIG_ID_VARCHAR })
  mconfig_id: string;

  @Column({ type: constants.MODEL_ID_VARCHAR })
  model_id: string;

  @Column({ type: constants.JSON })
  select: string;

  @Column({ type: constants.JSON })
  sortings: string;

  @Column({ type: constants.JSON })
  sorts: string;

  @Column({ type: constants.VARCHAR })
  timezone: string;

  @Column({ type: constants.INT })
  limit: number;

  @Column({ type: constants.JSON })
  filters: string;

  @Column({ type: constants.JSON })
  charts: string;

  @Column({ type: constants.VARCHAR })
  temp: common.BoolEnum;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
