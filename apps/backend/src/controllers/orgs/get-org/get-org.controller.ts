import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import {
  MembersRepository,
  ProjectsRepository
} from '~backend/models/store-repositories/_index';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class GetOrgController {
  constructor(
    private orgsService: OrgsService,
    private membersRepository: MembersRepository,
    private projectsRepository: ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetOrgRequest)
    reqValid: apiToBackend.ToBackendGetOrgRequest
  ) {
    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    if (org.owner_id !== user.user_id) {
      let userMembers = await this.membersRepository.find({
        where: {
          member_id: user.user_id
        }
      });

      let projectIds = userMembers.map(m => m.project_id);
      let projects =
        projectIds.length === 0
          ? []
          : await this.projectsRepository.find({
              where: {
                project_id: In(projectIds),
                org_id: orgId
              }
            });

      let orgIds = projects.map(x => x.org_id);

      if (orgIds.indexOf(orgId) < 0) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_FORBIDDEN_ORG
        });
      }
    }

    let payload: apiToBackend.ToBackendGetOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}
