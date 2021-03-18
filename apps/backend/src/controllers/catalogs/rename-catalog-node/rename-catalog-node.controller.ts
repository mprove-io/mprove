import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class RenameCatalogNodeController {
  constructor(
    private projectsService: ProjectsService,
    private connection: Connection,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode)
  async renameCatalogNode(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRenameCatalogNodeRequest)
    reqValid: apiToBackend.ToBackendRenameCatalogNodeRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, branchId, nodeId, newName } = reqValid.payload;

    let repoId = user.alias;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.alias,
      branchId: branchId
    });

    let toDiskRenameCatalogNodeRequest: apiToDisk.ToDiskRenameCatalogNodeRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        nodeId: nodeId,
        newName: newName
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskRenameCatalogNodeResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskRenameCatalogNodeRequest,
        checkIsOk: true
      }
    );

    let structId = common.makeId();

    await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId,
      diskFiles: diskResponse.payload.files
    });

    branch.struct_id = structId;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          branches: [branch]
        }
      });
    });

    let payload: apiToBackend.ToBackendRenameCatalogNodeResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
