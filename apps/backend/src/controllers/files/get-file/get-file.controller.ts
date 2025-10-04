import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import {
  ToBackendGetFileRequest,
  ToBackendGetFileResponsePayload
} from '~common/interfaces/to-backend/files/to-backend-get-file';
import {
  ToDiskGetFileRequest,
  ToDiskGetFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-get-file';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetFileController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetFile)
  async getFile(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetFileRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, fileNodeId, panel } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiProject = this.wrapToApiService.wrapToApiProject({
      project: project,
      isAddGitUrl: true,
      isAddPrivateKey: true,
      isAddPublicKey: true
    });

    let toDiskGetFileRequest: ToDiskGetFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        project: apiProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: fileNodeId,
        panel: panel
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskGetFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskGetFileRequest,
        checkIsOk: true
      });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId,
      isGetEmptyStructOnError: true
    });

    let payload: ToBackendGetFileResponsePayload = {
      repo: diskResponse.payload.repo,
      originalContent: diskResponse.payload.originalContent,
      content: diskResponse.payload.content,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      needValidate: bridge.needValidate,
      isExist: diskResponse.payload.isExist
    };

    return payload;
  }
}
