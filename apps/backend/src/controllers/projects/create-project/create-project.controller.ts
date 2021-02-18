import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateProjectController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateProjectRequest)
    reqValid: apiToBackend.ToBackendCreateProjectRequest
  ) {
    let { name, orgId } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ org_id: orgId });

    if (common.isUndefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORG_IS_NOT_EXIST
      });
    }

    let newProject = gen.makeProject({
      orgId: orgId,
      name: name
    });

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          projects: [newProject]
        }
      });
    });

    let createProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: orgId,
        projectId: newProject.project_id,
        devRepoId: user.user_id,
        userAlias: user.alias
      }
    };

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateProjectResponse>({
      routingKey: helper.makeRoutingKeyToDisk({
        orgId: orgId,
        projectId: newProject.project_id
      }),
      message: createProjectRequest,
      checkIsOk: true
    });

    let payload: apiToBackend.ToBackendCreateProjectResponsePayload = {
      project: wrapper.wrapToApiProject(newProject)
    };

    return payload;
  }
}
