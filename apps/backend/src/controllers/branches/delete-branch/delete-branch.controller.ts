import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteBranchController {
  constructor(
    private projectsService: ProjectsService,
    private branchesRepository: repositories.BranchesRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch)
  async deleteBranch(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteBranchRequest = request.body;

    let { projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
      memberId: user.user_id,
      projectId: projectId
    });

    if (branchId === project.default_branch) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_DEFAULT_BRANCH_CAN_NOT_BE_DELETED
      });
    }

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let toDiskDeleteBranchRequest: apiToDisk.ToDiskDeleteBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        defaultBranch: project.default_branch,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteBranchResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.org_id,
            projectId: projectId
          }),
          message: toDiskDeleteBranchRequest,
          checkIsOk: true
        }
      );

    await this.branchesRepository.delete({
      project_id: projectId,
      repo_id: repoId,
      branch_id: branchId
    });

    await this.bridgesRepository.delete({
      project_id: projectId,
      repo_id: repoId,
      branch_id: branchId
    });

    let payload = {};

    return payload;
  }
}
