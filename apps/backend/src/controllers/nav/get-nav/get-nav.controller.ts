import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetNavRequestDto,
  ToBackendGetNavResponseDto
} from '#backend/controllers/nav/get-nav/get-nav.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  AvatarTab,
  MemberTab,
  OrgTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { OrgEntToTabResultError } from '#common/types/backend/function-errors/org-ent-to-tab-result-error';
import type { ProjectEntToTabResultError } from '#common/types/backend/function-errors/project-ent-to-tab-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { StructX } from '#common/types/backend/parts/struct/struct-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetNavOutput } from '#common/types/backend/routes/nav/get-nav/get-nav-output';
import type { ToDiskGetCatalogNodesOutput } from '#common/types/disk/routes/catalogs/get-catalog-nodes/get-catalog-nodes-output';

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
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetNav' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getNav'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        projectId: body.input.projectId,
        getRepo: body.input.getRepo,
        traceId: body.traceId,
        user: user
      }),
      Result.bind(
        'memberEnts',
        (v): Result.ResultAsync<MemberEnt[], never> =>
          this.db.drizzle.query.membersTable
            .findMany({ where: eq(membersTable.memberId, v.user.userId) })
            .then(memberEnts => Result.succeed(memberEnts))
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.memberEnts.map(memberEnt => memberEnt.projectId))
      ),
      Result.bind(
        'projects',
        async (
          v
        ): Result.ResultAsync<ProjectTab[], ProjectEntToTabResultError> =>
          v.projectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.projectsTable
                .findMany({
                  where: inArray(projectsTable.projectId, v.projectIds)
                })
                .then(projectEnts =>
                  Result.sequence(projectEnts, projectEnt =>
                    this.tabService.projectEntToTabResult({
                      projectEnt: projectEnt
                    })
                  )
                )
      ),
      Result.bind(
        'orgIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.projects.map(project => project.orgId))
      ),
      Result.bind(
        'orgs',
        async (v): Result.ResultAsync<OrgTab[], OrgEntToTabResultError> =>
          v.orgIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.orgsTable
                .findMany({
                  where: inArray(orgsTable.orgId, v.orgIds)
                })
                .then(orgEnts =>
                  Result.sequence(orgEnts, orgEnt =>
                    this.tabService.orgEntToTabResult({ orgEnt: orgEnt })
                  )
                )
      ),
      Result.bind(
        'ownerOrgs',
        (v): Result.ResultAsync<OrgTab[], OrgEntToTabResultError> =>
          this.db.drizzle.query.orgsTable
            .findMany({
              where: eq(orgsTable.ownerId, v.user.userId)
            })
            .then(orgEnts =>
              Result.sequence(orgEnts, orgEnt =>
                this.tabService.orgEntToTabResult({ orgEnt: orgEnt })
              )
            )
      ),
      Result.bind(
        'existingOrgIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            ...new Set([...v.orgs, ...v.ownerOrgs].map(org => org.orgId))
          ])
      ),
      Result.bind('resultOrgId', (v): Result.Result<string, never> => {
        let isExistingOrg: boolean = v.existingOrgIds.includes(v.orgId);

        return Result.succeed(
          isDefined(v.orgId) && isExistingOrg ? v.orgId : v.existingOrgIds[0]
        );
      }),
      Result.bind(
        'resultOrg',
        (v): Result.Result<OrgTab, never> =>
          Result.succeed(
            [...v.orgs, ...v.ownerOrgs].find(org => org.orgId === v.resultOrgId)
          )
      ),
      Result.bind(
        'existingProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.projects
              .filter(project => project.orgId === v.resultOrgId)
              .map(project => project.projectId)
          )
      ),
      Result.bind('resultProjectId', (v): Result.Result<string, never> => {
        let isExistingProject: boolean = v.existingProjectIds.includes(
          v.projectId
        );

        return Result.succeed(
          isDefined(v.projectId) && isExistingProject
            ? v.projectId
            : v.existingProjectIds[0]
        );
      }),
      Result.bind(
        'resultProject',
        (v): Result.Result<ProjectTab, never> =>
          Result.succeed(
            v.projects.find(project => project.projectId === v.resultProjectId)
          )
      ),
      Result.bind(
        'bridgeEnt',
        async (v): Result.ResultAsync<BridgeEnt, never> =>
          isUndefined(v.resultProject)
            ? Result.succeed(undefined)
            : this.db.drizzle.query.bridgesTable
                .findFirst({
                  where: and(
                    eq(bridgesTable.projectId, v.resultProject.projectId),
                    eq(bridgesTable.repoId, PROD_REPO_ID),
                    eq(bridgesTable.branchId, v.resultProject.defaultBranch),
                    eq(bridgesTable.envId, PROJECT_ENV_PROD)
                  )
                })
                .then(bridgeEnt => Result.succeed(bridgeEnt))
      ),
      Result.bind(
        'avatar',
        (v): Result.ResultAsync<AvatarTab, AvatarEntToTabResultError> =>
          this.db.drizzle.query.avatarsTable
            .findFirst({
              where: eq(avatarsTable.userId, v.user.userId)
            })
            .then((avatarEnt: AvatarEnt) =>
              isUndefined(avatarEnt)
                ? Result.succeed(undefined)
                : this.tabService.avatarEntToTabResult({ avatarEnt: avatarEnt })
            )
      ),
      Result.bind(
        'isGetRepo',
        (v): Result.Result<boolean, never> =>
          Result.succeed(
            v.getRepo === true &&
              isDefined(v.resultOrgId) &&
              isDefined(v.resultProjectId) &&
              isDefined(v.bridgeEnt)
          )
      ),
      Result.bind(
        'userMember',
        async (
          v
        ): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          v.isGetRepo
            ? this.membersService.getMemberCheckExistsResult({
                projectId: v.resultProject.projectId,
                memberId: v.user.userId
              })
            : Result.succeed(undefined)
      ),
      Result.bind(
        'apiMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(
            v.isGetRepo
              ? this.membersService.tabToApi({ member: v.userMember })
              : undefined
          )
      ),
      Result.bind(
        'struct',
        async (
          v
        ): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          v.isGetRepo
            ? this.structsService.getStructCheckExistsResult({
                structId: v.bridgeEnt.structId,
                projectId: v.resultProject.projectId
              })
            : Result.succeed(undefined)
      ),
      Result.bind(
        'modelPartXs',
        async (
          v
        ): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> =>
          v.isGetRepo
            ? this.modelsService.getModelPartXsResult({
                structId: v.struct.structId,
                apiUserMember: this.membersService.tabToApi({
                  member: v.userMember
                })
              })
            : Result.succeed(undefined)
      ),
      Result.bind(
        'apiStruct',
        (v): Result.Result<StructX, never> =>
          Result.succeed(
            v.isGetRepo
              ? this.structsService.tabToApi({
                  struct: v.struct,
                  modelPartXs: v.modelPartXs
                })
              : undefined
          )
      ),
      Result.bind(
        'diskGetCatalogNodesOutput',
        async (
          v
        ): Result.ResultAsync<
          ToDiskGetCatalogNodesOutput,
          SendToDiskResultError
        > =>
          v.isGetRepo
            ? this.rpcService.sendToDiskResult({
                request: {
                  operation: 'getCatalogNodes',
                  traceId: v.traceId,
                  input: {
                    baseProject: this.tabService.projectTabToBaseProject({
                      project: v.resultProject
                    }),
                    repoId: v.bridgeEnt.repoId,
                    branch: v.bridgeEnt.branchId,
                    isFetch: false
                  }
                }
              })
            : Result.succeed(undefined)
      ),
      Result.map(
        (v): ToBackendGetNavOutput => ({
          avatarSmall: v.avatar?.avatarSmall,
          avatarBig: v.avatar?.avatarBig,
          orgId: v.resultOrgId,
          orgOwnerId: v.resultOrg?.ownerId,
          orgName: v.resultOrg?.name,
          projectId: v.resultProjectId,
          projectName: v.resultProject?.name,
          projectDefaultBranch: v.resultProject?.defaultBranch,
          repoId: PROD_REPO_ID,
          repoType: 'production',
          branchId: v.resultProject?.defaultBranch,
          envId: PROJECT_ENV_PROD,
          needValidate: isDefined(v.bridgeEnt)
            ? v.bridgeEnt.needValidate
            : false,
          user: this.usersService.tabToApi({ user: v.user }),
          serverNowTs: Date.now(),
          isMproveAdmin:
            v.user.email ===
            this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail'),
          userMember: v.apiMember,
          struct: v.apiStruct,
          repo: v.diskGetCatalogNodesOutput?.repo
        })
      )
    );
  }
}
