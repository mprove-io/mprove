import { ToBackendGetBranchesListResponsePayloadBranchesItem } from '~common/interfaces/to-backend/branches/to-backend-get-branches-list';

export class BranchItem extends ToBackendGetBranchesListResponsePayloadBranchesItem {
  extraId: string;
  extraName: string;
}
