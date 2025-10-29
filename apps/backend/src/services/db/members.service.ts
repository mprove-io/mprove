import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  BridgeTab,
  MemberTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeFullName } from '~backend/functions/make-full-name';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Member } from '~common/interfaces/backend/member';
import {
  ToDiskCreateDevRepoRequest,
  ToDiskCreateDevRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';
import { ServerError } from '~common/models/server-error';
import { BlockmlService } from '../blockml.service';
import { HashService } from '../hash.service';
import { RabbitService } from '../rabbit.service';
import { TabService } from '../tab.service';
import { BranchesService } from './branches.service';
import { BridgesService } from './bridges.service';

let retry = require('async-retry');

@Injectable()
export class MembersService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rabbitService: RabbitService,
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

  async getMemberCheckIsAdmin(item: { memberId: string; projectId: string }) {
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
        message: ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isAdmin !== true) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_ADMIN
      });
    }

    return member;
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
        message: ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isEditor !== true && member.isAdmin !== true) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN
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
        message: ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isEditor !== true) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR
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
        message: ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
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
        message: ErEnum.BACKEND_MEMBER_ALREADY_EXISTS
      });
    }
  }

  async addMemberToDemoProject(item: {
    user: UserTab;
    traceId: string;
  }) {
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

          let toDiskCreateDevRepoRequest: ToDiskCreateDevRepoRequest = {
            info: {
              name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
              traceId: traceId
            },
            payload: {
              orgId: project.orgId,
              baseProject: baseProject,
              devRepoId: newMember.memberId
            }
          };

          let diskResponse =
            await this.rabbitService.sendToDisk<ToDiskCreateDevRepoResponse>({
              routingKey: makeRoutingKeyToDisk({
                orgId: project.orgId,
                projectId: demoProjectId
              }),
              message: toDiskCreateDevRepoRequest,
              checkIsOk: true
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
                projectId: demoProjectId,
                structId,
                diskFiles: diskResponse.payload.files,
                mproveDir: diskResponse.payload.mproveDir,
                envId: x.envId,
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

  async addDemoMemberToDemoProject(item: {
    user: UserTab;
  }) {
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
