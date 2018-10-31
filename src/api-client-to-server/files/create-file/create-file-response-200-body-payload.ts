import * as api from '../../../_index';

export interface CreateFileResponse200BodyPayload {
  dev_repo: api.Repo;
  created_dev_file: api.CatalogFile;
}
