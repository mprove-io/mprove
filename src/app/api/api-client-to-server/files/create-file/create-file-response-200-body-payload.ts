import * as apiObjects from '../../../objects/_index';

export interface CreateFileResponse200BodyPayload {
  dev_repo: apiObjects.Repo;
  created_dev_file: apiObjects.CatalogFile;
}
