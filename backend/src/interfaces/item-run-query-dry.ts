import { api } from '../barrels/api';
import { entities } from '../barrels/entities';

export interface ItemRunQueryDry {
  valid_estimate: api.QueryEstimate;
  error_query: entities.QueryEntity;
}
