import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetOrgsListController {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgsList)
  async getOrgsList(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetOrgsListRequest = request.body;

    let userMembers = await this.membersRepository.find({
      where: {
        member_id: user.user_id
      }
    });

    let userProjectIds = userMembers.map(m => m.project_id);
    let userProjects =
      userProjectIds.length === 0
        ? []
        : await this.projectsRepository.find({
            where: {
              project_id: In(userProjectIds)
            }
          });

    let userOrgIds = userProjects.map(p => p.org_id);
    let userOrgs =
      userOrgIds.length === 0
        ? []
        : await this.orgsRepository.find({
            where: {
              org_id: In(userOrgIds)
            }
          });

    let ownerOrgs = await this.orgsRepository.find({
      where: {
        owner_id: user.user_id
      }
    });

    let orgs = [...userOrgs];

    ownerOrgs.forEach(x => {
      if (orgs.map(z => z.org_id).indexOf(x.org_id) < 0) {
        orgs.push(x);
      }
    });

    let sortedOrgs = orgs.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetOrgsListResponsePayload = {
      orgsList: sortedOrgs.map(x => wrapper.wrapToApiOrgsItem(x))
    };

    return payload;
  }
}
