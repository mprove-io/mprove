import * as apiObjects from '../../../objects/_index';

export interface RenameFolderResponse200BodyPayload {
  deleted_folder_dev_files: apiObjects.CatalogFile[];
  new_folder_dev_files: apiObjects.CatalogFile[];
  dev_struct: apiObjects.Struct;
}
