import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { evsTable } from '~backend/drizzle/postgres/schema/evs';

@Injectable()
export class EvsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async checkEvDoesNotExist(item: {
    projectId: string;
    envId: string;
    evId: string;
  }) {
    let { projectId, envId, evId } = item;

    let ev = await this.db.drizzle.query.evsTable.findFirst({
      where: and(
        eq(evsTable.projectId, projectId),
        eq(evsTable.envId, envId),
        eq(evsTable.evId, evId)
      )
    });

    // let ev = await this.evsRepository.findOne({
    //   where: {
    //     project_id: projectId,
    //     env_id: envId,
    //     ev_id: evId
    //   }
    // });

    if (common.isDefined(ev)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_EV_ALREADY_EXISTS
      });
    }
  }

  async getEvCheckExists(item: {
    projectId: string;
    envId: string;
    evId: string;
  }) {
    let { projectId, envId, evId } = item;

    let ev = await this.db.drizzle.query.evsTable.findFirst({
      where: and(
        eq(evsTable.projectId, projectId),
        eq(evsTable.envId, envId),
        eq(evsTable.evId, evId)
      )
    });

    // let ev = await this.evsRepository.findOne({
    //   where: {
    //     project_id: projectId,
    //     env_id: envId,
    //     ev_id: evId
    //   }
    // });

    if (common.isUndefined(ev)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_EV_DOES_NOT_EXIST
      });
    }

    return ev;
  }
}
