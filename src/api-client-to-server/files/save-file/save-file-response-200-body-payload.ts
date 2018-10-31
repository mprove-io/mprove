import * as api from '../../../_index';

export interface SaveFileResponse200BodyPayload {
  saved_dev_file: api.CatalogFile;
  dev_struct: api.Struct;
}
