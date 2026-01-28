import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteUserRequest } from '#common/interfaces/to-backend/users/to-backend-delete-user';
import {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponse
} from '#common/interfaces/to-disk/03-repos/to-disk-delete-dev-repo';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import {
  MemberEnt,
  membersTable
} from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteUserController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteUser)
  async deleteUser(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteUserRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;

    let ownerOrgs = await this.db.drizzle.query.orgsTable.findMany({
      where: eq(orgsTable.ownerId, user.userId)
    });

    if (ownerOrgs.length > 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_IS_ORG_OWNER,
        displayData: {
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
        displayData: {
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
        : await this.db.drizzle.query.projectsTable
            .findMany({
              where: inArray(projectsTable.projectId, projectIds)
            })
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    await asyncPool(1, userMembers, async (m: MemberEnt) => {
      let project = projects.find(p => p.projectId === m.projectId);

      let baseProject = this.tabService.projectTabToBaseProject({
        project: project
      });

      let toDiskDeleteDevRepoRequest: ToDiskDeleteDevRepoRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
          traceId: traceId
        },
        payload: {
          orgId: project.orgId,
          projectId: project.projectId,
          baseProject: baseProject,
          devRepoId: user.userId
        }
      };

      await this.rpcService.sendToDisk<ToDiskDeleteDevRepoResponse>({
        orgId: project.orgId,
        projectId: project.projectId,
        repoId: user.userId,
        message: toDiskDeleteDevRepoRequest,
        checkIsOk: true
      });
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
