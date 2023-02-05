import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class RepsService {
  constructor(private repsRepository: repositories.RepsRepository) {}

  async getRepCheckExists(item: { repId: string; structId: string }) {
    let { repId, structId } = item;

    let rep = await this.repsRepository.findOne({
      where: {
        struct_id: structId,
        rep_id: repId
      }
    });

    if (common.isUndefined(rep)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REP_DOES_NOT_EXIST
      });
    }

    return rep;
  }

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_REP_PATH
      });
    }
  }

  async getRep(item: {
    projectId: string;
    repId: string;
    draft: boolean;
    structId: string;
    userId: string;
  }) {
    let { projectId, repId, draft, structId, userId } = item;

    let emptyRep: entities.RepEntity = {
      project_id: projectId,
      struct_id: undefined,
      rep_id: repId,
      creator_id: undefined,
      draft: common.BoolEnum.FALSE,
      file_path: undefined,
      title: repId,
      access_roles: [],
      access_users: [],
      rows: [],
      draft_created_ts: undefined,
      server_ts: undefined
    };

    let rep =
      repId === common.EMPTY
        ? emptyRep
        : draft === true
        ? await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              project_id: projectId,
              draft: common.BoolEnum.TRUE,
              struct_id: structId,
              creator_id: userId
            }
          })
        : await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              project_id: projectId,
              draft: common.BoolEnum.FALSE,
              struct_id: structId
            }
          });

    return rep;
  }
}
