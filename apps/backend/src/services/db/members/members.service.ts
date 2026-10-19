import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
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
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { AddMemberToDemoProjectError } from '#common/types/backend/function-errors/add-member-to-demo-project-error';
import type { BranchEntToTabError } from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { CheckMemberDoesNotExistError } from '#common/types/backend/function-errors/check-member-does-not-exist-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetMemberCheckIsEditorOrAdminError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
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
    private db: DbService
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
          this.tabService.memberEntToTab({ memberEnt: v.memberEnt })
      )
    );
  }

  async getMemberCheckIsEditorOrAdmin(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorOrAdminError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.memberId),
              eq(membersTable.projectId, v.projectId)
            )
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

  async getMemberCheckIsEditor(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.memberId),
              eq(membersTable.projectId, v.projectId)
            )
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

  async checkMemberDoesNotExist(item: {
    memberId: string;
    projectId: string;
  }): Result.ResultAsync<void, CheckMemberDoesNotExistError> {
    let { projectId, memberId } = item;

    let isMemberExist: boolean = await this.db.members.isExistUnwrap({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

    return isMemberExist
      ? Result.fail({ code: 'BACKEND_MEMBER_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async addMemberToDemoProject(item: {
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
            : this.db.projects.findFirst({
                where: eq(projectsTable.projectId, v.demoProjectId)
              })
      ),
      Result.bind(
        'member',
        async (v): Result.ResultAsync<MemberTab, MemberEntToTabError> =>
          isUndefined(v.project)
            ? Result.succeed(undefined)
            : this.db.members.findFirst({
                where: and(
                  eq(membersTable.memberId, v.user.userId),
                  eq(membersTable.projectId, v.demoProjectId)
                )
              })
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
            : this.rpcService.sendToDisk({
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
        'prodBranch',
        async (v): Result.ResultAsync<BranchTab, BranchEntToTabError> =>
          isUndefined(v.newMember)
            ? Result.succeed(undefined)
            : this.db.branches.findFirst({
                where: and(
                  eq(branchesTable.projectId, v.demoProjectId),
                  eq(branchesTable.repoId, PROD_REPO_ID),
                  eq(branchesTable.branchId, v.project.defaultBranch)
                )
              })
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
        'prodBranchBridges',
        async (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          isUndefined(v.newMember)
            ? Result.succeed([])
            : this.db.bridges.findMany({
                where: and(
                  eq(bridgesTable.projectId, v.prodBranch.projectId),
                  eq(bridgesTable.repoId, v.prodBranch.repoId),
                  eq(bridgesTable.branchId, v.prodBranch.branchId)
                )
              })
      ),
      Result.bind(
        'devBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.prodBranchBridges.map(bridge =>
              this.bridgesService.makeBridge({
                projectId: v.devBranch.projectId,
                repoId: v.devBranch.repoId,
                branchId: v.devBranch.branchId,
                envId: bridge.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        isUndefined(v.newMember)
          ? Result.succeed()
          : this.blockmlService.rebuildBranchBridges({
              branchBridges: v.devBranchBridges,
              envId: PROJECT_ENV_PROD,
              traceId: v.traceId,
              orgId: v.project.orgId,
              projectId: v.demoProjectId,
              repoId: v.user.userId,
              diskFiles: v.diskCreateDevRepoOutput.files,
              mproveDir: v.diskCreateDevRepoOutput.mproveDir
            })
      ),
      Result.andThrough(v =>
        isUndefined(v.newMember)
          ? Result.succeed()
          : this.db.write({
              insertOrUpdate: {
                members: [v.newMember],
                branches: [v.devBranch],
                bridges: [...v.devBranchBridges]
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
      let project: ProjectTab = await this.db.projects.findFirstUnwrap({
        where: eq(projectsTable.projectId, demoProjectId)
      });

      if (isDefined(project)) {
        let member: MemberTab = await this.db.members.findFirstUnwrap({
          where: and(
            eq(membersTable.memberId, user.userId),
            eq(membersTable.projectId, demoProjectId)
          )
        });

        if (isUndefined(member)) {
          let newMember: MemberTab = this.makeMember({
            projectId: demoProjectId,
            user: user,
            isAdmin: false,
            isEditor: false,
            isExplorer: true
          });

          await this.db.writeUnwrap({
            insertOrUpdate: {
              members: [newMember]
            }
          });
        }
      }
    }
  }
}
