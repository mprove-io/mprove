import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('connections')
export class ConnectionEntity {
  @PrimaryColumn({ type: constants.PROJECT_ID_VARCHAR })
  project_id: string; // composite

  @PrimaryColumn({ type: constants.CONNECTION_ID_VARCHAR })
  connection_id: string; // name

  @Column({ type: constants.VARCHAR })
  type: string;

  @Column({ type: constants.VARCHAR })
  bigquery_project: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
