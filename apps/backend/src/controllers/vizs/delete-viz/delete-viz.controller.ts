import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class DeleteVizController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private vizsService: VizsService,
    private vizsRepository: repositories.VizsRepository,
    private blockmlService: BlockmlService,
    private reposService: ReposService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteViz)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteVizRequest)
    reqValid: apiToBackend.ToBackendDeleteVizRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, vizId } = reqValid.payload;

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

    let existingViz = await this.vizsService.getVizCheckExists({
      structId: branch.struct_id,
      vizId: vizId
    });

    let toDiskDeleteFileRequest: apiToDisk.ToDiskDeleteFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingViz.file_path,
        userAlias: user.alias
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskDeleteFileRequest,
        checkIsOk: true
      }
    );

    let { struct } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    await this.vizsRepository.delete({
      viz_id: vizId,
      struct_id: branch.struct_id
    });

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          structs: [struct]
        }
      });
    });

    let payload = {};

    return payload;
  }
}
