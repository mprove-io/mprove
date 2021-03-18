import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class CreateBranchController {
  constructor(
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private reposService: ReposService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  async createBranch(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateBranchRequest)
    reqValid: apiToBackend.ToBackendCreateBranchRequest
  ) {
    let {
      projectId,
      repoId,
      newBranchId,
      fromBranchId,
      isFromRemote
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.reposService.checkDevRepoId({
      repoId: repoId,
      userAlias: user.alias
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.user_id,
      projectId: projectId
    });

    let fromBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isFromRemote === true ? common.PROD_REPO_ID : user.alias,
      branchId: fromBranchId
    });

    await this.branchesService.checkBranchDoesNotExist({
      projectId: projectId,
      repoId: user.alias,
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
        isFromRemote: isFromRemote
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

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          branches: [newBranch]
        }
      });
    });

    return {};
  }
}
