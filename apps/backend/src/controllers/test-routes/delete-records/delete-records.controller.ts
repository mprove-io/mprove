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
import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { structsTable } from '~backend/drizzle/postgres/schema/structs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteRecordsController {
  constructor(
    private rabbitService: RabbitService,
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

    if (isDefined(projectNames) && projectNames.length > 0) {
      let projects = await this.db.drizzle.query.projectsTable.findMany({
        where: and(
          inArray(projectsTable.orgId, orgIds),
          inArray(projectsTable.name, projectNames)
        )
      });

      if (projects.length > 0) {
        projectIds = [...projectIds, ...projects.map(x => x.projectId)];
      }
    }

    if (isDefined(orgNames) && orgNames.length > 0) {
      let orgs = await this.db.drizzle.query.orgsTable.findMany({
        where: inArray(orgsTable.name, orgNames)
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

        await this.rabbitService.sendToDisk<ToDiskDeleteOrgResponse>({
          routingKey: makeRoutingKeyToDisk({
            orgId: x,
            projectId: null
          }),
          message: deleteOrgRequest,
          checkIsOk: true
        });
      });
    }

    if (emails.length > 0) {
      await asyncPool(1, emails, async (email: string) => {
        let user = await this.db.drizzle.query.usersTable.findFirst({
          where: eq(usersTable.email, email)
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
          }
          if (orgIds.length > 0) {
            await tx.delete(orgsTable).where(inArray(orgsTable.orgId, orgIds));
          }
          if (projectIds.length > 0) {
            await tx
              .delete(projectsTable)
              .where(inArray(projectsTable.projectId, projectIds));
          }
          if (userIds.length > 0) {
            await tx
              .delete(membersTable)
              .where(inArray(membersTable.memberId, userIds));
          }
          if (projectIds.length > 0) {
            await tx
              .delete(connectionsTable)
              .where(inArray(connectionsTable.projectId, projectIds));
          }
          if (structIds.length > 0) {
            await tx
              .delete(structsTable)
              .where(inArray(structsTable.structId, structIds));
          }
          if (projectIds.length > 0) {
            await tx
              .delete(branchesTable)
              .where(inArray(branchesTable.projectId, projectIds));

            await tx
              .delete(bridgesTable)
              .where(inArray(bridgesTable.projectId, projectIds));

            await tx
              .delete(envsTable)
              .where(inArray(envsTable.projectId, projectIds));
          }
          if (structIds.length > 0) {
            await tx
              .delete(chartsTable)
              .where(inArray(chartsTable.structId, structIds));
          }
          if (projectIds.length > 0) {
            await tx
              .delete(queriesTable)
              .where(inArray(queriesTable.projectId, projectIds));
          }

          if (structIds.length > 0) {
            await tx
              .delete(modelsTable)
              .where(inArray(modelsTable.structId, structIds));

            await tx
              .delete(mconfigsTable)
              .where(inArray(mconfigsTable.structId, structIds));

            await tx
              .delete(dashboardsTable)
              .where(inArray(dashboardsTable.structId, structIds));
          }

          if (userIds.length > 0) {
            await tx
              .delete(avatarsTable)
              .where(inArray(avatarsTable.userId, userIds));
          }
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
