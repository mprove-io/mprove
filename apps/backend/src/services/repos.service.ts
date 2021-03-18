import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';

@Injectable()
export class ReposService {
  constructor() {}

  async checkDevRepoId(item: { repoId: string; userAlias: string }) {
    if (item.repoId !== item.userAlias) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_REPO
      });
    }
  }
}
