import * as api from '../../_index';

export interface RebuildStructResponse200BodyPayload {
  struct: api.StructFull;
  udfs_content: string;
  pdts_sorted: string[];
}
