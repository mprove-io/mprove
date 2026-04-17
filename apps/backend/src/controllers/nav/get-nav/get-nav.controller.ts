import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetNavRequestDto,
  ToBackendGetNavResponseDto
} from '#backend/controllers/nav/get-nav/get-nav.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { StructsService } from '#backend/services/db/structs.service';
import { UsersService } from '#backend/services/db/users.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { Member } from '#common/zod/backend/member';
import type { StructX } from '#common/zod/backend/struct-x';
import type { Repo } from '#common/zod/disk/repo';
import type { ToBackendGetNavResponsePayload } from '#common/zod/to-backend/nav/to-backend-get-nav';
import type {
  ToDiskGetCatalogNodesRequest,
  ToDiskGetCatalogNodesResponse
} from '#common/zod/to-disk/04-catalogs/to-disk-get-catalog-nodes';

@ApiTags('Nav')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetNavController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private usersService: UsersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetNav)
  @ApiOperation({
    summary: 'GetNav',
    description: 'Get initial navigation context for the current user'
  })
  @ApiOkResponse({
    type: ToBackendGetNavResponseDto
  })
  async getNav(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetNavRequestDto
  ) {
    let { orgId, projectId, getRepo } = body.payload;

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let projectIds = members.map(x => x.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable
            .findMany({
              where: inArray(projectsTable.projectId, projectIds)
            })
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    let orgIds = projects.map(x => x.orgId);

    let orgs =
      orgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable
            .findMany({
              where: inArray(orgsTable.orgId, orgIds)
            })
            .then(xs => xs.map(x => this.tabService.orgEntToTab(x)));

    let ownerOrgs = await this.db.drizzle.query.orgsTable
      .findMany({
        where: eq(orgsTable.ownerId, user.userId)
      })
      .then(xs => xs.map(x => this.tabService.orgEntToTab(x)));

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

    let bridge: BridgeTab;

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

    let avatar = await this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, user.userId)
      })
      .then(x => this.tabService.avatarEntToTab(x));

    let apiMember: Member;
    let apiStruct: StructX;
    let apiRepo: Repo;

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

      apiMember = this.membersService.tabToApi({ member: userMember });

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.structId,
        projectId: resultProject.projectId
      });

      let apiUserMember = this.membersService.tabToApi({ member: userMember });

      let modelPartXs = await this.modelsService.getModelPartXs({
        structId: struct.structId,
        apiUserMember: apiUserMember
      });

      apiStruct = this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      });

      let apiResultBaseProject = this.tabService.projectTabToBaseProject({
        project: resultProject
      });

      let toDiskGetCatalogNodesRequest: ToDiskGetCatalogNodesRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
          traceId: body.info.traceId
        },
        payload: {
          orgId: resultProject.orgId,
          baseProject: apiResultBaseProject,
          repoId: bridge.repoId,
          branch: bridge.branchId,
          isFetch: false
        }
      };

      let diskResponse =
        await this.rpcService.sendToDisk<ToDiskGetCatalogNodesResponse>({
          orgId: resultProject.orgId,
          projectId: resultProject.projectId,
          repoId: bridge.repoId,
          message: toDiskGetCatalogNodesRequest,
          checkIsOk: true
        });

      apiRepo = diskResponse?.payload.repo;
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
      repoId: PROD_REPO_ID,
      repoType: RepoTypeEnum.Production,
      branchId: resultProject?.defaultBranch,
      envId: PROJECT_ENV_PROD,
      needValidate: isDefined(bridge) ? bridge.needValidate : false,
      user: this.usersService.tabToApi({ user: user }),
      serverNowTs: Date.now(),
      userMember: apiMember,
      struct: apiStruct,
      repo: apiRepo
    };

    return payload;
  }
}
