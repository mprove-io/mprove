import * as apiObjects from '../../../objects/_index';

export interface MoveFolderResponse200BodyPayload {
  deleted_folder_dev_files: apiObjects.CatalogFile[];
  new_folder_dev_files: apiObjects.CatalogFile[];
  dev_struct: apiObjects.Struct;
}
