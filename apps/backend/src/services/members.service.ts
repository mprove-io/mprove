import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
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
    private cs: ConfigService<interfaces.Config>,
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

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isAdmin !== true) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_ADMIN
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

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isEditor !== true && member.isAdmin !== true) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN
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

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.isEditor !== true) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR
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

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
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

    if (common.isDefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_ALREADY_EXISTS
      });
    }
  }

  async addMemberToFirstProject(item: {
    user: schemaPostgres.UserEnt;
    traceId: string;
  }) {
    let { user, traceId } = item;

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (common.isDefined(firstProjectId)) {
      let project = await this.db.drizzle.query.projectsTable.findFirst({
        where: eq(projectsTable.projectId, firstProjectId)
      });

      if (common.isDefined(project)) {
        let member = await this.db.drizzle.query.membersTable.findFirst({
          where: and(
            eq(membersTable.memberId, user.userId),
            eq(membersTable.projectId, firstProjectId)
          )
        });

        if (common.isUndefined(member)) {
          let newMember: schemaPostgres.MemberEnt =
            this.makerService.makeMember({
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
                routingKey: helper.makeRoutingKeyToDisk({
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
              eq(branchesTable.repoId, common.PROD_REPO_ID),
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

          let devBranchBridges: schemaPostgres.BridgeEnt[] = [];

          prodBranchBridges.forEach(x => {
            let devBranchBridge = this.makerService.makeBridge({
              projectId: devBranch.projectId,
              repoId: devBranch.repoId,
              branchId: devBranch.branchId,
              envId: x.envId,
              structId: common.EMPTY_STRUCT_ID,
              needValidate: true
            });

            devBranchBridges.push(devBranchBridge);
          });

          await forEachSeries(devBranchBridges, async x => {
            if (x.envId === common.PROJECT_ENV_PROD) {
              let structId = common.makeId();

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
              x.structId = common.EMPTY_STRUCT_ID;
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
