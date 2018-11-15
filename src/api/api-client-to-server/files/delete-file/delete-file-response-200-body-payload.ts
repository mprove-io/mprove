import * as apiObjects from '../../../objects/_index';

export interface DeleteFileResponse200BodyPayload {
  deleted_dev_file: apiObjects.CatalogFile;

  dev_struct: apiObjects.Struct;
}
