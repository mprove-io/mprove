import * as apiObjects from '../../../objects/_index';

export interface MoveFileResponse200BodyPayload {
  deleted_dev_file: apiObjects.CatalogFile;
  new_dev_file: apiObjects.CatalogFile;
  dev_struct: apiObjects.Struct;
}
