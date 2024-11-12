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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { evsTable } from '~backend/drizzle/postgres/schema/evs';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { structsTable } from '~backend/drizzle/postgres/schema/structs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { vizsTable } from '~backend/drizzle/postgres/schema/vizs';
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
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords)
  async deleteRecords(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendDeleteRecordsRequest = request.body;

    let { orgIds, projectIds, emails, orgNames, projectNames } =
      reqValid.payload;

    emails = emails || [];
    projectIds = projectIds || [];
    orgIds = orgIds || [];

    let structIds: string[] = [];
    let userIds: string[] = [];

    if (common.isDefined(projectNames) && projectNames.length > 0) {
      let projects = await this.db.drizzle.query.projectsTable.findMany({
        where: and(
          inArray(projectsTable.orgId, orgIds),
          inArray(projectsTable.name, projectNames)
        )
      });

      // let projects = await this.projectsRepository.find({
      //   where: {
      //     org_id: In(orgIds),
      //     name: In(projectNames)
      //   }
      // });
      if (projects.length > 0) {
        projectIds = [...projectIds, ...projects.map(x => x.projectId)];
      }
    }

    if (common.isDefined(orgNames) && orgNames.length > 0) {
      let orgs = await this.db.drizzle.query.orgsTable.findMany({
        where: inArray(orgsTable.name, orgNames)
      });

      // let orgs = await this.orgsRepository.find({
      //   where: { name: In(orgNames) }
      // });

      if (orgs.length > 0) {
        orgIds = [...orgIds, ...orgs.map(x => x.orgId)];
      }
    }

    if (orgIds.length > 0) {
      await asyncPool(1, orgIds, async (x: string) => {
        let deleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: x
          }
        };

        await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrgResponse>({
          routingKey: helper.makeRoutingKeyToDisk({
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

        // let user = await this.usersRepository.findOne({
        //   where: { email: email }
        // });

        if (common.isDefined(user)) {
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

    // await this.structsRepository.find({
    //     where: {
    //       project_id: In(projectIds)
    //     }
    //   });

    structIds = structs.map(struct => struct.structId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (userIds.length > 0) {
            await tx
              .delete(usersTable)
              .where(inArray(usersTable.userId, userIds));

            // await this.usersRepository.delete({ user_id: In(userIds) });
          }
          if (orgIds.length > 0) {
            await tx.delete(orgsTable).where(inArray(orgsTable.orgId, orgIds));

            // await this.orgsRepository.delete({ org_id: In(orgIds) });
          }
          if (projectIds.length > 0) {
            await tx
              .delete(projectsTable)
              .where(inArray(projectsTable.projectId, projectIds));

            // await this.projectsRepository.delete({
            //   project_id: In(projectIds)
            // });
          }
          if (userIds.length > 0) {
            await tx
              .delete(membersTable)
              .where(inArray(membersTable.memberId, userIds));

            // await this.membersRepository.delete({ member_id: In(userIds) });
          }
          if (projectIds.length > 0) {
            await tx
              .delete(connectionsTable)
              .where(inArray(connectionsTable.projectId, projectIds));

            // await this.connectionsRepository.delete({
            //   project_id: In(projectIds)
            // });
          }
          if (structIds.length > 0) {
            await tx
              .delete(structsTable)
              .where(inArray(structsTable.structId, structIds));

            // await this.structsRepository.delete({ struct_id: In(structIds) });
          }
          if (projectIds.length > 0) {
            await tx
              .delete(branchesTable)
              .where(inArray(branchesTable.projectId, projectIds));

            // await this.branchesRepository.delete({
            //   project_id: In(projectIds)
            // });

            await tx
              .delete(bridgesTable)
              .where(inArray(bridgesTable.projectId, projectIds));

            // await this.bridgesRepository.delete({ project_id: In(projectIds) });

            await tx
              .delete(envsTable)
              .where(inArray(envsTable.projectId, projectIds));

            // await this.envsRepository.delete({ project_id: In(projectIds) });

            await tx
              .delete(evsTable)
              .where(inArray(evsTable.projectId, projectIds));

            // await this.evsRepository.delete({ project_id: In(projectIds) });
          }
          if (structIds.length > 0) {
            await tx
              .delete(vizsTable)
              .where(inArray(vizsTable.structId, structIds));

            // await this.vizsRepository.delete({ struct_id: In(structIds) });
          }
          if (projectIds.length > 0) {
            await tx
              .delete(queriesTable)
              .where(inArray(queriesTable.projectId, projectIds));

            // await this.queriesRepository.delete({ project_id: In(projectIds) });
          }

          if (structIds.length > 0) {
            await tx
              .delete(modelsTable)
              .where(inArray(modelsTable.structId, structIds));

            // await this.modelsRepository.delete({ struct_id: In(structIds) });

            await tx
              .delete(metricsTable)
              .where(inArray(metricsTable.structId, structIds));

            // await this.metricsRepository.delete({ struct_id: In(structIds) });

            await tx
              .delete(mconfigsTable)
              .where(inArray(mconfigsTable.structId, structIds));

            // await this.mconfigsRepository.delete({ struct_id: In(structIds) });

            await tx
              .delete(dashboardsTable)
              .where(inArray(dashboardsTable.structId, structIds));

            // await this.dashboardsRepository.delete({
            //   struct_id: In(structIds)
            // });
          }

          if (userIds.length > 0) {
            await tx
              .delete(avatarsTable)
              .where(inArray(avatarsTable.userId, userIds));

            // await this.avatarsRepository.delete({ user_id: In(userIds) });
          }
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload: apiToBackend.ToBackendDeleteRecordsResponse['payload'] = {};

    return payload;
  }
}
