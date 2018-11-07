import * as apiObjects from '../../objects/_index';

export interface RebuildStructResponse200BodyPayload {
  struct: apiObjects.StructFull;
  udfs_content: string;
  pdts_sorted: string[];
}
