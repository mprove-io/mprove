import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { structsTable } from '~backend/drizzle/postgres/schema/structs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { HashService } from '~backend/services/hash.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendDeleteRecordsRequest,
  ToBackendDeleteRecordsResponse
} from '~common/interfaces/to-backend/test-routes/to-backend-delete-records';
import {
  ToDiskDeleteOrgRequest,
  ToDiskDeleteOrgResponse
} from '~common/interfaces/to-disk/01-orgs/to-disk-delete-org';

let retry = require('async-retry');

@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard, ValidateRequestGuard)
@Controller()
export class DeleteRecordsController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(@Req() request: any) {
    let reqValid: ToBackendDeleteRecordsRequest = request.body;

    let { orgIds, projectIds, emails, orgNames, projectNames } =
      reqValid.payload;

    emails = emails || [];
    projectIds = projectIds || [];
    orgIds = orgIds || [];

    let structIds: string[] = [];
    let userIds: string[] = [];

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    if (isDefined(projectNames) && projectNames.length > 0) {
      let projectNameHashes = projectNames.map(projectName =>
        this.hashService.makeHash({
          input: projectName,
          hashSecret: hashSecret
        })
      );

      let projects = await this.db.drizzle.query.projectsTable.findMany({
        where: and(
          inArray(projectsTable.orgId, orgIds),
          inArray(projectsTable.nameHash, projectNameHashes)
        )
      });

      if (projects.length > 0) {
        projectIds = [...projectIds, ...projects.map(x => x.projectId)];
      }
    }

    if (isDefined(orgNames) && orgNames.length > 0) {
      let orgNameHashes = orgNames.map(orgName =>
        this.hashService.makeHash({
          input: orgName,
          hashSecret: hashSecret
        })
      );

      let orgs = await this.db.drizzle.query.orgsTable.findMany({
        where: inArray(orgsTable.nameHash, orgNameHashes)
      });

      if (orgs.length > 0) {
        orgIds = [...orgIds, ...orgs.map(x => x.orgId)];
      }
    }

    if (orgIds.length > 0) {
      await asyncPool(1, orgIds, async (x: string) => {
        let deleteOrgRequest: ToDiskDeleteOrgRequest = {
          info: {
            name: ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: x
          }
        };

        await this.rpcService.sendToDisk<ToDiskDeleteOrgResponse>({
          orgId: x,
          projectId: null,
          repoId: null,
          message: deleteOrgRequest,
          checkIsOk: true
        });
      });
    }

    if (emails.length > 0) {
      await asyncPool(1, emails, async (email: string) => {
        let emailHash = this.hashService.makeHash({
          input: email,
          hashSecret: hashSecret
        });

        let user = await this.db.drizzle.query.usersTable.findFirst({
          where: eq(usersTable.emailHash, emailHash)
        });

        if (isDefined(user)) {
          userIds.push(user.userId);
        }
      });
    }

    let structs =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.structsTable.findMany({
            where: inArray(structsTable.projectId, projectIds)
          });

    structIds = structs.map(struct => struct.structId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (userIds.length > 0) {
            await tx
              .delete(usersTable)
              .where(inArray(usersTable.userId, userIds));

            await tx
              .delete(avatarsTable)
              .where(inArray(avatarsTable.userId, userIds));

            await tx
              .delete(membersTable)
              .where(inArray(membersTable.memberId, userIds));
          }

          if (orgIds.length > 0) {
            await tx.delete(orgsTable).where(inArray(orgsTable.orgId, orgIds));
          }

          if (projectIds.length > 0) {
            await tx
              .delete(projectsTable)
              .where(inArray(projectsTable.projectId, projectIds));

            await tx
              .delete(connectionsTable)
              .where(inArray(connectionsTable.projectId, projectIds));

            await tx
              .delete(branchesTable)
              .where(inArray(branchesTable.projectId, projectIds));

            await tx
              .delete(bridgesTable)
              .where(inArray(bridgesTable.projectId, projectIds));

            await tx
              .delete(envsTable)
              .where(inArray(envsTable.projectId, projectIds));

            await tx
              .delete(queriesTable)
              .where(inArray(queriesTable.projectId, projectIds));
          }

          if (structIds.length > 0) {
            await tx
              .delete(structsTable)
              .where(inArray(structsTable.structId, structIds));

            await tx
              .delete(modelsTable)
              .where(inArray(modelsTable.structId, structIds));

            await tx
              .delete(chartsTable)
              .where(inArray(chartsTable.structId, structIds));

            await tx
              .delete(dashboardsTable)
              .where(inArray(dashboardsTable.structId, structIds));

            await this.db.drizzle
              .delete(reportsTable)
              .where(inArray(reportsTable.structId, structIds));

            await this.db.drizzle
              .delete(kitsTable)
              .where(inArray(kitsTable.structId, structIds));

            await tx
              .delete(mconfigsTable)
              .where(inArray(mconfigsTable.structId, structIds));
          }
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
