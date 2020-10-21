import * as apiEnums from '../api/enums/_index';
import * as apiObjects from '../api/objects/_index';

export interface ItemStatus {
  repoStatus: apiEnums.RepoStatusEnum;

  conflicts: apiObjects.DiskFileLine[];

  currentBranch: string;
}
