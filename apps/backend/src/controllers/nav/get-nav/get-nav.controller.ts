import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetNavController {
  constructor(
    private avatarsRepository: repositories.AvatarsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private structsService: StructsService,
    private membersRepository: repositories.MembersRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private orgsRepository: repositories.OrgsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav)
  async getNav(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetNavRequest = request.body;

    let { orgId, projectId } = reqValid.payload;

    let members = await this.membersRepository.find({
      where: {
        member_id: user.user_id
      }
    });

    let projectIds = members.map(x => x.project_id);
    let projects =
      projectIds.length === 0
        ? []
        : await this.projectsRepository.find({
            where: {
              project_id: In(projectIds)
            }
          });

    let orgIds = projects.map(x => x.org_id);
    let orgs =
      orgIds.length === 0
        ? []
        : await this.orgsRepository.find({
            where: {
              org_id: In(orgIds)
            }
          });

    let ownerOrgs = await this.orgsRepository.find({
      where: {
        owner_id: user.user_id
      }
    });

    let orgIdsWithDuplicates = [...orgs, ...ownerOrgs].map(x => x.org_id);

    let existingOrgIds = [...new Set(orgIdsWithDuplicates)];

    let resultOrgId =
      common.isDefined(orgId) && existingOrgIds.indexOf(orgId) > -1
        ? orgId
        : existingOrgIds[0];

    let resultOrg = [...orgs, ...ownerOrgs].find(x => x.org_id === resultOrgId);

    let existingProjectIds = projects
      .filter(x => x.org_id === resultOrgId)
      .map(x => x.project_id);

    let resultProjectId =
      common.isDefined(projectId) && existingProjectIds.indexOf(projectId) > -1
        ? projectId
        : existingProjectIds[0];

    let resultProject = projects.find(x => x.project_id === resultProjectId);

    let bridge: entities.BridgeEntity;

    if (common.isDefined(resultProject)) {
      bridge = await this.bridgesRepository.findOne({
        where: {
          project_id: resultProject.project_id,
          repo_id: common.PROD_REPO_ID,
          branch_id: resultProject.default_branch,
          env_id: common.PROJECT_ENV_PROD
        }
      });
    }

    let avatar = await this.avatarsRepository.findOne({
      where: {
        user_id: user.user_id
      }
    });

    let apiMember;
    let apiStruct;
    let repo;

    if (
      common.isDefined(resultOrgId) &&
      common.isDefined(resultProjectId) &&
      common.isDefined(bridge)
    ) {
      let userMember = await this.membersService.getMemberCheckExists({
        projectId: resultProject.project_id,
        memberId: user.user_id
      });

      apiMember = wrapper.wrapToApiMember(userMember);

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.struct_id,
        projectId: resultProject.project_id
      });

      apiStruct = wrapper.wrapToApiStruct(struct);

      let toDiskGetCatalogNodesRequest: apiToDisk.ToDiskGetCatalogNodesRequest =
        {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: resultProject.org_id,
            projectId: resultProject.project_id,
            repoId: bridge.repo_id,
            branch: bridge.branch_id,
            isFetch: true,
            remoteType: resultProject.remote_type,
            gitUrl: resultProject.git_url,
            privateKey: resultProject.private_key,
            publicKey: resultProject.public_key
          }
        };

      let diskResponse =
        await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogNodesResponse>(
          {
            routingKey: helper.makeRoutingKeyToDisk({
              orgId: resultProject.org_id,
              projectId: resultProject.project_id
            }),
            message: toDiskGetCatalogNodesRequest,
            checkIsOk: true
          }
        );

      repo = diskResponse?.payload.repo;
    }

    let payload: apiToBackend.ToBackendGetNavResponsePayload = {
      avatarSmall: avatar?.avatar_small,
      avatarBig: avatar?.avatar_big,
      orgId: resultOrgId,
      orgOwnerId: resultOrg?.owner_id,
      orgName: resultOrg?.name,
      projectId: resultProjectId,
      projectName: resultProject?.name,
      projectDefaultBranch: resultProject?.default_branch,
      isRepoProd: true,
      branchId: resultProject?.default_branch,
      envId: common.PROJECT_ENV_PROD,
      needValidate: common.isDefined(bridge)
        ? common.enumToBoolean(bridge.need_validate)
        : false,
      user: wrapper.wrapToApiUser(user),
      serverNowTs: Date.now(),
      userMember: apiMember,
      struct: apiStruct,
      repo: repo
    };

    return payload;
  }
}
