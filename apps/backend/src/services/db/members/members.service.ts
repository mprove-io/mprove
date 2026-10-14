import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { AddMemberToDemoProjectError } from '#common/types/backend/function-errors/add-member-to-demo-project-error';
import type { CheckMemberDoesNotExistError } from '#common/types/backend/function-errors/check-member-does-not-exist-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetMemberCheckIsEditorOrAdminError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { Member } from '#common/types/backend/parts/member';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToDiskCreateDevRepoOutput } from '#common/types/disk/routes/repos/create-dev-repo/create-dev-repo-output';

const { forEachSeries } = pIteration;

@Injectable()
export class MembersService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeMember(item: {
    projectId: string;
    roles?: string[];
    user: UserTab;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }): MemberTab {
    let { projectId, roles, user, isAdmin, isEditor, isExplorer } = item;

    let member: MemberTab = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: projectId,
        memberId: user.userId
      }),
      projectId: projectId,
      memberId: user.userId,
      isAdmin: isAdmin,
      isEditor: isEditor,
      isExplorer: isExplorer,
      email: user.email,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roles || [],
      emailHash: undefined, // tab-to-ent
      aliasHash: undefined, // tab-to-ent
      keyTag: undefined,
      serverTs: undefined
    };

    return member;
  }

  tabToApi(item: { member: MemberTab }): Member {
    let { member } = item;

    let apiMember: Member = {
      projectId: member.projectId,
      memberId: member.memberId,
      email: member.email,
      alias: member.alias,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: makeFullName({
        firstName: member.firstName,
        lastName: member.lastName
      }),
      avatarSmall: undefined, // TODO: add avatar in tabToApi method?
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.roles,
      serverTs: member.serverTs
    };

    return apiMember;
  }

  async getMemberCheckIsAdminResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'memberEnt',
        (v): Result.ResultAsync<MemberEnt, BackendMemberDoesNotExistError> =>
          this.db.drizzle.query.membersTable
            .findFirst({
              where: and(
                eq(membersTable.memberId, v.memberId),
                eq(membersTable.projectId, v.projectId)
              )
            })
            .then((memberEnt: MemberEnt) =>
              isUndefined(memberEnt)
                ? Result.fail({ code: 'BACKEND_MEMBER_DOES_NOT_EXIST' })
                : Result.succeed(memberEnt)
            )
      ),
      Result.andThrough(v =>
        v.memberEnt.isAdmin === true
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_ADMIN' })
      ),
      Result.andThen(
        (v): Result.Result<MemberTab, MemberEntToTabError> =>
          this.tabService.memberEntToTabResult({ memberEnt: v.memberEnt })
      )
    );
  }

  async getMemberCheckIsEditorOrAdminResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorOrAdminError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.getMemberCheckExistsResult({
            memberId: v.memberId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        v.member.isEditor !== true && v.member.isAdmin !== true
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN' })
          : Result.succeed()
      ),
      Result.map((v): MemberTab => v.member)
    );
  }

  async getMemberCheckIsEditorResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.memberId
          })
      ),
      Result.andThrough(v =>
        v.member.isEditor !== true
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EDITOR' })
          : Result.succeed()
      ),
      Result.map((v): MemberTab => v.member)
    );
  }

  async getMemberCheckExists(item: {
    memberId: string;
    projectId: string;
  }): Promise<MemberTab> {
    let result: Result.Result<MemberTab, GetMemberCheckExistsError> =
      await this.getMemberCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let member: MemberTab = result.value;

    return member;
  }

  async getMemberCheckExistsResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> {
    let { projectId, memberId } = item;

    return this.db.drizzle.query.membersTable
      .findFirst({
        where: and(
          eq(membersTable.memberId, memberId),
          eq(membersTable.projectId, projectId)
        )
      })
      .then((x: MemberEnt) =>
        isUndefined(x)
          ? Result.fail({ code: 'BACKEND_MEMBER_DOES_NOT_EXIST' })
          : this.tabService.memberEntToTabResult({ memberEnt: x })
      );
  }

  async checkMemberDoesNotExistResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<void, CheckMemberDoesNotExistError> {
    let { projectId, memberId } = item;

    let memberEnt: MemberEnt =
      await this.db.drizzle.query.membersTable.findFirst({
        where: and(
          eq(membersTable.memberId, memberId),
          eq(membersTable.projectId, projectId)
        )
      });

    return isDefined(memberEnt)
      ? Result.fail({ code: 'BACKEND_MEMBER_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async addMemberToDemoProjectResult(item: {
    user: UserTab;
    traceId: string;
  }): Result.ResultAsync<void, AddMemberToDemoProjectError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        demoProjectId:
          this.cs.get<BackendConfig['demoProjectId']>('demoProjectId')
      }),
      Result.bind(
        'project',
        async (v): Result.ResultAsync<ProjectTab, ProjectEntToTabError> =>
          isUndefined(v.demoProjectId)
            ? Result.succeed(undefined)
            : this.db.drizzle.query.projectsTable
                .findFirst({
                  where: eq(projectsTable.projectId, v.demoProjectId)
                })
                .then(x =>
                  isUndefined(x)
                    ? Result.succeed(undefined)
                    : this.tabService.projectEntToTabResult({ projectEnt: x })
                )
      ),
      Result.bind(
        'member',
        async (v): Result.ResultAsync<MemberTab, MemberEntToTabError> =>
          isUndefined(v.project)
            ? Result.succeed(undefined)
            : this.db.drizzle.query.membersTable
                .findFirst({
                  where: and(
                    eq(membersTable.memberId, v.user.userId),
                    eq(membersTable.projectId, v.demoProjectId)
                  )
                })
                .then(x =>
                  isUndefined(x)
                    ? Result.succeed(undefined)
                    : this.tabService.memberEntToTabResult({ memberEnt: x })
                )
      ),
      Result.bind(
        'newMember',
        (v): Result.Result<MemberTab, never> =>
          Result.succeed(
            isUndefined(v.project) || isDefined(v.member)
              ? undefined
              : this.makeMember({
                  projectId: v.demoProjectId,
                  user: v.user,
                  isAdmin: false,
                  isEditor: true,
                  isExplorer: true
                })
          )
      ),
      Result.bind(
        'baseProject',
        (v): Result.Result<BaseProject, never> =>
          Result.succeed(
            isUndefined(v.newMember)
              ? undefined
              : this.tabService.projectTabToBaseProject({ project: v.project })
          )
      ),
      Result.bind(
        'diskCreateDevRepoOutput',
        async (
          v
        ): Result.ResultAsync<ToDiskCreateDevRepoOutput, SendToDiskError> =>
          isUndefined(v.newMember)
            ? Result.succeed(undefined)
            : this.rpcService.sendToDiskResult({
                request: {
                  operation: 'createDevRepo',
                  traceId: v.traceId,
                  input: {
                    baseProject: v.baseProject,
                    devRepoId: v.newMember.memberId
                  }
                }
              })
      ),
      Result.bind(
        'prodBranchEnt',
        async (v): Result.ResultAsync<BranchEnt, never> =>
          isUndefined(v.newMember)
            ? Result.succeed(undefined)
            : this.db.drizzle.query.branchesTable
                .findFirst({
                  where: and(
                    eq(branchesTable.projectId, v.demoProjectId),
                    eq(branchesTable.repoId, PROD_REPO_ID),
                    eq(branchesTable.branchId, v.project.defaultBranch)
                  )
                })
                .then(x => Result.succeed(x))
      ),
      Result.bind(
        'devBranch',
        (v): Result.Result<BranchTab, never> =>
          Result.succeed(
            isUndefined(v.newMember)
              ? undefined
              : this.branchesService.makeBranch({
                  projectId: v.demoProjectId,
                  repoId: v.newMember.memberId,
                  branchId: v.project.defaultBranch
                })
          )
      ),
      Result.bind(
        'prodBranchBridgeEnts',
        async (v): Result.ResultAsync<BridgeEnt[], never> =>
          isUndefined(v.newMember)
            ? Result.succeed([])
            : this.db.drizzle.query.bridgesTable
                .findMany({
                  where: and(
                    eq(bridgesTable.projectId, v.prodBranchEnt.projectId),
                    eq(bridgesTable.repoId, v.prodBranchEnt.repoId),
                    eq(bridgesTable.branchId, v.prodBranchEnt.branchId)
                  )
                })
                .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'devBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.prodBranchBridgeEnts.map(bridgeEnt =>
              this.bridgesService.makeBridge({
                projectId: v.devBranch.projectId,
                repoId: v.devBranch.repoId,
                branchId: v.devBranch.branchId,
                envId: bridgeEnt.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        Result.sequence(v.devBranchBridges, async bridge => {
          if (bridge.envId !== PROJECT_ENV_PROD) {
            bridge.structId = EMPTY_STRUCT_ID;
            bridge.needValidate = true;

            return Result.succeed();
          }

          let structId: string = makeId();

          let rebuildStructOutput: Result.Result<
            RebuildStructOutput,
            RebuildStructError
          > = await this.blockmlService.rebuildStructResult({
            traceId: v.traceId,
            orgId: v.project.orgId,
            projectId: v.demoProjectId,
            repoId: v.user.userId,
            structId: structId,
            diskFiles: v.diskCreateDevRepoOutput.files,
            mproveDir: v.diskCreateDevRepoOutput.mproveDir,
            envId: bridge.envId,
            selectedGivens: [],
            overrideTimezone: undefined
          });

          if (Result.isFailure(rebuildStructOutput)) {
            return Result.fail(rebuildStructOutput.error);
          }

          bridge.structId = structId;
          bridge.needValidate = false;

          return Result.succeed();
        })
      ),
      Result.andThrough(v =>
        isUndefined(v.newMember)
          ? Result.succeed()
          : dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            members: [v.newMember],
                            branches: [v.devBranch],
                            bridges: [...v.devBranchBridges]
                          }
                        })
                    ),
                  getRetryOption(this.cs, this.logger)
                );
              }
            })
      ),
      Result.map((v): void => undefined)
    );
  }

  async addDemoMemberToDemoProject(item: { user: UserTab }) {
    let { user } = item;

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (isDefined(demoProjectId)) {
      let project = await this.db.drizzle.query.projectsTable
        .findFirst({
          where: eq(projectsTable.projectId, demoProjectId)
        })
        .then(x => this.tabService.projectEntToTab(x));

      if (isDefined(project)) {
        let member = await this.db.drizzle.query.membersTable
          .findFirst({
            where: and(
              eq(membersTable.memberId, user.userId),
              eq(membersTable.projectId, demoProjectId)
            )
          })
          .then(x => this.tabService.memberEntToTab(x));

        if (isUndefined(member)) {
          let newMember: MemberTab = this.makeMember({
            projectId: demoProjectId,
            user: user,
            isAdmin: false,
            isEditor: false,
            isExplorer: true
          });

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      members: [newMember]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );
        }
      }
    }
  }
}
