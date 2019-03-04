import { api } from '../barrels/api';

export interface ItemStatus {
  status: api.RepoStatusEnum;
  conflicts: api.FileLine[];
}
