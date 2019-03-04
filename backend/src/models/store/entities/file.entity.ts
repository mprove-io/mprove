// tslint:disable:variable-name
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { enums } from '../../../barrels/enums';

@Entity('m_file')
export class FileEntity implements CatalogFileInterface {
  @PrimaryColumn({ type: constants.FILE_ABSOLUTE_ID_DATATYPE })
  file_absolute_id: string;

  @Column({ type: constants.FILE_ID_DATATYPE })
  file_id: string;

  @Column({ type: constants.PROJECT_ID_DATATYPE })
  project_id: string;

  @Column({ type: constants.REPO_ID_DATATYPE })
  repo_id: string;

  @Column({ type: constants.FILE_PATH_DATATYPE })
  path: string;

  @Column({ type: constants.FILE_NAME_DATATYPE })
  name: string;

  @Column({ type: constants.FILE_CONTENT_DATATYPE })
  content: string;

  @Column({ type: constants.ENUM_TO_VARCHAR_DATATYPE })
  deleted: enums.bEnum;

  @Column({ type: constants.TS_TO_BIGINT_DATATYPE })
  server_ts: string;
}

interface CatalogFileInterface {
  file_absolute_id: string;
  file_id: api.CatalogFile['file_id'];
  project_id: api.CatalogFile['project_id'];
  repo_id: api.CatalogFile['repo_id'];
  path: string; // string[];
  server_ts: string; // number
  // deleted: flag is for api only
}
