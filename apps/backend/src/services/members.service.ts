import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { BlockmlService } from './blockml.service';
import { MakerService } from './maker.service';
import { RabbitService } from './rabbit.service';

let retry = require('async-retry');

@Injectable()
export class MembersService {
  constructor(
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private makerService: MakerService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getMemberCheckIsAdmin(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.db.drizzle.query.membersTable.findFirst({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

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

    let member = await this.db.drizzle.query.membersTable.findFirst({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

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

    let member = await this.db.drizzle.query.membersTable.findFirst({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

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

    let member = await this.db.drizzle.query.membersTable.findFirst({
      where: and(
        eq(membersTable.memberId, memberId),
        eq(membersTable.projectId, projectId)
      )
    });

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

  async addMemberToFirstProject(item: {
    user: UserEnt;
    traceId: string;
  }) {
    let { user, traceId } = item;

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (isDefined(firstProjectId)) {
      let project = await this.db.drizzle.query.projectsTable.findFirst({
        where: eq(projectsTable.projectId, firstProjectId)
      });

      if (isDefined(project)) {
        let member = await this.db.drizzle.query.membersTable.findFirst({
          where: and(
            eq(membersTable.memberId, user.userId),
            eq(membersTable.projectId, firstProjectId)
          )
        });

        if (isUndefined(member)) {
          let newMember: MemberEnt = this.makerService.makeMember({
            projectId: firstProjectId,
            user: user,
            isAdmin: false,
            isEditor: true,
            isExplorer: true
          });

          let toDiskCreateDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest =
            {
              info: {
                name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
                traceId: traceId
              },
              payload: {
                orgId: project.orgId,
                projectId: firstProjectId,
                devRepoId: newMember.memberId,
                remoteType: project.remoteType,
                gitUrl: project.gitUrl,
                privateKey: project.privateKey,
                publicKey: project.publicKey
              }
            };

          let diskResponse =
            await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateDevRepoResponse>(
              {
                routingKey: makeRoutingKeyToDisk({
                  orgId: project.orgId,
                  projectId: firstProjectId
                }),
                message: toDiskCreateDevRepoRequest,
                checkIsOk: true
              }
            );

          let prodBranch = await this.db.drizzle.query.branchesTable.findFirst({
            where: and(
              eq(branchesTable.projectId, firstProjectId),
              eq(branchesTable.repoId, PROD_REPO_ID),
              eq(branchesTable.branchId, project.defaultBranch)
            )
          });

          let devBranch = this.makerService.makeBranch({
            projectId: firstProjectId,
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

          let devBranchBridges: BridgeEnt[] = [];

          prodBranchBridges.forEach(x => {
            let devBranchBridge = this.makerService.makeBridge({
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
                projectId: firstProjectId,
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
}
