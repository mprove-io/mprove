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
import retry from 'async-retry';
import { eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { OrgsService } from '#backend/services/db/orgs.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteOrgRequest } from '#common/interfaces/to-backend/orgs/to-backend-delete-org';
import {
  ToDiskDeleteOrgRequest,
  ToDiskDeleteOrgResponse
} from '#common/interfaces/to-disk/01-orgs/to-disk-delete-org';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteOrgController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteOrg)
  async deleteOrg(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteOrgRequest = request.body;

    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let toDiskDeleteOrgRequest: ToDiskDeleteOrgRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: org.orgId
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskDeleteOrgResponse>({
        orgId: orgId,
        projectId: null,
        repoId: null,
        message: toDiskDeleteOrgRequest,
        checkIsOk: true
      });

    let projects = await this.db.drizzle.query.projectsTable.findMany({
      where: eq(projectsTable.orgId, orgId)
    });

    let projectIds = projects.map(x => x.projectId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx.delete(orgsTable).where(eq(orgsTable.orgId, orgId));

          if (projectIds.length > 0) {
            await tx
              .delete(projectsTable)
              .where(inArray(projectsTable.projectId, projectIds));

            await tx
              .delete(membersTable)
              .where(inArray(membersTable.projectId, projectIds));

            await tx
              .delete(connectionsTable)
              .where(inArray(connectionsTable.projectId, projectIds));

            await tx
              .delete(envsTable)
              .where(inArray(envsTable.projectId, projectIds));

            await tx
              .delete(branchesTable)
              .where(inArray(branchesTable.projectId, projectIds));

            await tx
              .delete(bridgesTable)
              .where(inArray(bridgesTable.projectId, projectIds));
          }
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
