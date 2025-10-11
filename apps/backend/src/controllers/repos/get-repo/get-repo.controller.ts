import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
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
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import {
  ToBackendGetRepoRequest,
  ToBackendGetRepoResponsePayload
} from '~common/interfaces/to-backend/repos/to-backend-get-repo';
import {
  ToDiskGetCatalogNodesRequest,
  ToDiskGetCatalogNodesResponse
} from '~common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-nodes';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetRepo)
  async getRepo(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetRepoRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, isFetch } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
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

    let baseProject = this.projectsService.tabToBaseProject({
      project: project
    });

    let toDiskGetCatalogNodesRequest: ToDiskGetCatalogNodesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId,
        isFetch: isFetch
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskGetCatalogNodesResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskGetCatalogNodesRequest,
        checkIsOk: true
      });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId,
      isGetEmptyStructOnError: true
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetRepoResponsePayload = {
      userMember: apiMember,
      user: this.wrapToApiService.wrapToApiUser(user),
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
