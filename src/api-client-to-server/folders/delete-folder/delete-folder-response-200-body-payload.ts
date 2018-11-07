import * as apiObjects from '../../../objects/_index';

export interface DeleteFolderResponse200BodyPayload {
  deleted_folder_dev_files: apiObjects.CatalogFile[];
  dev_struct: apiObjects.Struct;
}
