import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateBranchController {
  constructor(
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  async createBranch(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateBranchRequest)
    reqValid: apiToBackend.ToBackendCreateBranchRequest
  ) {
    let {
      projectId,
      newBranchId,
      fromBranchId,
      isFromRemote
    } = reqValid.payload;

    let repoId = user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      memberId: user.user_id,
      projectId: projectId
    });

    let fromBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isFromRemote === true ? common.PROD_REPO_ID : user.user_id,
      branchId: fromBranchId
    });

    await this.branchesService.checkBranchDoesNotExist({
      projectId: projectId,
      repoId: user.user_id,
      branchId: newBranchId
    });

    let toDiskCreateBranchRequest: apiToDisk.ToDiskCreateBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        newBranch: newBranchId,
        fromBranch: fromBranchId,
        isFromRemote: isFromRemote,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateBranchResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateBranchRequest,
        checkIsOk: true
      }
    );

    let newBranch = maker.makeBranch({
      structId: fromBranch.struct_id,
      projectId: projectId,
      repoId: repoId,
      branchId: newBranchId
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        branches: [newBranch]
      }
    });

    let payload = {};

    return payload;
  }
}
