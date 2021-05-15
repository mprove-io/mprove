import { apiToBackend } from '~front/barrels/api-to-backend';

export class BranchItem extends apiToBackend.ToBackendGetBranchesListResponsePayloadBranchesItem {
  extraId: string;
}
