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

  // bigquery

  @Column({ type: constants.INT, nullable: true })
  bigquery_query_size_limit_gb: number;

  @Column({ type: constants.JSON, nullable: true })
  bigquery_credentials: any;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_project: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  bigquery_client_email: string;

  // postgres

  @Column({ type: constants.VARCHAR, nullable: true })
  postgres_host: string;

  @Column({ type: constants.INT, nullable: true })
  postgres_port: number;

  @Column({ type: constants.VARCHAR, nullable: true })
  postgres_database: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  postgres_user: string;

  @Column({ type: constants.VARCHAR, nullable: true })
  postgres_password: string;

  //

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
