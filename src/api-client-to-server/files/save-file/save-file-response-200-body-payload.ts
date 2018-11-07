import * as apiObjects from '../../../objects/_index';

export interface SaveFileResponse200BodyPayload {
  saved_dev_file: apiObjects.CatalogFile;
  dev_struct: apiObjects.Struct;
}
