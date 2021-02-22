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
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private usersRepository: repositories.UsersRepository,
    private membersRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(
    @ValidateRequest(apiToBackend.ToBackendDeleteRecordsRequest)
    reqValid: apiToBackend.ToBackendDeleteRecordsRequest
  ) {
    let { orgNames, projectNames, emails } = reqValid.payload;

    if (common.isDefined(projectNames) && projectNames.length > 0) {
      await asyncPool(1, projectNames, async (x: string) => {
        let project = await this.projectsRepository.findOne({ name: x });

        if (common.isDefined(project)) {
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

          await this.projectsRepository.delete({ name: In(projectNames) });
        }
      });
    }

    if (common.isDefined(orgNames) && orgNames.length > 0) {
      await asyncPool(1, orgNames, async (x: string) => {
        let org = await this.orgsRepository.findOne({ name: x });

        if (common.isDefined(org)) {
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

          await this.orgsRepository.delete({ name: In(orgNames) });
        }
      });
    }

    if (common.isDefined(emails) && emails.length > 0) {
      await this.usersRepository.delete({ email: In(emails) });
      await this.membersRepository.delete({ email: In(emails) });
    }

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
