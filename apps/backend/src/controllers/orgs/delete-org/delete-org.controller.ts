import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteOrgController {
  constructor(
    private orgsService: OrgsService,
    private rabbitService: RabbitService,
    private projectsRepository: repositories.ProjectsRepository,
    private membersRepository: repositories.MembersRepository,
    private branchesRepository: repositories.BranchesRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private envsRepository: repositories.EnvsRepository,
    private evsRepository: repositories.EvsRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteOrg)
  async deleteOrg(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteOrgRequest = request.body;

    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let toDiskDeleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: org.org_id
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrgResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: undefined
        }),
        message: toDiskDeleteOrgRequest,
        checkIsOk: true
      });

    await this.orgsRepository.delete({ org_id: orgId });

    let projects = await this.projectsRepository.find({
      where: { org_id: orgId }
    });
    let projectIds = projects.map(x => x.project_id);

    if (projectIds.length > 0) {
      await this.projectsRepository.delete({ project_id: In(projectIds) });
      await this.membersRepository.delete({ project_id: In(projectIds) });
      await this.connectionsRepository.delete({ project_id: In(projectIds) });
      await this.envsRepository.delete({ project_id: In(projectIds) });
      await this.evsRepository.delete({ project_id: In(projectIds) });
      await this.branchesRepository.delete({ project_id: In(projectIds) });
      await this.bridgesRepository.delete({ project_id: In(projectIds) });
    }

    let payload = {};

    return payload;
  }
}
