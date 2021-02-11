import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('orgs')
export class OrgEntity {
  @PrimaryColumn({ type: constants.ORGANIZATION_ID_VARCHAR })
  organization_id: string;

  @Column({ unique: true, type: constants.VARCHAR })
  name: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
