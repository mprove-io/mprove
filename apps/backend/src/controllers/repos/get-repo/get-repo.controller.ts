import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
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
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetRepo)
  async getRepo(@AttachUser() user: UserEnt, @Req() request: any) {
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

    let toDiskGetCatalogNodesRequest: ToDiskGetCatalogNodesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        isFetch: isFetch,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
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
      skipError: true
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetRepoResponsePayload = {
      userMember: apiMember,
      user: this.wrapToApiService.wrapToApiUser(user),
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
