import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';

@Injectable()
export class ReposService {
  constructor() {}

  async checkDevRepoId(item: { repoId: string; userId: string }) {
    if (item.repoId !== item.userId) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_REPO
      });
    }
  }
}
