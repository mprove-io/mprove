import * as api from '../../_index';

export interface FilesCreateFileResponse200BodyPayload {
  dev_repo: api.Repo;
  created_dev_file: api.CatalogFile;
}
