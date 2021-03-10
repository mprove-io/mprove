import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class CreateVizController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private reposService: ReposService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateVizRequest)
    reqValid: apiToBackend.ToBackendCreateVizRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, vizId, vizFileText } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (repoId !== common.PROD_REPO_ID) {
      await this.reposService.checkDevRepoId({
        userId: user.user_id,
        repoId: repoId
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: `${projectId}/${common.BLOCKML_USERS_FOLDER}/${user.alias}`,
        fileName: `${vizId}.viz`,
        fileText: vizFileText
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      }
    );

    let {
      dashboards,
      vizs,
      mconfigs,
      queries,
      models
    } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    let viz = vizs.find(x => x.vizId === vizId);
    let vizReport = viz.reports[0];
    let vizMconfig = mconfigs.find(x => x.mconfigId === vizReport.mconfigId);
    let vizQuery = queries.find(x => x.queryId === vizReport.queryId);

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          vizs: [wrapper.wrapToEntityViz(viz)],
          mconfigs: [wrapper.wrapToEntityMconfig(vizMconfig)],
          queries: [wrapper.wrapToEntityQuery(vizQuery)]
        }
      });
    });

    let payload = {};

    return payload;
  }
}
