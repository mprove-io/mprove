import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteUserController {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser)
  async deleteUser(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendDeleteUserRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;

    let ownerOrgs = await this.db.drizzle.query.orgsTable.findMany({
      where: eq(orgsTable.ownerId, user.userId)
    });

    if (ownerOrgs.length > 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_IS_ORG_OWNER,
        data: {
          orgIds: ownerOrgs.map(x => x.orgId)
        }
      });
    }

    let userAdminMembers = await this.db.drizzle.query.membersTable.findMany({
      where: and(
        eq(membersTable.memberId, user.userId),
        eq(membersTable.isAdmin, true)
      )
    });

    let userAdminProjectIds = userAdminMembers.map(x => x.projectId);

    let admins =
      userAdminProjectIds.length === 0
        ? []
        : await this.db.drizzle.query.membersTable.findMany({
            where: and(
              inArray(membersTable.projectId, userAdminProjectIds),
              eq(membersTable.isAdmin, true)
            )
          });

    let erProjectIds: string[] = [];

    userAdminProjectIds.forEach(projectId => {
      let projectAdmins = admins.filter(x => x.projectId === projectId);
      if (projectAdmins.length === 1) {
        erProjectIds.push(projectId);
      }
    });

    if (erProjectIds.length > 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN,
        data: {
          projectIds: erProjectIds
        }
      });
    }

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let projectIds = userMembers.map(x => x.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: inArray(projectsTable.projectId, projectIds)
          });

    await asyncPool(1, userMembers, async (m: MemberEnt) => {
      let project = projects.find(p => p.projectId === m.projectId);

      let toDiskDeleteDevRepoRequest: apiToDisk.ToDiskDeleteDevRepoRequest = {
        info: {
          name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
          traceId: traceId
        },
        payload: {
          orgId: project.orgId,
          projectId: project.projectId,
          devRepoId: user.userId
        }
      };

      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteDevRepoResponse>(
        {
          routingKey: makeRoutingKeyToDisk({
            orgId: project.orgId,
            projectId: project.projectId
          }),
          message: toDiskDeleteDevRepoRequest,
          checkIsOk: true
        }
      );
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx.delete(usersTable).where(eq(usersTable.userId, user.userId));
          await tx
            .delete(membersTable)
            .where(eq(membersTable.memberId, user.userId));
          await tx
            .delete(branchesTable)
            .where(eq(branchesTable.repoId, user.alias));
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
