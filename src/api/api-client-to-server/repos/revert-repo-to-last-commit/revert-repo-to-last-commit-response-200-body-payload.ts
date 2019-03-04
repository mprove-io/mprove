import * as apiObjects from '../../../objects/_index';

export interface RevertRepoToLastCommitResponse200BodyPayload {
  deleted_dev_files: apiObjects.CatalogFile[];
  changed_dev_files: apiObjects.CatalogFile[];
  new_dev_files: apiObjects.CatalogFile[];
  dev_struct: apiObjects.Struct;
}
