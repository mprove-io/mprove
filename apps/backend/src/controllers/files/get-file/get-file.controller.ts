import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import {
  ToBackendGetFileRequest,
  ToBackendGetFileResponsePayload
} from '#common/interfaces/to-backend/files/to-backend-get-file';
import {
  ToDiskGetFileRequest,
  ToDiskGetFileResponse
} from '#common/interfaces/to-disk/07-files/to-disk-get-file';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { StructsService } from '~backend/services/db/structs.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetFileController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetFile)
  async getFile(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetFileRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, fileNodeId, panel } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskGetFileRequest: ToDiskGetFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: fileNodeId,
        panel: panel
      }
    };

    let diskResponse = await this.rpcService.sendToDisk<ToDiskGetFileResponse>({
      orgId: project.orgId,
      projectId: projectId,
      repoId: repoId,
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
      member: userMember
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

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendGetFileResponsePayload = {
      repo: diskResponse.payload.repo,
      originalContent: diskResponse.payload.originalContent,
      content: diskResponse.payload.content,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      needValidate: bridge.needValidate,
      isExist: diskResponse.payload.isExist
    };

    return payload;
  }
}
