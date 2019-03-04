// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_repo')
export class RepoEntity implements RepoInterface {
  @PrimaryColumn({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @PrimaryColumn({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.STRUCT_ID_DATATYPE })
  struct_id: string;

  @Column({ type: constants.REPO_UDFS_CONTENT_DATATYPE })
  udfs_content: string;

  @Column({ type: constants.REPO_PDTS_SORTED_DATATYPE })
  pdts_sorted: string; // string[];

  @Column({ type: constants.REPO_NODES_DATATYPE })
  nodes: string; // CatalogNode[];

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  status: api.RepoStatusEnum;

  @Column({ type: constants.REPO_CONFLICTS_DATATYPE })
  conflicts: string; // FileLine[];

  @Column({ type: constants.REPO_REMOTE_URL_DATATYPE, nullable: true })
  remote_url: string;

  @Column({ type: constants.REPO_REMOTE_WEBHOOK_DATATYPE, nullable: true })
  remote_webhook: string;

  @Column({ type: constants.REPO_REMOTE_PUBLIC_KEY_DATATYPE, nullable: true })
  remote_public_key: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  remote_last_push_ts: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  remote_push_access_is_ok: enums.bEnum;

  @Column({ type: constants.REPO_PUSH_ERROR_MESSAGE_DATATYPE, nullable: true })
  remote_push_error_message: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  remote_need_manual_pull: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  remote_last_pull_ts: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  remote_pull_access_is_ok: enums.bEnum;

  @Column({ type: constants.REPO_PULL_ERROR_MESSAGE_DATATYPE, nullable: true })
  remote_pull_error_message: string;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface RepoInterface extends api.Repo {
  pdts_sorted: any;
  nodes: any;
  conflicts: any;
  remote_push_access_is_ok: any;
  remote_need_manual_pull: any;
  remote_pull_access_is_ok: any;
  remote_last_push_ts: any;
  remote_last_pull_ts: any;
  server_ts: any;
}
