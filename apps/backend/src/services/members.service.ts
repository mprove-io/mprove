import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class MembersService {
  constructor(private membersRepository: repositories.MembersRepository) {}

  async checkMemberIsProjectAdmin(item: {
    memberId: string;
    projectId: string;
  }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (member.is_admin !== common.BoolEnum.TRUE) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MEMBER_IS_NOT_ADMIN
      });
    }

    return;
  }

  async checkProjectMemberExists(item: {
    memberId: string;
    projectId: string;
  }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    return;
  }
}
