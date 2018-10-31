import * as api from '../../../_index';

export interface DeleteFileResponse200BodyPayload {
  deleted_dev_file: api.CatalogFile;

  dev_struct: api.Struct;

}
