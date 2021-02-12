import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('orgs')
export class OrgEntity {
  @Column({ type: constants.USER_ID_VARCHAR })
  owner_id: string; // user_id

  @Column({ type: constants.USER_EMAIL_VARCHAR })
  owner_email: string;

  @PrimaryColumn({ type: constants.ORGANIZATION_ID_VARCHAR })
  organization_id: string;

  @Column({ unique: true, type: constants.VARCHAR })
  name: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
