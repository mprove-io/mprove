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
    let { orgNames, projectNames, emails } = reqValid.payload;

    let structIds = [];
    let userIds = [];
    let projectIds = [];
    let orgIds = [];

    if (common.isDefined(projectNames) && projectNames.length > 0) {
      await asyncPool(1, projectNames, async (x: string) => {
        let project = await this.projectsRepository.findOne({ name: x });

        if (common.isDefined(project)) {
          projectIds.push(project.project_id);

          let deleteProjectRequest: apiToDisk.ToDiskDeleteProjectRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: project.org_id,
              projectId: project.project_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteProjectResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: project.org_id,
                projectId: project.project_id
              }),
              message: deleteProjectRequest,
              checkIsOk: true
            }
          );
        }
      });
    }

    if (common.isDefined(orgNames) && orgNames.length > 0) {
      await asyncPool(1, orgNames, async (x: string) => {
        let org = await this.orgsRepository.findOne({ name: x });

        if (common.isDefined(org)) {
          orgIds.push(org.org_id);

          let deleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: org.org_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrgResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: org.org_id,
                projectId: null
              }),
              message: deleteOrgRequest,
              checkIsOk: true
            }
          );
        }
      });
    }

    if (common.isDefined(emails) && emails.length > 0) {
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

    await this.dashboardsRepository.delete({ struct_id: In(structIds) });
    await this.mconfigsRepository.delete({ struct_id: In(structIds) });
    await this.modelsRepository.delete({ struct_id: In(structIds) });
    await this.vizsRepository.delete({ struct_id: In(structIds) });
    await this.structsRepository.delete({ struct_id: In(structIds) });
    await this.branchesRepository.delete({ project_id: In(projectIds) });
    await this.connectionsRepository.delete({ project_id: In(projectIds) });
    await this.membersRepository.delete({ member_id: In(userIds) });
    await this.projectsRepository.delete({ project_id: In(projectIds) });
    await this.orgsRepository.delete({ org_id: In(orgIds) });
    await this.avatarsRepository.delete({ user_id: In(userIds) });
    await this.usersRepository.delete({ user_id: In(userIds) });

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
