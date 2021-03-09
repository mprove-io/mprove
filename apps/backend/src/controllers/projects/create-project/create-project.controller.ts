import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { OrgsService } from '~backend/services/orgs.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateProjectController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private orgsService: OrgsService,
    private projectsRepository: repositories.ProjectsRepository,
    private blockmlService: BlockmlService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateProjectRequest)
    reqValid: apiToBackend.ToBackendCreateProjectRequest
  ) {
    let { traceId } = reqValid.info;
    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.projectsRepository.findOne({
      org_id: orgId,
      name: name
    });

    if (common.isDefined(project)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
      });
    }

    let newProject = maker.makeProject({
      orgId: orgId,
      name: name
    });

    let newMember = maker.makeMember({
      projectId: newProject.project_id,
      user: user,
      isAdmin: common.BoolEnum.TRUE,
      isEditor: common.BoolEnum.TRUE,
      isExplorer: common.BoolEnum.TRUE
    });

    let toDiskCreateProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
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

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateProjectResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: newProject.project_id
        }),
        message: toDiskCreateProjectRequest,
        checkIsOk: true
      }
    );

    let structId = common.makeId();

    let prodBranch = maker.makeBranch({
      structId: structId,
      projectId: newProject.project_id,
      repoId: common.PROD_REPO_ID,
      branchId: common.BRANCH_MASTER
    });

    let devBranch = maker.makeBranch({
      structId: structId,
      projectId: newProject.project_id,
      repoId: user.user_id,
      branchId: common.BRANCH_MASTER
    });

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: newProject.org_id,
      projectId: newProject.project_id,
      structId,
      diskFiles: diskResponse.payload.prodFiles
    });

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          projects: [newProject],
          members: [newMember],
          branches: [prodBranch, devBranch]
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateProjectResponsePayload = {
      project: wrapper.wrapToApiProject(newProject)
    };

    return payload;
  }
}
