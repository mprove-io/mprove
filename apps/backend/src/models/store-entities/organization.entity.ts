import { Column, Entity, PrimaryColumn } from 'typeorm';
import { constants } from '~backend/barrels/constants';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryColumn({ type: constants.ORGANIZATION_ID_VARCHAR })
  organization_id: string;

  @Column({ type: constants.VARCHAR })
  name: string;

  @Column({ type: constants.BIGINT })
  server_ts: string;
}
