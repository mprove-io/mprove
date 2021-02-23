import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { OrgsService } from '~backend/services/orgs.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateProjectController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private orgsService: OrgsService,
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateProjectRequest)
    reqValid: apiToBackend.ToBackendCreateProjectRequest
  ) {
    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.projectsRepository.findOne({ name: name });

    if (common.isDefined(project)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
      });
    }

    let newProject = maker.makeProject({
      orgId: orgId,
      name: name
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

    let toBlockmlRebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: reqValid.info.traceId
      },
      payload: {
        structId: structId,
        orgId: orgId,
        projectId: newProject.project_id,
        files: helper.diskFilesToBlockmlFiles(diskResponse.payload.prodFiles),
        connections: []
      }
    };

    let blockmlRebuildStructResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: toBlockmlRebuildStructRequest,
        checkIsOk: true
      }
    );

    let {
      weekStart,
      allowTimezones,
      defaultTimezone,
      errors,
      views,
      udfsDict,
      vizs,
      mconfigs,
      queries,
      dashboards,
      models
    } = blockmlRebuildStructResponse.payload;

    let struct = maker.makeStruct({
      projectId: newProject.project_id,
      structId: structId,
      weekStart: weekStart,
      allowTimezones: common.booleanToBoolEnum(allowTimezones),
      defaultTimezone: defaultTimezone,
      errors: errors,
      views: views,
      udfsDict: udfsDict
    });

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

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          projects: [newProject],
          structs: [struct],
          branches: [prodBranch, devBranch],
          vizs: vizs.map(x => wrapper.wrapToEntityViz(x)),
          queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          models: models.map(x => wrapper.wrapToEntityModel(x)),
          mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          dashboards: dashboards.map(x => wrapper.wrapToEntityDashboard(x))
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateProjectResponsePayload = {
      project: wrapper.wrapToApiProject(newProject)
    };

    return payload;
  }
}
