import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class MoveCatalogNodeController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode)
  async moveCatalogNode(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendMoveCatalogNodeRequest)
    reqValid: apiToBackend.ToBackendMoveCatalogNodeRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, branchId, fromNodeId, toNodeId } = reqValid.payload;

    let repoId = user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.user_id,
      branchId: branchId
    });

    let toDiskMoveCatalogNodeRequest: apiToDisk.ToDiskMoveCatalogNodeRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fromNodeId: fromNodeId,
        toNodeId: toNodeId
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskMoveCatalogNodeResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskMoveCatalogNodeRequest,
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

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [branch]
      }
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: structId
    });

    let payload: apiToBackend.ToBackendMoveCatalogNodeResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct)
    };

    return payload;
  }
}