import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { TabProps } from '#backend/types/tab-props';
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
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { GetTabPropsResultError } from '#common/types/backend/function-errors/get-tab-props-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToDiskCreateDevRepoOutput } from '#common/types/disk/routes/repos/create-dev-repo/create-dev-repo-output';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';

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

  async getMemberCheckIsAdmin(item: {
    memberId: string;
    projectId: string;
  }): Promise<MemberTab> {
    let result: Result.Result<MemberTab, GetMemberCheckIsAdminResultError> =
      await this.getMemberCheckIsAdminResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let member: MemberTab = result.value;

    return member;
  }

  async getMemberCheckIsAdminResult(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> {
    return Result.pipe(
      Result.succeed({
        memberId: item.memberId,
        projectId: item.projectId,
        db: this.db,
        tabService: this.tabService
      }),
      Result.bind(
        'memberEnt',
        async (
          v
        ): Result.ResultAsync<MemberEnt, BackendMemberDoesNotExistError> => {
          let memberEnt: MemberEnt =
            await v.db.drizzle.query.membersTable.findFirst({
              where: and(
                eq(membersTable.memberId, v.memberId),
                eq(membersTable.projectId, v.projectId)
              )
            });

          if (isUndefined(memberEnt)) {
            return Result.fail({ code: 'BACKEND_MEMBER_DOES_NOT_EXIST' });
          }

          return Result.succeed(memberEnt);
        }
      ),
      Result.andThrough(v =>
        v.memberEnt.isAdmin === true
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_ADMIN' })
      ),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<MemberSt, MemberLt>,
          GetTabPropsResultError
        > =>
          v.tabService.getTabPropsResult<MemberSt, MemberLt>({
            ent: v.memberEnt
          })
      ),
      Result.map(
        (v): MemberTab => ({
          ...v.memberEnt,
          ...v.tabProps.props
        })
      )
    );
  }

  async getMemberCheckIsEditorOrAdmin(item: {
    memberId: string;
    projectId: string;
  }) {
    let { projectId, memberId } = item;

    let member = await this.db.drizzle.query.membersTable
      .findFirst({
        where: and(
          eq(membersTable.memberId, memberId),
          eq(membersTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.memberEntToTab(x));

    if (isUndefined(member)) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_DOES_NOT_EXIST'
      });
    }

    if (member.isEditor !== true && member.isAdmin !== true) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN'
      });
    }

    return member;
  }

  async getMemberCheckIsEditor(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.db.drizzle.query.membersTable
      .findFirst({
        where: and(
          eq(membersTable.memberId, memberId),
          eq(membersTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.memberEntToTab(x));

    if (isUndefined(member)) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_DOES_NOT_EXIST'
      });
    }

    if (member.isEditor !== true) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_IS_NOT_EDITOR'
      });
    }

    return member;
  }

  async getMemberCheckExists(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.db.drizzle.query.membersTable
      .findFirst({
        where: and(
          eq(membersTable.memberId, memberId),
          eq(membersTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.memberEntToTab(x));

    if (isUndefined(member)) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_DOES_NOT_EXIST'
      });
    }

    return member;
  }

  async checkMemberDoesNotExist(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.db.drizzle.query.membersTable.findFirst({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

    if (isDefined(member)) {
      throw new ServerError({
        message: 'BACKEND_MEMBER_ALREADY_EXISTS'
      });
    }
  }

  async addMemberToDemoProject(item: { user: UserTab; traceId: string }) {
    let { user, traceId } = item;

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
            isEditor: true,
            isExplorer: true
          });

          let baseProject = this.tabService.projectTabToBaseProject({
            project: project
          });

          let diskCreateDevRepoOutput: ToDiskCreateDevRepoOutput =
            await this.rpcService.sendToDiskUnwrapOutput({
              request: {
                operation: 'createDevRepo',
                traceId: traceId,
                input: {
                  baseProject: baseProject,
                  devRepoId: newMember.memberId
                }
              }
            });

          let prodBranch = await this.db.drizzle.query.branchesTable.findFirst({
            where: and(
              eq(branchesTable.projectId, demoProjectId),
              eq(branchesTable.repoId, PROD_REPO_ID),
              eq(branchesTable.branchId, project.defaultBranch)
            )
          });

          let devBranch = this.branchesService.makeBranch({
            projectId: demoProjectId,
            repoId: newMember.memberId,
            branchId: project.defaultBranch
          });

          let prodBranchBridges =
            await this.db.drizzle.query.bridgesTable.findMany({
              where: and(
                eq(bridgesTable.projectId, prodBranch.projectId),
                eq(bridgesTable.repoId, prodBranch.repoId),
                eq(bridgesTable.branchId, prodBranch.branchId)
              )
            });

          let devBranchBridges: BridgeTab[] = [];

          prodBranchBridges.forEach(x => {
            let devBranchBridge = this.bridgesService.makeBridge({
              projectId: devBranch.projectId,
              repoId: devBranch.repoId,
              branchId: devBranch.branchId,
              envId: x.envId,
              structId: EMPTY_STRUCT_ID,
              needValidate: true
            });

            devBranchBridges.push(devBranchBridge);
          });

          await forEachSeries(devBranchBridges, async x => {
            if (x.envId === PROJECT_ENV_PROD) {
              let structId = makeId();

              await this.blockmlService.rebuildStruct({
                traceId,
                orgId: project.orgId,
                projectId: demoProjectId,
                repoId: user.userId,
                structId,
                diskFiles: diskCreateDevRepoOutput.files,
                mproveDir: diskCreateDevRepoOutput.mproveDir,
                envId: x.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              x.structId = structId;
              x.needValidate = false;
            } else {
              x.structId = EMPTY_STRUCT_ID;
              x.needValidate = true;
            }
          });

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      members: [newMember],
                      branches: [devBranch],
                      bridges: [...devBranchBridges]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );
        }
      }
    }
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
