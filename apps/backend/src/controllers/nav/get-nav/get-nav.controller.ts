import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import {
  BridgeEnt,
  bridgesTable
} from '~backend/drizzle/postgres/schema/bridges';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetNavRequest,
  ToBackendGetNavResponsePayload
} from '~common/interfaces/to-backend/nav/to-backend-get-nav';
import {
  ToDiskGetCatalogNodesRequest,
  ToDiskGetCatalogNodesResponse
} from '~common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-nodes';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetNavController {
  constructor(
    private wrapToApiService: WrapEnxToApiService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private structsService: StructsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetNav)
  async getNav(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetNavRequest = request.body;

    let { orgId, projectId, getRepo } = reqValid.payload;

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let projectIds = members.map(x => x.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: inArray(projectsTable.projectId, projectIds)
          });

    let orgIds = projects.map(x => x.orgId);

    let orgs =
      orgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable.findMany({
            where: inArray(orgsTable.orgId, orgIds)
          });

    let ownerOrgs = await this.db.drizzle.query.orgsTable.findMany({
      where: eq(orgsTable.ownerId, user.userId)
    });

    let orgIdsWithDuplicates = [...orgs, ...ownerOrgs].map(x => x.orgId);

    let existingOrgIds = [...new Set(orgIdsWithDuplicates)];

    let resultOrgId =
      isDefined(orgId) && existingOrgIds.indexOf(orgId) > -1
        ? orgId
        : existingOrgIds[0];

    let resultOrg = [...orgs, ...ownerOrgs].find(x => x.orgId === resultOrgId);

    let existingProjectIds = projects
      .filter(x => x.orgId === resultOrgId)
      .map(x => x.projectId);

    let resultProjectId =
      isDefined(projectId) && existingProjectIds.indexOf(projectId) > -1
        ? projectId
        : existingProjectIds[0];

    let resultProject = projects.find(x => x.projectId === resultProjectId);

    let bridge: BridgeEnt;

    if (isDefined(resultProject)) {
      bridge = await this.db.drizzle.query.bridgesTable.findFirst({
        where: and(
          eq(bridgesTable.projectId, resultProject.projectId),
          eq(bridgesTable.repoId, PROD_REPO_ID),
          eq(bridgesTable.branchId, resultProject.defaultBranch),
          eq(bridgesTable.envId, PROJECT_ENV_PROD)
        )
      });
    }

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, user.userId)
    });

    let apiMember;
    let apiStruct;
    let repo;

    if (
      getRepo === true &&
      isDefined(resultOrgId) &&
      isDefined(resultProjectId) &&
      isDefined(bridge)
    ) {
      let userMember = await this.membersService.getMemberCheckExists({
        projectId: resultProject.projectId,
        memberId: user.userId
      });

      apiMember = this.wrapToApiService.wrapToApiMember(userMember);

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.structId,
        projectId: resultProject.projectId
      });

      apiStruct = this.wrapToApiService.wrapToApiStruct(struct);

      let apiResultProject = this.wrapToApiService.wrapToApiProject({
        project: resultProject,
        isAddGitUrl: true,
        isAddPrivateKey: true,
        isAddPublicKey: true
      });

      let toDiskGetCatalogNodesRequest: ToDiskGetCatalogNodesRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
          traceId: reqValid.info.traceId
        },
        payload: {
          orgId: resultProject.orgId,
          baseProject: apiResultProject,
          repoId: bridge.repoId,
          branch: bridge.branchId,
          isFetch: true
        }
      };

      let diskResponse =
        await this.rabbitService.sendToDisk<ToDiskGetCatalogNodesResponse>({
          routingKey: makeRoutingKeyToDisk({
            orgId: resultProject.orgId,
            projectId: resultProject.projectId
          }),
          message: toDiskGetCatalogNodesRequest,
          checkIsOk: true
        });

      repo = diskResponse?.payload.repo;
    }

    let payload: ToBackendGetNavResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig,
      orgId: resultOrgId,
      orgOwnerId: resultOrg?.ownerId,
      orgName: resultOrg?.name,
      projectId: resultProjectId,
      projectName: resultProject?.name,
      projectDefaultBranch: resultProject?.defaultBranch,
      isRepoProd: true,
      branchId: resultProject?.defaultBranch,
      envId: PROJECT_ENV_PROD,
      needValidate: isDefined(bridge) ? bridge.needValidate : false,
      user: this.wrapToApiService.wrapToApiUser(user),
      serverNowTs: Date.now(),
      userMember: apiMember,
      struct: apiStruct,
      repo: repo
    };

    return payload;
  }
}
