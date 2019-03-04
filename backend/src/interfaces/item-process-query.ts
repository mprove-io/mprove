import { entities } from '../barrels/entities';

export interface ItemProcessQuery {
  mconfig: entities.MconfigEntity;
  query: entities.QueryEntity;
}
