import * as apiObjects from '../../../objects/_index';

export interface PullRepoResponse200BodyPayload {
  deleted_dev_files: apiObjects.CatalogFile[];
  changed_dev_files: apiObjects.CatalogFile[];
  new_dev_files: apiObjects.CatalogFile[];
  dev_struct_or_empty: apiObjects.Struct[];
}
