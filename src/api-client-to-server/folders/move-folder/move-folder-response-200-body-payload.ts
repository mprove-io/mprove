import * as api from '../../../_index';

export interface MoveFolderResponse200BodyPayload {
  deleted_folder_dev_files: api.CatalogFile[];
  new_folder_dev_files: api.CatalogFile[];
  dev_struct: api.Struct;
}
