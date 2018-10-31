import * as api from '../../../_index';

export interface RevertRepoToProductionResponse200BodyPayload {
  deleted_dev_files: api.CatalogFile[];
  changed_dev_files: api.CatalogFile[];
  new_dev_files: api.CatalogFile[];
  dev_struct: api.Struct;
}
