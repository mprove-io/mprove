// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_member')
export class MemberEntity implements MemberInterface {
  @PrimaryColumn({ type: constants.MEMBER_ID_DATATYPE })
  member_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.MEMBER_ALIAS_DATATYPE, nullable: true })
  alias: string;

  @Column({ type: constants.MEMBER_FIRST_NAME_DATATYPE, nullable: true })
  first_name: string;

  @Column({ type: constants.MEMBER_LAST_NAME_DATATYPE, nullable: true })
  last_name: string;

  @Column({ type: constants.MEMBER_PICTURE_URL_SMALL_DATATYPE, nullable: true })
  picture_url_small: string;

  @Column({ type: constants.MEMBER_PICTURE_URL_BIG_DATATYPE, nullable: true })
  picture_url_big: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  status: api.UserStatusEnum; // MemberStatusEnum

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_editor: enums.bEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  is_admin: enums.bEnum;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  deleted: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface MemberInterface extends api.Member {
  status: any;
  is_editor: any;
  is_admin: any;
  deleted: any;
  server_ts: any;
}
