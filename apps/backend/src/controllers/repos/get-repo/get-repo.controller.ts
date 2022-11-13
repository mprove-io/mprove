import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesRepository } from '~backend/models/store-repositories/branches.repository';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesRepository: BranchesRepository,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo)
  async getRepo(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetRepoRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, isFetch } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
        branch_id: branchId
      }
    });

    if (common.isUndefined(branch)) {
      let payloadBranchDoesNotExist: apiToBackend.ToBackendGetRepoResponsePayload =
        {
          isBranchExist: false,
          userMember: undefined,
          needValidate: undefined,
          struct: undefined,
          repo: undefined
        };

      return payloadBranchDoesNotExist;
    } else {
      let env = await this.envsService.getEnvCheckExistsAndAccess({
        projectId: projectId,
        envId: envId,
        member: userMember
      });

      let bridge = await this.bridgesService.getBridgeCheckExists({
        projectId: branch.project_id,
        repoId: branch.repo_id,
        branchId: branch.branch_id,
        envId: envId
      });

      let toDiskGetCatalogNodesRequest: apiToDisk.ToDiskGetCatalogNodesRequest =
        {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: project.org_id,
            projectId: projectId,
            repoId: repoId,
            branch: branchId,
            isFetch: isFetch,
            remoteType: project.remote_type,
            gitUrl: project.git_url,
            privateKey: project.private_key,
            publicKey: project.public_key
          }
        };

      let diskResponse =
        await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogNodesResponse>(
          {
            routingKey: helper.makeRoutingKeyToDisk({
              orgId: project.org_id,
              projectId: projectId
            }),
            message: toDiskGetCatalogNodesRequest,
            checkIsOk: true
          }
        );

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.struct_id,
        projectId: projectId
      });

      let apiMember = wrapper.wrapToApiMember(userMember);

      let payloadBranchExist: apiToBackend.ToBackendGetRepoResponsePayload = {
        isBranchExist: true,
        userMember: apiMember,
        needValidate: common.enumToBoolean(bridge.need_validate),
        struct: wrapper.wrapToApiStruct(struct),
        repo: diskResponse.payload.repo
      };

      return payloadBranchExist;
    }
  }
}
