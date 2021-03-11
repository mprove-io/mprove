import { Controller, Post, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@Controller()
export class DeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private dashboardsRepository: repositories.DashboardsRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private modelsRepository: repositories.ModelsRepository,
    // private queriesRepository: repositories.QueriesRepository,
    private structsRepository: repositories.StructsRepository,
    private vizsRepository: repositories.VizsRepository,
    private avatarsRepository: repositories.AvatarsRepository,
    private branchesRepository: repositories.BranchesRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private membersRepository: repositories.MembersRepository,
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private usersRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(
    @ValidateRequest(apiToBackend.ToBackendDeleteRecordsRequest)
    reqValid: apiToBackend.ToBackendDeleteRecordsRequest
  ) {
    let {
      orgIds,
      projectIds,
      emails,
      orgNames,
      projectNames
    } = reqValid.payload;

    emails = emails || [];
    projectIds = projectIds || [];
    orgIds = orgIds || [];

    let structIds = [];
    let userIds = [];

    if (common.isDefined(projectNames) && projectNames.length > 0) {
      let projects = await this.projectsRepository.find({
        org_id: In(orgIds),
        name: In(projectNames)
      });
      if (projects.length > 0) {
        projectIds = [...projectIds, ...projects.map(x => x.project_id)];
      }
    }

    if (common.isDefined(orgNames) && orgNames.length > 0) {
      let orgs = await this.orgsRepository.find({ name: In(orgNames) });
      if (orgs.length > 0) {
        orgIds = [...orgIds, ...orgs.map(x => x.org_id)];
      }
    }

    if (orgIds.length > 0) {
      await asyncPool(1, orgIds, async (x: string) => {
        let deleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: x
          }
        };

        await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrgResponse>({
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: x,
            projectId: null
          }),
          message: deleteOrgRequest,
          checkIsOk: true
        });
      });
    }

    if (emails.length > 0) {
      await asyncPool(1, emails, async (email: string) => {
        let user = await this.usersRepository.findOne({ email: email });
        if (common.isDefined(user)) {
          userIds.push(user.user_id);
        }
      });
    }

    let structs = await this.structsRepository.find({
      project_id: In(projectIds)
    });

    structIds = structs.map(struct => struct.struct_id);

    await this.usersRepository.delete({ user_id: In(userIds) });
    await this.orgsRepository.delete({ org_id: In(orgIds) });
    await this.projectsRepository.delete({ project_id: In(projectIds) });
    await this.membersRepository.delete({ member_id: In(userIds) });
    await this.connectionsRepository.delete({ project_id: In(projectIds) });
    await this.structsRepository.delete({ struct_id: In(structIds) });
    await this.branchesRepository.delete({ project_id: In(projectIds) });
    await this.vizsRepository.delete({ struct_id: In(structIds) });
    // queries
    await this.modelsRepository.delete({ struct_id: In(structIds) });
    await this.mconfigsRepository.delete({ struct_id: In(structIds) });
    await this.dashboardsRepository.delete({ struct_id: In(structIds) });
    await this.avatarsRepository.delete({ user_id: In(userIds) });

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
