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
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private reposService: ReposService,
    private rabbitService: RabbitService,
    private connection: Connection,
    private connectionsRepository: repositories.ConnectionsRepository,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFolder)
  async deleteFolder(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteFolderRequest)
    reqValid: apiToBackend.ToBackendDeleteFolderRequest
  ) {
    let { projectId, repoId, branchId, folderNodeId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditorOrAdmin({
      projectId: projectId,
      memberId: user.user_id
    });

    await this.reposService.checkDevRepoId({
      userId: user.user_id,
      repoId: repoId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.user_id,
      branchId: branchId
    });

    let toDiskDeleteFolderRequest: apiToDisk.ToDiskDeleteFolderRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        folderNodeId: folderNodeId
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteFolderResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskDeleteFolderRequest,
        checkIsOk: true
      }
    );

    let connections = await this.connectionsRepository.find({
      project_id: projectId
    });

    let structId = common.makeId();

    let toBlockmlRebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: reqValid.info.traceId
      },
      payload: {
        structId: structId,
        orgId: project.org_id,
        projectId: projectId,
        files: helper.diskFilesToBlockmlFiles(diskResponse.payload.files),
        connections: connections.map(x => ({
          connectionId: x.connection_id,
          type: x.type,
          bigqueryProject: x.bigquery_project
        }))
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
      projectId: project.project_id,
      structId: structId,
      weekStart: weekStart,
      allowTimezones: common.booleanToEnum(allowTimezones),
      defaultTimezone: defaultTimezone,
      errors: errors,
      views: views,
      udfsDict: udfsDict
    });

    branch.struct_id = structId;

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          structs: [struct],
          vizs: vizs.map(x => wrapper.wrapToEntityViz(x)),
          queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          models: models.map(x => wrapper.wrapToEntityModel(x)),
          mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          dashboards: dashboards.map(x => wrapper.wrapToEntityDashboard(x))
        }
      });
    });

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          branches: [branch]
        }
      });
    });

    let payload: apiToBackend.ToBackendDeleteFolderResponsePayload = {
      repo: {
        currentBranchId: branchId,
        repoStatus: diskResponse.payload.repoStatus,
        conflicts: diskResponse.payload.conflicts,
        nodes: diskResponse.payload.nodes
      }
    };

    return payload;
  }
}
