import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
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
    private bridgesRepository: repositories.BridgesRepository,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  async createBranch(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateBranchRequest)
    reqValid: apiToBackend.ToBackendCreateBranchRequest
  ) {
    let { projectId, newBranchId, fromBranchId, isRepoProd } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      memberId: user.user_id,
      projectId: projectId
    });

    let fromBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: fromBranchId
    });

    await this.branchesService.checkBranchDoesNotExist({
      projectId: projectId,
      repoId: repoId,
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
        isFromRemote: false,
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
      projectId: projectId,
      repoId: repoId,
      branchId: newBranchId
    });

    let fromBranchBridges = await this.bridgesRepository.find({
      project_id: fromBranch.project_id,
      repo_id: fromBranch.repo_id,
      branch_id: fromBranch.branch_id
    });

    let newBranchBridges: entities.BridgeEntity[] = [];

    fromBranchBridges.forEach(x => {
      let newBranchBridge = maker.makeBridge({
        structId: x.struct_id,
        projectId: newBranch.project_id,
        repoId: newBranch.repo_id,
        branchId: newBranch.branch_id,
        envId: x.env_id
      });

      newBranchBridges.push(newBranchBridge);
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        branches: [newBranch],
        bridges: [...newBranchBridges]
      }
    });

    let payload = {};

    return payload;
  }
}
