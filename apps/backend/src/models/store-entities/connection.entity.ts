import { Column, Entity, PrimaryColumn } from 'typeorm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';

@Entity('connections')
export class ConnectionEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.CONNECTION_ID_VARCHAR })
  connection_id: string; // name

  @Column({ type: constants.VARCHAR })
  type: common.ConnectionTypeEnum;

  @Column({ type: constants.INT, nullable: true })
  bigquery_query_size_limit_gb: number;

  @Column({ type: constants.JSON, nullable: true })
  bigquery_credentials: any;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_project: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_client_email: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  account: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  host: string;

  @Column({ type: constants.INT, nullable: true })
  port: number;

  @Column({ type: constants.VARCHAR, nullable: true })
  database: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  username: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  password: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  is_ssl: common.BoolEnum;

  //

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
